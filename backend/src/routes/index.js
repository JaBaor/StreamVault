const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const movieRoutes = require("./movieRoutes");
const genreRoutes = require("./genreRoutes");

router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);
router.use("/genres", genreRoutes);
module.exports = router;