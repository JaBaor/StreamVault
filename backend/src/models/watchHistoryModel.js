const pool = require("../config/db");

//UPSERT progress 
// ON DUPLICATE KEY UPDATE fires when the UNIQUE KEY (user_id, movie_id) collides.
// watched_at updates automatically because of ON UPDATE CURRENT_TIMESTAMP.
async function upsertProgress(userId, movieId, progressSeconds) {
  await pool.query(
    `INSERT INTO Watch_History (user_id, movie_id, progress_seconds)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       progress_seconds = VALUES(progress_seconds)`,
    [userId, movieId, progressSeconds]
  );
}

//GET paginated history 
async function getHistory(userId, { page = 1, limit = 10 }) {
  const offset = (Number(page) - 1) * Number(limit);

  const [[history], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT wh.history_id, wh.progress_seconds, wh.watched_at,
              m.movie_id, m.title, m.duration, m.poster_url,
              MIN(mg.genre_id) AS genre_id,
              GROUP_CONCAT(DISTINCT g.name SEPARATOR ', ') AS genre_name
       FROM   Watch_History wh
       JOIN   Movies m  ON wh.movie_id  = m.movie_id
       LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
       LEFT JOIN Genres g ON mg.genre_id = g.genre_id
       WHERE  wh.user_id = ?
       GROUP BY wh.history_id
       ORDER BY wh.watched_at DESC
       LIMIT  ? OFFSET ?`,
      [userId, Number(limit), offset]
    ),
    pool.query(
      "SELECT COUNT(*) AS total FROM Watch_History WHERE user_id = ?",
      [userId]
    ),
  ]);

  return {
    data: history,
    pagination: {
      total:      Number(total),
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(Number(total) / Number(limit)),
    },
  };
}

// DELETE single entry 
// The user_id check prevents users from deleting each other's history
async function deleteEntry(historyId, userId) {
  const [result] = await pool.query(
    "DELETE FROM Watch_History WHERE history_id = ? AND user_id = ?",
    [historyId, userId]
  );
  return result.affectedRows > 0;
}

//DELETE all history for user 
async function clearHistory(userId) {
  const [result] = await pool.query(
    "DELETE FROM Watch_History WHERE user_id = ?",
    [userId]
  );
  return result.affectedRows; // how many rows were deleted
}

module.exports = { upsertProgress, getHistory, deleteEntry, clearHistory };
