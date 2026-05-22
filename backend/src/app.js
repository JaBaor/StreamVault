const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const movieRoutes = require("./routes/movieRoutes");

const app = express();  //create the server app

//Midlleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"))

//Test route
app.get("/", (req, res)=>{
  res.json({
    message: "Movie API running"
  });
});

app.use("/api/movies", movieRoutes);

module.exports = app;