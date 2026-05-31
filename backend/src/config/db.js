const mysql = require("mysql2/promise");
require("./env");

function parseDatabaseUrl(dbUrl) {
  try {
    const { URL } = require("url");
    const u = new URL(dbUrl);
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname ? u.pathname.replace(/^\//, "") : undefined
    };
  } catch (e) {
    return null;
  }
}

const dbUrl = process.env.DATABASE_URL || process.env.DB_URL || process.env.MYSQL_URL;
const parsed = dbUrl ? parseDatabaseUrl(dbUrl) : null;

const pool = mysql.createPool({
  host: parsed?.host || process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
  port: parsed?.port || Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306,
  user: parsed?.user || process.env.DB_USER || process.env.MYSQLUSER,
  password: parsed?.password || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: parsed?.database || process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
