const seriesSubModel = require("../models/seriesSubscriptionModel");
const emailService = require("../services/emailService");
const movieModel = require("../models/movieModel");
const notificationModel = require("../models/notificationModel");

exports.subscribe = async (req, res) => {
  await seriesSubModel.subscribe(req.user.id, req.params.movieId);
  res.json({ message: "Subscribed to series updates" });
};

exports.unsubscribe = async (req, res) => {
  await seriesSubModel.unsubscribe(req.user.id, req.params.movieId);
  res.json({ message: "Unsubscribed from series updates" });
};

exports.status = async (req, res) => {
  const subscribed = await seriesSubModel.isSubscribed(req.user.id, req.params.movieId);
  res.json({ subscribed });
};

exports.mySubscriptions = async (req, res) => {
  const list = await seriesSubModel.getSubscriptions(req.user.id);
  res.json({ data: list });
};

exports.notifySubscribers = async (req, res) => {
  const { episodeId } = req.body;
  const movie = await movieModel.getMovieById(req.params.movieId);
  if (!movie) return res.status(404).json({ message: "Movie not found" });

  const [episodes] = await require("../config/db").query(
    "SELECT * FROM episodes WHERE id = ?",
    [episodeId]
  );
  if (!episodes.length) return res.status(404).json({ message: "Episode not found" });

  const subscribers = await seriesSubModel.getSubscribers(req.params.movieId);
  const results = await Promise.allSettled(
    subscribers.map(async (sub) => {
      await notificationModel.createNotification({
        userId: sub.id,
        type: "new_episode",
        title: `New episode: ${movie.title}`,
        message: episodes[0].title || `Episode ${episodes[0].episode_number}`,
      });
      await emailService.sendNewEpisodeAlert(sub, movie, episodes[0]);
    })
  );

  res.json({ notified: results.filter((r) => r.status === "fulfilled").length });
};
