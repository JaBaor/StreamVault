const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const {errorHandler} = require("./middleware/errorHandler");

const v1Router = require("./routes/index");

const app = express();  //create the server app

//Midlleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

//Test route
app.get("/", (req, res)=>{
  res.json({
    message: "Movie API running"
  });
});

app.use("/api/v1", v1Router);


app.use(errorHandler);

module.exports = app;