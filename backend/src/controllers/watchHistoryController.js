const watchHistoryModel = require("../models/watchHistoryModel");
const movieModel        = require("../models/movieModel");
const { NotFoundError } = require("../errors/errors");

//POST /api/v1/watch-history 
exports.upsertProgress = async (req, res) => {
  const { movieId, progressSeconds } = req.body;
  const userId = req.user.id; // from verifyToken

  // Confirm the movie actually exists before logging it
  const movie = await movieModel.getMovieById(movieId);
  if (!movie) throw new NotFoundError("Movie");

  await watchHistoryModel.upsertProgress(userId, movieId, progressSeconds);
  res.json({ message: "Progress saved" });
};

//GET /api/v1/watch-history 
exports.getHistory = async (req, res) => {
  const result = await watchHistoryModel.getHistory(req.user.id, req.query);
  res.json(result);
};

//DELETE /api/v1/watch-history/:id 
exports.deleteEntry = async (req, res) => {
  const deleted = await watchHistoryModel.deleteEntry(req.params.id, req.user.id);
  if (!deleted) throw new NotFoundError("Watch history entry");
  res.json({ message: "Entry removed" });
};

// ── DELETE /api/v1/watch-history 
exports.clearHistory = async (req, res) => {
  const count = await watchHistoryModel.clearHistory(req.user.id);
  res.json({ message: `Cleared ${count} entr${count === 1 ? "y" : "ies"}` });
};