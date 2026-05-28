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
    "SELECT *FROM users WHERE refresh_token = ?",
    [token]
  );
  return rows[0];
}
  async function clearRefreshToken(userId){
    await pool.query(
      "UPDATE Users GET refresh_token = NULL, refresh_token_expires = NULL WHERE user_id = ?"
    );
}

module.exports = {
  createUser,
  getUserByUsername,
  saveRefreshToken,
  getUserByRefreshToken,
  clearRefreshToken
};