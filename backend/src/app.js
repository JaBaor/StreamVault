const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const path = require("path");

const { NotFoundError } = require("./errors/errors");
const corsOptions = require("./config/corsOptions");
const v1Router = require("./routes/index");
const errorHandler =  require("./middleware/errorHandler");

const app = express();  //create the server app

//Midlleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());


app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
//Test route
app.get("/", (req, res)=>{res.json({ message: "Movie API running"});
});
app.use("/api/v1", v1Router);

// ── 404 — no route matched 
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
});


//Global error handler
app.use(errorHandler);

module.exports = app;