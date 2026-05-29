const express = require("express");
const router = express.Router();
const authorizationAdmin = require('../middleware/adminAuth');
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

// PUBLIC routes — no auth needed to browse movies
router.get("/",        listMoviesRules,                validate, movieController.getAllMovies);
router.get("/search",  searchMoviesRules,              validate, movieController.searchMovies);

router.get("/:id",     movieIdParam,                   validate, movieController.getMovieById);


// ADMIN only — require both tokens: valid user + admin role
router.post(  "/",     verifyToken, authorizationAdmin, createMovieRules, validate, movieController.createMovie);
router.put(   "/:id",  verifyToken, authorizationAdmin, movieIdParam, updateMovieRules, validate, movieController.updateMovie);
router.delete("/:id",  verifyToken, authorizationAdmin, movieIdParam,                  validate, movieController.deleteMovie);

module.exports = router;