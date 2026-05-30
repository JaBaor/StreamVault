const genreModel = require("../models/genreModel");
const { NotFoundError, ConflictError } = require("../errors/errors");
const logAudit = require("../utils/auditLog");
// GET /api/v1/genres 
exports.getAllGenres = async (req, res) => {
  const genres = await genreModel.getAllGenres();
  res.json(genres);
};

//GET /api/v1/genres/:id 
exports.getGenreById = async (req, res) => {
  const genre = await genreModel.getGenreById(req.params.id);
  if (!genre) throw new NotFoundError("Genre");
  res.json(genre);
};

//POST /api/v1/genres — admin only 
exports.createGenre = async (req, res) => {
  // ER_DUP_ENTRY from MySQL is caught by errorHandler automatically
  const genre = await genreModel.createGenre(req.body.name);
  await logAudit({
    userId:     req.user.id,
    action:     "CREATE",
    entityType: "Movie",
    entityId:   movie.movie_id,
    details:    { title: movie.title },
  });
  res.status(201).json(genre);
};

// PUT /api/v1/genres/:id — admin only
exports.updateGenre = async (req, res) => {
  const existing = await genreModel.getGenreById(req.params.id);
  if (!existing) throw new NotFoundError("Genre");

  const updated = await genreModel.updateGenre(req.params.id, req.body.name);
  await logAudit({
    userId:     req.user.id,
    action:     "CREATE",
    entityType: "Movie",
    entityId:   movie.movie_id,
    details:    { title: movie.title },
  });
  res.json(updated);
};

//DELETE /api/v1/genres/:id — admin only 
exports.deleteGenre = async (req, res) => {
  const existing = await genreModel.getGenreById(req.params.id);
  if (!existing) throw new NotFoundError("Genre");

  // Block deletion if active movies still reference this genre
  const movieCount = await genreModel.getMovieCountByGenre(req.params.id);
  if (movieCount > 0) {
    throw new ConflictError(
      `Cannot delete genre — ${movieCount} movie(s) still use it. Reassign them first.`
    );
  }

  await genreModel.deleteGenre(req.params.id);
  await logAudit({
    userId:     req.user.id,
    action:     "CREATE",
    entityType: "Movie",
    entityId:   movie.movie_id,
    details:    { title: movie.title },
  });
  res.json({ message: "Genre deleted successfully" });
};