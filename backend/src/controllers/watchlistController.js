const watchlistModel = require("../models/watchlistModel");
const movieModel     = require("../models/movieModel");
const { NotFoundError } = require("../errors/errors");

//POST /api/v1/watchlist/:movieId 
exports.addMovie = async (req, res) => {
  const movie = await movieModel.getMovieById(req.params.movieId);
  if (!movie) throw new NotFoundError("Movie");

  await watchlistModel.addMovie(req.user.id, req.params.movieId);
  res.status(201).json({ message: "Added to watchlist" });
};

//DELETE /api/v1/watchlist/:movieId 
exports.removeMovie = async (req, res) => {
  const removed = await watchlistModel.removeMovie(req.user.id, req.params.movieId);
  if (!removed) throw new NotFoundError("Movie in watchlist");
  res.json({ message: "Removed from watchlist" });
};

//GET /api/v1/watchlist 
exports.getWatchlist = async (req, res) => {
  const result = await watchlistModel.getWatchlist(req.user.id, req.query);
  res.json(result);
};