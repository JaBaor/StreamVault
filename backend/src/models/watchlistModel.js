const pool = require("../config/db");

async function addMovie(userId, movieId) {
  await pool.query(
    "INSERT IGNORE INTO watchlist (user_id, video_id) VALUES (?, ?)",
    [userId, movieId]
  );
}

async function removeMovie(userId, movieId) {
  const [result] = await pool.query(
    "DELETE FROM watchlist WHERE user_id = ? AND video_id = ?",
    [userId, movieId]
  );
  return result.affectedRows > 0;
}

async function getWatchlist(userId, { page = 1, limit = 10 }) {
  const safeLimit = Math.min(Number(limit) || 10, 100);
  const offset = ((Number(page) || 1) - 1) * safeLimit;

  const [[movies], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT v.id, v.id AS movie_id, v.title, v.release_year,
              v.duration_seconds AS duration, v.thumbnail_url AS poster_url,
              v.view_count, wl.added_at,
              MIN(vg.genre_id) AS genre_id,
              GROUP_CONCAT(DISTINCT g.name SEPARATOR ', ') AS genre_name
       FROM watchlist wl
       JOIN videos v ON wl.video_id = v.id AND v.status = 'ACTIVE'
       LEFT JOIN video_genres vg ON v.id = vg.video_id
       LEFT JOIN genres g ON vg.genre_id = g.id
       WHERE wl.user_id = ?
       GROUP BY v.id, wl.added_at
       ORDER BY wl.added_at DESC
       LIMIT ? OFFSET ?`,
      [userId, safeLimit, offset]
    ),
    pool.query(
      `SELECT COUNT(*) AS total
       FROM watchlist wl
       JOIN videos v ON wl.video_id = v.id AND v.status = 'ACTIVE'
       WHERE wl.user_id = ?`,
      [userId]
    ),
  ]);

  return {
    data: movies,
    pagination: {
      total: Number(total),
      page: Number(page) || 1,
      limit: safeLimit,
      totalPages: Math.ceil(Number(total) / safeLimit),
    },
  };
}

module.exports = { addMovie, removeMovie, getWatchlist };
