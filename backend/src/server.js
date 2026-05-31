require("./config/env");

const app = require("./app");
const pool = require("./config/db");
const { startCronJobs } = require("./services/cronService");
const PORT = process.env.PORT || 5000;

async function startServer(){
  try{
    const connection = await pool.getConnection();

    console.log("MySQL connected");
    
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