require("./config/env");

const app = require("./app");
const pool = require("./config/db");
const { startCronJobs } = require("./services/cronService");
const PORT = process.env.PORT || 5000;

async function startServer(){
  try{
    const connection = await pool.getConnection();

    console.log("MySQL connected");
    
    await connection.query("ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT").catch(() => {});
    console.log("Migration: avatar_url column widened");

    await connection.query("ALTER TABLE videos MODIFY COLUMN thumbnail_url LONGTEXT").catch(() => {});
    console.log("Migration: thumbnail_url column widened");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS series_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});
    console.log("Migration: series_groups table created");

    await connection.query(`
      ALTER TABLE videos
      ADD COLUMN series_group_id INT DEFAULT NULL,
      ADD COLUMN season_number INT DEFAULT NULL
    `).catch(() => {});
    console.log("Migration: series_group_id + season_number columns added");

    connection.release();

    startCronJobs();

    app.listen(PORT, ()=>{
      console.log(`Server running on port${PORT}`);
    });
  } catch(error){
    console.error("Database connection failed: ", error);
  }
}

startServer();