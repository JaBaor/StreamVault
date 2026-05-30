const pool = require("../config/db");

function toDbPlan(plan) {
  const value = String(plan).toUpperCase();
  if (value === "PREMIUM_MONTHLY" || value === "PREMIUM_YEARLY" || value === "FREE") return value;
  return String(plan).toLowerCase() === "free" ? "FREE" : value;
}

async function getByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT *, LOWER(plan) AS plan, LOWER(status) AS status, end_date AS expires_at
     FROM subscriptions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0];
}

async function upsert(userId, plan, expiresAt) {
  await pool.query(
    "UPDATE subscriptions SET status = 'CANCELLED' WHERE user_id = ? AND status = 'ACTIVE'",
    [userId]
  );
  await pool.query(
    `INSERT INTO subscriptions (user_id, plan, status, start_date, end_date)
     VALUES (?, ?, 'ACTIVE', NOW(), ?)`,
    [userId, toDbPlan(plan), expiresAt]
  );
  return getByUserId(userId);
}

async function cancel(userId) {
  await pool.query(
    "UPDATE subscriptions SET status = 'CANCELLED' WHERE user_id = ? AND status = 'ACTIVE'",
    [userId]
  );
  await pool.query(
    `INSERT INTO subscriptions (user_id, plan, status, start_date, end_date)
     VALUES (?, 'FREE', 'ACTIVE', NOW(), NULL)`,
    [userId]
  );
}

module.exports = { getByUserId, upsert, cancel };
