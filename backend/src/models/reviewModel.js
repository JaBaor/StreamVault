const pool = require("../config/db");

async function upsertRating(userId, movieId, rating) {
  await pool.query(
    `INSERT INTO reviews (user_id, video_id, rating)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
    [userId, movieId, rating]
  );
}

async function getRatingStats(movieId) {
  const [[stats]] = await pool.query(
    `SELECT ROUND(AVG(rating), 1) AS average, COUNT(rating) AS count
     FROM reviews
     WHERE video_id = ?`,
    [movieId]
  );
  return {
    average: stats.average ? Number(stats.average) : null,
    count: Number(stats.count),
  };
}

async function upsertReview(userId, movieId, comment, rating) {
  await pool.query(
    `INSERT INTO reviews (user_id, video_id, rating, review_text)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       rating = VALUES(rating),
       review_text = VALUES(review_text),
       created_at = CURRENT_TIMESTAMP`,
    [userId, movieId, rating, comment]
  );
}

async function getReviews(movieId, { page = 1, limit = 10 }) {
  const safeLimit = Math.min(Number(limit) || 10, 100);
  const offset = ((Number(page) || 1) - 1) * safeLimit;

  const [[reviews], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT r.id AS review_id, r.rating, r.review_text AS comment, r.created_at,
              u.id AS user_id, u.display_name AS username, u.avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.video_id = ? AND r.review_text IS NOT NULL
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [movieId, safeLimit, offset]
    ),
    pool.query(
      "SELECT COUNT(*) AS total FROM reviews WHERE video_id = ? AND review_text IS NOT NULL",
      [movieId]
    ),
  ]);

  return {
    data: reviews,
    pagination: {
      total: Number(total),
      page: Number(page) || 1,
      limit: safeLimit,
      totalPages: Math.ceil(Number(total) / safeLimit),
    },
  };
}

module.exports = { upsertRating, getRatingStats, upsertReview, getReviews };
