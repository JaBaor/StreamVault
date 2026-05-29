const movieModel = require("../models/movieModel");
const { NotFoundError, ForbiddenError } = require("../errors/errors");

exports.getAllMovies = async (req, res) => {
  const { page, limit, genre_id, release_year, sort } = req.query;

  const result = await movieModel.getAllMovies({ page, limit, genre_id, release_year, sort });

  res.json(result);
};

//GET /api/v1/movies/search?q=...
exports.searchMovies = async (req, res) => {
  const { q, page, limit } = req.query;

  const result = await movieModel.searchMovies({ q, page, limit });
  res.json(result);
};

//GET /api/v1/movies/:id
exports.getMovieById = async (req, res) => {
  const movie = await movieModel.getMovieById(req.params.id);
  if (!movie) throw new NotFoundError("Movie");

  // Increment view count in background — don't await, don't block the response
  movieModel.incrementViewCount(req.params.id).catch(console.error);

  res.json(movie);
};

//POST /api/v1/movies — admin only 
exports.createMovie = async (req, res) => {
  const movie = await movieModel.createMovie(req.body);
  res.status(201).json(movie);
};

//PUT /api/v1/movies/:id — admin only 
exports.updateMovie = async (req, res) => {
  const existing = await movieModel.getMovieById(req.params.id);
  if (!existing) throw new NotFoundError("Movie");

  const updated = await movieModel.updateMovie(req.params.id, req.body);
  res.json(updated);
};

//DELETE /api/v1/movies/:id — admin only (soft delete)
exports.deleteMovie = async (req, res) => {
  const deleted = await movieModel.softDeleteMovie(req.params.id);
  if (!deleted) throw new NotFoundError("Movie");

  res.json({ message: "Movie deleted successfully" });
};