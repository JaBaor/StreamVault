const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const movieRoutes = require("./movieRoutes");
const genreRoutes = require("./genreRoutes");
const watchHistoryRoutes = require("./watchHistoryRoutes");
const watchlistRoutes    = require("./watchlistRoutes");
const reviewRoutes       = require("./reviewRoutes");
const userRoutes         = require("./userRoutes");
const adminRoutes        = require("./adminRoutes");

router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);
router.use("/genres", genreRoutes);
router.use("/watch-history", watchHistoryRoutes);
router.use("/watchlist", watchlistRoutes);
router.use("/movies/:movieId", reviewRoutes);   // ← mergeParams on reviewRoutes handles :movieId
router.use("/users", userRoutes);
router.use("/admin", adminRoutes); 

module.exports = router;