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