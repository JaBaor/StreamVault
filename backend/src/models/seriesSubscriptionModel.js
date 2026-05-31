const pool = require("../config/db");

async function subscribe(userId, videoId) {
  await pool.query(
    "INSERT IGNORE INTO series_subscriptions (user_id, video_id) VALUES (?, ?)",
    [userId, videoId]
  );
}

async function unsubscribe(userId, videoId) {
  await pool.query(
    "DELETE FROM series_subscriptions WHERE user_id = ? AND video_id = ?",
    [userId, videoId]
  );
}

async function getSubscribers(videoId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.email, u.display_name FROM series_subscriptions ss
     JOIN users u ON ss.user_id = u.id
     WHERE ss.video_id = ?`,
    [videoId]
  );
  return rows;
}

async function isSubscribed(userId, videoId) {
  const [rows] = await pool.query(
    "SELECT 1 FROM series_subscriptions WHERE user_id = ? AND video_id = ?",
    [userId, videoId]
  );
  return rows.length > 0;
}

async function getSubscriptions(userId) {
  const [rows] = await pool.query(
    `SELECT ss.video_id, v.title, v.slug, v.thumbnail_url AS poster_url
     FROM series_subscriptions ss
     JOIN videos v ON ss.video_id = v.id
     WHERE ss.user_id = ?`,
    [userId]
  );
  return rows;
}

module.exports = { subscribe, unsubscribe, getSubscribers, isSubscribed, getSubscriptions };
