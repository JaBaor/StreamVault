const express     = require("express");
const router      = express.Router({ mergeParams: true }); // ← key option
const ctrl        = require("../controllers/reviewController");
const verifyToken = require("../middleware/verifyToken");
const validate    = require("../middleware/validate");
const {
  movieIdParam,
  ratingRules,
  reviewRules,
  paginationRules,
} = require("../middleware/validators/reviewValidators");

// GET endpoints are public — anyone can see ratings/reviews
router.get("/ratings", movieIdParam, validate, ctrl.getRatings);
router.get("/reviews", movieIdParam, paginationRules, validate, ctrl.getReviews);

// POST endpoints require login
router.post("/rating",  verifyToken, movieIdParam, ratingRules, validate, ctrl.submitRating);
router.post("/reviews", verifyToken, movieIdParam, reviewRules, validate, ctrl.submitReview);

module.exports = router;