const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("./env");

async function initDb() {
  const host = process.env.DB_HOST || process.env.MYSQLHOST || "localhost";
  const port = Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306;
  const user = process.env.DB_USER || process.env.MYSQLUSER;
  const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD;
  const database = process.env.DB_NAME || process.env.MYSQL_DATABASE;

  let conn;
  try {
    conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });

    const [rows] = await conn.execute(
      `SELECT COUNT(*) AS cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [database]
    );
    if (rows[0].cnt > 0) {
      console.log("[initDb] Tables already exist, skipping init");
      return;
    }

    const schemaPath = path.join(__dirname, "..", "..", "..", "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf8");
      await conn.query(sql);
      console.log("[initDb] Schema applied");
    }

    const seedPath = path.join(__dirname, "..", "..", "..", "seed.sql");
    if (fs.existsSync(seedPath)) {
      const sql = fs.readFileSync(seedPath, "utf8");
      await conn.query(sql);
      console.log("[initDb] Seed data inserted");
    }
  } catch (err) {
    console.error("[initDb] Error:", err.message);
  } finally {
    if (conn) await conn.end();
  }
}

module.exports = initDb;
