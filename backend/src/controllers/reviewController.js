const reviewModel   = require("../models/reviewModel");
const movieModel    = require("../models/movieModel");
const { NotFoundError } = require("../errors/errors");

// ── Shared: confirm movie exists 
async function requireMovie(movieId) {
  const movie = await movieModel.getMovieById(movieId);
  if (!movie) throw new NotFoundError("Movie");
  return movie;
}

//POST /api/v1/movies/:movieId/rating \
exports.submitRating = async (req, res) => {
  await requireMovie(req.params.movieId);
  await reviewModel.upsertRating(req.user.id, req.params.movieId, req.body.rating);
  res.json({ message: "Rating submitted" });
};

//GET /api/v1/movies/:movieId/ratings \
exports.getRatings = async (req, res) => {
  await requireMovie(req.params.movieId);
  const stats = await reviewModel.getRatingStats(req.params.movieId);
  res.json(stats);
};

//POST /api/v1/movies/:movieId/reviews 
exports.submitReview = async (req, res) => {
  await requireMovie(req.params.movieId);
  await reviewModel.upsertReview(
    req.user.id,
    req.params.movieId,
    req.body.comment,
    req.body.rating
  );
  res.json({ message: "Review submitted" });
};

//GET /api/v1/movies/:movieId/reviews 
exports.getReviews = async (req, res) => {
  await requireMovie(req.params.movieId);
  const result = await reviewModel.getReviews(req.params.movieId, req.query);
  res.json(result);
};
