const pool = require("../config/db");

// ── GET subscription for a user 
// Returns undefined if user has never subscribed (treated as free by the service)
async function getByUserId(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM Subscriptions WHERE user_id = ?",
    [userId]
  );
  return rows[0];
}

// ── CREATE or UPDATE subscription (upsert) 

async function upsert(userId, plan, expiresAt) {
  await pool.query(
    `INSERT INTO Subscriptions (user_id, plan, status, started_at, expires_at)
     VALUES (?, ?, 'active', NOW(), ?)
     ON DUPLICATE KEY UPDATE
       plan       = VALUES(plan),
       status     = 'active',
       started_at = NOW(),
       expires_at = VALUES(expires_at)`,
    [userId, plan, expiresAt]
  );
  return getByUserId(userId);
}

// ── CANCEL — revert to free plan 
async function cancel(userId) {
  await pool.query(
    `UPDATE Subscriptions
     SET plan = 'free', status = 'cancelled', expires_at = NULL
     WHERE user_id = ?`,
    [userId]
  );
}

module.exports = { getByUserId, upsert, cancel };