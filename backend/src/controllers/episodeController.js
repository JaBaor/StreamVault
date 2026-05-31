const episodeModel = require("../models/episodeModel");
const movieModel = require("../models/movieModel");
const { NotFoundError } = require("../errors/errors");

// GET /api/v1/movies/:movieId/episodes
exports.getEpisodes = async (req, res) => {
  const movie = await movieModel.getMovieById(req.params.movieId);
  if (!movie) throw new NotFoundError("Movie");

  const episodes = await episodeModel.getEpisodesByVideoId(req.params.movieId);
  res.json({ data: episodes });
};

// GET /api/v1/movies/:movieId/episodes/:episodeId
exports.getEpisode = async (req, res) => {
  const episode = await episodeModel.getEpisodeById(req.params.episodeId);
  if (!episode) throw new NotFoundError("Episode");
  res.json(episode);
};

// POST /api/v1/movies/:movieId/episodes
exports.createEpisode = async (req, res) => {
  const movie = await movieModel.getMovieById(req.params.movieId);
  if (!movie) throw new NotFoundError("Movie");

  const episode = await episodeModel.createEpisode({
    ...req.body,
    video_id: req.params.movieId,
  });
  res.status(201).json(episode);
};

// PUT /api/v1/movies/:movieId/episodes/:episodeId
exports.updateEpisode = async (req, res) => {
  const existing = await episodeModel.getEpisodeById(req.params.episodeId);
  if (!existing) throw new NotFoundError("Episode");

  const updated = await episodeModel.updateEpisode(req.params.episodeId, req.body);
  res.json(updated);
};

// DELETE /api/v1/movies/:movieId/episodes/:episodeId
exports.deleteEpisode = async (req, res) => {
  const deleted = await episodeModel.softDeleteEpisode(req.params.episodeId);
  if (!deleted) throw new NotFoundError("Episode");
  res.json({ message: "Episode deleted successfully" });
};
