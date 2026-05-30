const pool = require("../config/db");

async function upsertProgress(userId, movieId, progressSeconds, episodeId = null) {
  const [existing] = await pool.query(
    `SELECT id FROM watch_history
     WHERE user_id = ? AND video_id = ? AND (episode_id <=> ?)
     LIMIT 1`,
    [userId, movieId, episodeId]
  );

  const [[video]] = await pool.query("SELECT duration_seconds FROM videos WHERE id = ?", [movieId]);
  const completed = Boolean(video?.duration_seconds && Number(progressSeconds) >= Number(video.duration_seconds));

  if (existing[0]) {
    await pool.query(
      "UPDATE watch_history SET progress_seconds = ?, completed = ? WHERE id = ?",
      [progressSeconds, completed, existing[0].id]
    );
    return;
  }

  await pool.query(
    "INSERT INTO watch_history (user_id, video_id, episode_id, progress_seconds, completed) VALUES (?, ?, ?, ?, ?)",
    [userId, movieId, episodeId, progressSeconds, completed]
  );
}

async function getHistory(userId, { page = 1, limit = 10 }) {
  const safeLimit = Math.min(Number(limit) || 10, 100);
  const offset = ((Number(page) || 1) - 1) * safeLimit;

  const [[history], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT wh.id AS history_id, wh.id, wh.progress_seconds, wh.completed,
              wh.last_watched_at AS watched_at,
              v.id AS movie_id, v.id AS video_id, v.title,
              v.duration_seconds AS duration, v.thumbnail_url AS poster_url,
              MIN(vg.genre_id) AS genre_id,
              GROUP_CONCAT(DISTINCT g.name SEPARATOR ', ') AS genre_name
       FROM watch_history wh
       JOIN videos v ON wh.video_id = v.id
       LEFT JOIN video_genres vg ON v.id = vg.video_id
       LEFT JOIN genres g ON vg.genre_id = g.id
       WHERE wh.user_id = ?
       GROUP BY wh.id
       ORDER BY wh.last_watched_at DESC
       LIMIT ? OFFSET ?`,
      [userId, safeLimit, offset]
    ),
    pool.query("SELECT COUNT(*) AS total FROM watch_history WHERE user_id = ?", [userId]),
  ]);

  return {
    data: history,
    pagination: {
      total: Number(total),
      page: Number(page) || 1,
      limit: safeLimit,
      totalPages: Math.ceil(Number(total) / safeLimit),
    },
  };
}

async function deleteEntry(historyId, userId) {
  const [result] = await pool.query(
    "DELETE FROM watch_history WHERE id = ? AND user_id = ?",
    [historyId, userId]
  );
  return result.affectedRows > 0;
}

async function clearHistory(userId) {
  const [result] = await pool.query("DELETE FROM watch_history WHERE user_id = ?", [userId]);
  return result.affectedRows;
}

module.exports = { upsertProgress, getHistory, deleteEntry, clearHistory };
