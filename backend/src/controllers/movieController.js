const movieModel = require("../models/movieModel");
const { NotFoundError, ForbiddenError } = require("../errors/errors");
const logAudit = require("../utils/auditLog");
const accessControlService = require("../services/accessControlService");
const optionalAuth         = require("../middleware/optionalAuth");

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
  await logAudit({
    userId:     req.user.id,
    action:     "CREATE",
    entityType: "Movie",
    entityId:   movie.movie_id,
    details:    { title: movie.title },
  });
  res.status(201).json(movie);
};

//PUT /api/v1/movies/:id — admin only 
exports.updateMovie = async (req, res) => {
  const existing = await movieModel.getMovieById(req.params.id);
  if (!existing) throw new NotFoundError("Movie");

  const updated = await movieModel.updateMovie(req.params.id, req.body);
  await logAudit({
    userId:     req.user.id,
    action:     "UPDATE",
    entityType: "Movie",
    entityId:   req.params.id,
    details:    { title: updated?.title || existing?.title },
  });

  res.json(updated);
};

//DELETE /api/v1/movies/:id — admin only (soft delete)
exports.deleteMovie = async (req, res) => {
  const deleted = await movieModel.softDeleteMovie(req.params.id);
  if (!deleted) throw new NotFoundError("Movie");
  
  await logAudit({
    userId:     req.user.id,
    action:     "DELETE",
    entityType: "Movie",
    entityId:   req.params.id,
    details:    { id: req.params.id },
  });

  res.json({ message: "Movie deleted successfully" });
};

// ── GET /api/v1/movies/:id/watch 
exports.watchMovie = async (req, res) => {
  const movie = await movieModel.getMovieById(req.params.id);
  if (!movie) throw new NotFoundError("Movie");

  const [fullRows] = await require("../config/db").query(
    "SELECT video_url, access_level, age_rating FROM Movies WHERE movie_id = ?",
    [req.params.id]
  );
  const fullMovie = { ...movie, ...fullRows[0] };

  const result = await accessControlService.canWatch(
    req.user ? req.user.id : null,
    fullMovie
  );

  if (!result.allowed) {
    return res.status(403).json({
      code:            result.code,
      message:         result.message,
      ...(result.previewSeconds && { previewSeconds: result.previewSeconds }),
      ...(result.plans          && { availablePlans: result.plans }),
    });
  }

  movieModel.incrementViewCount(req.params.id).catch(console.error);

  res.json({
    videoUrl:                   result.videoUrl,
    ...(result.warning             && { warning: result.warning }),
    ...(result.subscription        && { subscription: result.subscription }),
    ...(result.requiresAgeConfirmation && { requiresAgeConfirmation: true }),
  });
};

// ── GET /api/v1/movies/trending 
exports.getTrending = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const [rows] = await require("../config/db").query(
    `SELECT m.movie_id, m.title, m.release_year, m.poster_url, m.view_count, 
            MIN(mg.genre_id) AS genre_id,
            GROUP_CONCAT(DISTINCT g.name SEPARATOR ', ') AS genre_name,
            COUNT(DISTINCT wh.history_id) AS views_last_7_days
     FROM   Movies m
     LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
     LEFT JOIN Genres g        ON mg.genre_id = g.genre_id
     LEFT JOIN Watch_History wh
            ON wh.movie_id = m.movie_id
           AND wh.watched_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     WHERE  m.status = 'active'
     GROUP BY m.movie_id
     ORDER BY views_last_7_days DESC, m.view_count DESC
     LIMIT  ?`,
    [limit]
  );

  res.json(rows);
};

// ── GET /api/v1/movies/recommendations 
exports.getRecommendations = async (req, res) => {
  const userId = req.user.id;
  const limit  = Math.min(Number(req.query.limit) || 10, 30);
  const pool   = require("../config/db");


  const [[topGenre]] = await pool.query(
    `SELECT mg.genre_id AS genre_id, COUNT(*) AS watch_count
     FROM   Watch_History wh
     JOIN   movie_genres mg ON wh.movie_id = mg.movie_id
     WHERE  wh.user_id = ?
     GROUP BY mg.genre_id
     ORDER BY watch_count DESC
     LIMIT  1`,
    [userId]
  );

  let movies;

  if (topGenre) {
  
    [movies] = await pool.query(
      `SELECT m.movie_id, m.title, m.release_year, m.poster_url, m.view_count, 
              MIN(mg.genre_id) AS genre_id,
              GROUP_CONCAT(DISTINCT g.name SEPARATOR ', ') AS genre_name
       FROM   Movies m
       LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
       LEFT JOIN Genres g        ON mg.genre_id = g.genre_id
       WHERE  m.status   = 'active'
         AND  mg.genre_id = ?
         AND  m.movie_id NOT IN (
           SELECT movie_id FROM Watch_History WHERE user_id = ?
         )
       GROUP BY m.movie_id
       ORDER BY m.view_count DESC
       LIMIT  ?`,
      [topGenre.genre_id, userId, limit]
    );
  } else {
  
    [movies] = await pool.query(
      `SELECT m.movie_id, m.title, m.release_year, m.poster_url, m.view_count, 
              MIN(mg.genre_id) AS genre_id,
              GROUP_CONCAT(DISTINCT g.name SEPARATOR ', ') AS genre_name
       FROM   Movies m
       LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
       LEFT JOIN Genres g        ON mg.genre_id = g.genre_id
       WHERE  m.status = 'active'
       GROUP BY m.movie_id
       ORDER BY m.view_count DESC
       LIMIT  ?`,
      [limit]
    );
  }

  res.json({
    basedOn:      topGenre ? "watch_history" : "popularity",
    genreId:      topGenre?.genre_id || null,
    data:         movies,
  });
};
