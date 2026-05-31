const pool = require("../config/db");

async function getUserNotifications(userId, { page = 1, limit = 20 }) {
  const safeLimit = Math.min(Number(limit) || 20, 50);
  const offset = ((Number(page) || 1) - 1) * safeLimit;
  const [[rows], [[{ total }]]] = await Promise.all([
    pool.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [userId, safeLimit, offset]
    ),
    pool.query("SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?", [userId]),
  ]);
  return { data: rows, total: Number(total), page: Number(page), limit: safeLimit };
}

async function createNotification({ userId, type, title, message }) {
  const [result] = await pool.query(
    "INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)",
    [userId, type, title, message || null]
  );
  return result.insertId;
}

async function markAsRead(notificationId, userId) {
  await pool.query("UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?", [
    notificationId,
    userId,
  ]);
}

async function markAllAsRead(userId) {
  await pool.query("UPDATE notifications SET is_read = TRUE WHERE user_id = ?", [userId]);
}

async function getUnreadCount(userId) {
  const [[{ count }]] = await pool.query(
    "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE",
    [userId]
  );
  return Number(count);
}

module.exports = { getUserNotifications, createNotification, markAsRead, markAllAsRead, getUnreadCount };
