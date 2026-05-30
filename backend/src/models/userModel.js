const pool = require("../config/db");

async function createUser(username, email, hashedPassword, role = 'member'){
  const[result] = await pool.query(
    "INSERT INTO users (username, email, password_hash, role) VALUES (?,?,?,?)",
    [username, email, hashedPassword, role]
    
  );
  return result.insertId;
}

async function getUserByUsername(username){
  const[rows] = await pool.query(
    "SELECT * FROM users WHERE username = ? AND deleted_at IS NULL",
    [username]
  );
  return rows[0]          //returns user object if found otherwise undefined
}

async function saveRefreshToken(userId, token, expiresAt){
  await pool.query(
    "UPDATE users SET refresh_token = ?, refresh_token_expires = ? WHERE user_id = ?",
    [token, expiresAt, userId]
  );
}

async function getUserByRefreshToken(token){
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE refresh_token = ?",
    [token]
  );
  return rows[0];
}
  async function clearRefreshToken(userId){
    await pool.query(
      "UPDATE users SET refresh_token = NULL, refresh_token_expires = NULL WHERE user_id = ?",
      [userId]
    );
}

//GET by id — never return password_hash or refresh_token 
async function getUserById(userId) {
  const [rows] = await pool.query(
    `SELECT user_id, username, email, role, status, avatar_url, created_at
     FROM   Users WHERE user_id = ?`,
    [userId]
  );
  return rows[0];
}

//UPDATE profile
async function updateProfile(userId, fields) {
  const allowed    = ["username", "email", "avatar_url"];
  const setClauses = [];
  const params     = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      params.push(fields[key]);
    }
  }

  if (setClauses.length === 0) return getUserById(userId);

  params.push(userId);
  await pool.query(
    `UPDATE Users SET ${setClauses.join(", ")} WHERE user_id = ?`,
    params
  );
  return getUserById(userId);
}

//UPDATE password 
async function updatePassword(userId, newHashedPassword) {
  await pool.query(
    "UPDATE Users SET password_hash = ? WHERE user_id = ?",
    [newHashedPassword, userId]
  );
}

// ── GET full user record including password_hash (for password verification)
async function getUserWithPasswordById(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM Users WHERE user_id = ?",
    [userId]
  );
  return rows[0];
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
};