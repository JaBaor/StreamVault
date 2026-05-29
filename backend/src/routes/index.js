const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const movieRoutes = require("./movieRoutes");

router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);

module.exports = router;