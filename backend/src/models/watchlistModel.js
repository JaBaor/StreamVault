const pool = require("../config/db");

// Get or create the user's default watchlist
async function getOrCreateDefault(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM Watchlists WHERE user_id = ? LIMIT 1",
    [userId]
  );
  if (rows.length > 0) return rows[0];

  const [result] = await pool.query(
    "INSERT INTO Watchlists (user_id, name) VALUES (?, 'My Watchlist')",
    [userId]
  );
  return { watchlist_id: result.insertId, user_id: userId, name: "My Watchlist" };
}

//ADD movie to watchlist 
async function addMovie(userId, movieId) {
  const wl = await getOrCreateDefault(userId);
  await pool.query(
    "INSERT IGNORE INTO Watchlist_Movies (watchlist_id, movie_id) VALUES (?, ?)",
    [wl.watchlist_id, movieId]
  );
}

//REMOVE movie from watchlist 
async function removeMovie(userId, movieId) {
  const wl = await getOrCreateDefault(userId);
  const [result] = await pool.query(
    "DELETE FROM Watchlist_Movies WHERE watchlist_id = ? AND movie_id = ?",
    [wl.watchlist_id, movieId]
  );
  return result.affectedRows > 0;
}

//GET watchlist — paginated 
// Three-table JOIN: Watchlist_Movies → Movies → Genres
async function getWatchlist(userId, { page = 1, limit = 10 }) {
  const offset = (Number(page) - 1) * Number(limit);
  const wl     = await getOrCreateDefault(userId);

  const [[movies], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT m.movie_id, m.title, m.release_year, m.duration,
              m.poster_url, m.view_count, g.name AS genre_name
       FROM   Watchlist_Movies wm
       JOIN   Movies m  ON wm.movie_id  = m.movie_id AND m.status = 'active'
       LEFT JOIN Genres g ON m.genre_id = g.genre_id
       WHERE  wm.watchlist_id = ?
       LIMIT  ? OFFSET ?`,
      [wl.watchlist_id, Number(limit), offset]
    ),
    pool.query(
      `SELECT COUNT(*) AS total
       FROM   Watchlist_Movies wm
       JOIN   Movies m ON wm.movie_id = m.movie_id AND m.status = 'active'
       WHERE  wm.watchlist_id = ?`,
      [wl.watchlist_id]
    ),
  ]);

  return {
    data: movies,
    pagination: {
      total:      Number(total),
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(Number(total) / Number(limit)),
    },
  };
}

//CHECK if movie is in watchlist 
async function isInWatchlist(userId, movieId) {
  const wl          = await getOrCreateDefault(userId);
  const [[{ count }]] = await pool.query(
    "SELECT COUNT(*) AS count FROM Watchlist_Movies WHERE watchlist_id = ? AND movie_id = ?",
    [wl.watchlist_id, movieId]
  );
  return Number(count) > 0;
}

module.exports = { addMovie, removeMovie, getWatchlist, isInWatchlist };