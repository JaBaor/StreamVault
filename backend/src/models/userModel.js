const pool = require("../config/db");

const ROLE_MAP = {
  member: "GUEST",
  guest: "GUEST",
  subscriber: "SUBSCRIBER",
  moderator: "MODERATOR",
  admin: "ADMIN",
};

function toDbRole(role = "GUEST") {
  return ROLE_MAP[String(role).toLowerCase()] || String(role).toUpperCase();
}

function mapUser(row) {
  if (!row) return row;
  return {
    ...row,
    user_id: row.user_id ?? row.id,
    username: row.username ?? row.display_name ?? row.email,
  };
}

async function createUser(displayName, email, hashedPassword, role = "GUEST") {
  const [result] = await pool.query(
    "INSERT INTO users (display_name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, TRUE)",
    [displayName || email, email, hashedPassword, toDbRole(role)]
  );
  return result.insertId;
}

async function getUserByUsername(username) {
  const [rows] = await pool.query(
    "SELECT *, id AS user_id, display_name AS username FROM users WHERE (email = ? OR display_name = ?) AND status = 'ACTIVE'",
    [username, username]
  );
  return mapUser(rows[0]);
}

async function saveRefreshToken(userId, token, expiresAt) {
  await pool.query(
    "UPDATE users SET refresh_token = ?, refresh_token_expires = ? WHERE id = ?",
    [token, expiresAt, userId]
  );
}

async function getUserByRefreshToken(token) {
  const [rows] = await pool.query(
    "SELECT *, id AS user_id, display_name AS username FROM users WHERE refresh_token = ?",
    [token]
  );
  return mapUser(rows[0]);
}

async function clearRefreshToken(userId) {
  await pool.query(
    "UPDATE users SET refresh_token = NULL, refresh_token_expires = NULL WHERE id = ?",
    [userId]
  );
}

async function getUserById(userId) {
  const [rows] = await pool.query(
    `SELECT id, id AS user_id, display_name, display_name AS username,
            email, role, status, avatar_url, bio, created_at
     FROM users WHERE id = ?`,
    [userId]
  );
  return mapUser(rows[0]);
}

async function updateProfile(userId, fields) {
  const normalized = { ...fields };
  if (normalized.username !== undefined && normalized.display_name === undefined) {
    normalized.display_name = normalized.username;
  }

  const allowed = ["display_name", "email", "avatar_url", "bio"];
  const setClauses = [];
  const params = [];

  for (const key of allowed) {
    if (normalized[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      params.push(normalized[key]);
    }
  }

  if (setClauses.length === 0) return getUserById(userId);

  await pool.query(`UPDATE users SET ${setClauses.join(", ")} WHERE id = ?`, [...params, userId]);
  return getUserById(userId);
}

async function updatePassword(userId, newHashedPassword) {
  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHashedPassword, userId]);
}

async function getUserWithPasswordById(userId) {
  const [rows] = await pool.query(
    "SELECT *, id AS user_id, display_name AS username FROM users WHERE id = ?",
    [userId]
  );
  return mapUser(rows[0]);
}

module.exports = {
  createUser,
  getUserByUsername,
  saveRefreshToken,
  getUserByRefreshToken,
  clearRefreshToken,
  getUserById,
  updateProfile,
  updatePassword,
  getUserWithPasswordById,
  toDbRole,
  mapUser,
};
