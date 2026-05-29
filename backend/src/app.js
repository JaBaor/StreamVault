const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const v1Router = require("./routes/index");
const errorHandler =  require("./middleware/errorHandler");
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
app.get("/", (req, res)=>{res.json({ message: "Movie API running"});
});
app.use("/api/v1", v1Router);

// ── 404 — no route matched 
// This runs if no route above responded.
// It creates an AppError and passes it to next() so errorHandler formats it.
const { NotFoundError } = require("./errors/errors");
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
});


//Global error handler
app.use(errorHandler);

module.exports = app;