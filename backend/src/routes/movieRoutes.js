const express = require("express");
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const verifyToken = require('../middleware/verifyToken');
const movieController = require("../controllers/movieController");
const validate = require("../middleware/validate");
const {
  listMoviesRules,
  movieIdParam,
  createMovieRules,
  updateMovieRules,
  searchMoviesRules,
} = require("../middleware/validators/movieValidators");
const optionalAuth = require("../middleware/optionalAuth");
const { param }    = require("express-validator");

// PUBLIC routes — no auth needed to browse movies
router.get("/",        listMoviesRules,                validate, movieController.getAllMovies);
router.get("/search",  searchMoviesRules,              validate, movieController.searchMovies);

router.get("/:id",     movieIdParam,                   validate, movieController.getMovieById);


// ADMIN only — require both tokens: valid user + admin role
router.post(  "/",     verifyToken, adminAuth, createMovieRules, validate, movieController.createMovie);
router.get("/trending",        movieController.getTrending);
router.get("/recommendations", verifyToken, movieController.getRecommendations);
router.put(   "/:id",  verifyToken, adminAuth, movieIdParam, updateMovieRules, validate, movieController.updateMovie);
router.delete("/:id",  verifyToken, adminAuth, movieIdParam,                  validate, movieController.deleteMovie);
router.get("/:id/watch",
  movieIdParam, validate,
  optionalAuth,
  movieController.watchMovie
);
module.exports = router;