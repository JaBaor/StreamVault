require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const PORT = process.env.PORT;

connectDB();

//Start server
app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
})