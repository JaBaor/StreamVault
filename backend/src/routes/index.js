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
const subscriptionRoutes = require("./subscriptionRoutes");

router.use("/auth", authRoutes);
router.use("/auth", require("./oauthRoutes"));
router.use("/movies", movieRoutes);
router.use("/genres", genreRoutes);
router.use("/watch-history", watchHistoryRoutes);
router.use("/watchlist", watchlistRoutes);
router.use("/movies/:movieId", reviewRoutes);   
router.use("/movies/:movieId/episodes", require("./episodeRoutes"));
router.use("/movies/:movieId/subscriptions", require("./seriesSubscriptionRoutes"));
router.use("/users", userRoutes);
router.use("/admin", adminRoutes); 
router.use("/subscriptions",   subscriptionRoutes);
router.use("/notifications", require("./notificationRoutes"));

module.exports = router;