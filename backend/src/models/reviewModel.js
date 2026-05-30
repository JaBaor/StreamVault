const pool = require("../config/db");

//UPSERT rating 
// INSERT → if uq_user_movie_review collides → UPDATE rating only
// created_at is NOT updated on re-rating (user keeps their original review date)
async function upsertRating(userId, movieId, rating) {
  await pool.query(
    `INSERT INTO Reviews (user_id, movie_id, rating)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
    [userId, movieId, rating]
  );
}

//GET rating stats for a movie 
async function getRatingStats(movieId) {
  const [[stats]] = await pool.query(
    `SELECT ROUND(AVG(rating), 1) AS average,
            COUNT(rating)         AS count
     FROM   Reviews
     WHERE  movie_id = ? AND rating IS NOT NULL`,
    [movieId]
  );
  return {
    average: stats.average ? Number(stats.average) : null,
    count:   Number(stats.count),
  };
}

//UPSERT review (text comment) 
async function upsertReview(userId, movieId, comment, rating) {
  await pool.query(
    `INSERT INTO Reviews (user_id, movie_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       rating     = VALUES(rating),
       comment    = VALUES(comment),
       created_at = CURRENT_TIMESTAMP`,
    [userId, movieId, rating, comment]
  );
}

//GET paginated reviews for a movie 
async function getReviews(movieId, { page = 1, limit = 10 }) {
  const offset = (Number(page) - 1) * Number(limit);

  const [[reviews], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT r.review_id, r.rating, r.comment, r.created_at,
              u.user_id, u.username, u.avatar_url
       FROM   Reviews r
       JOIN   Users u ON r.user_id = u.user_id
       WHERE  r.movie_id = ? AND r.comment IS NOT NULL
       ORDER BY r.created_at DESC
       LIMIT  ? OFFSET ?`,
      [movieId, Number(limit), offset]
    ),
    pool.query(
      "SELECT COUNT(*) AS total FROM Reviews WHERE movie_id = ? AND comment IS NOT NULL",
      [movieId]
    ),
  ]);

  return {
    data: reviews,
    pagination: {
      total:      Number(total),
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(Number(total) / Number(limit)),
    },
  };
}

module.exports = { upsertRating, getRatingStats, upsertReview, getReviews };
