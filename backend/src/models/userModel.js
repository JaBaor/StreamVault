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
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  return rows[0]          //returns user object if found otherwise undefined
}

module.exports = {
  createUser,
  getUserByUsername
};