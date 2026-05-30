//SQL for user mamagement and dashboard stats
const pool = require("../config/db");

// ── GET all users — paginated + searchable 
async function getUsers({ page = 1, limit = 20, search }) {
  const offset     = (Number(page) - 1) * Number(limit);
  const conditions = [];
  const params     = [];

  if (search && search.trim()) {
    // Search across username AND email — user may search either
    conditions.push("(u.username LIKE ? OR u.email LIKE ?)");
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [[users], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT user_id, username, email, role, status, avatar_url, created_at
       FROM   Users u
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT  ? OFFSET ?`,
      [...params, Number(limit), offset]
    ),
    pool.query(
      `SELECT COUNT(*) AS total FROM Users u ${whereClause}`,
      params
    ),
  ]);

  return {
    data: users,
    pagination: {
      total:      Number(total),
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(Number(total) / Number(limit)),
    },
  };
}

// ── GET single user by id 
async function getUserById(userId) {
  const [rows] = await pool.query(
    `SELECT user_id, username, email, role, status, avatar_url, created_at
     FROM   Users WHERE user_id = ?`,
    [userId]
  );
  return rows[0];
}

// ── UPDATE role 
async function updateRole(userId, role) {
  const [result] = await pool.query(
    "UPDATE Users SET role = ? WHERE user_id = ?",
    [role, userId]
  );
  return result.affectedRows > 0;
}

// ── UPDATE status 
async function updateStatus(userId, status) {
  const [result] = await pool.query(
    "UPDATE Users SET status = ? WHERE user_id = ?",
    [status, userId]
  );
  return result.affectedRows > 0;
}

// ── GET a specific user's watch history (admin view) 
async function getUserWatchHistory(userId, { page = 1, limit = 20 }) {
  const offset = (Number(page) - 1) * Number(limit);

  const [[history], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT wh.history_id, wh.progress_seconds, wh.watched_at,
              m.movie_id, m.title, m.duration, m.poster_url
       FROM   Watch_History wh
       JOIN   Movies m ON wh.movie_id = m.movie_id
       WHERE  wh.user_id = ?
       ORDER BY wh.watched_at DESC
       LIMIT  ? OFFSET ?`,
      [userId, Number(limit), offset]
    ),
    pool.query(
      "SELECT COUNT(*) AS total FROM Watch_History WHERE user_id = ?",
      [userId]
    ),
  ]);

  return {
    data: history,
    pagination: {
      total:      Number(total),
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(Number(total) / Number(limit)),
    },
  };
}

//
//  DASHBOARD STATS
// 

// ── Snapshot stats — all run in parallel 
async function getStats() {
  const [
    [[{ totalUsers }]],
    [[{ totalMovies }]],
    [[{ totalGenres }]],
    [[{ viewsToday }]],
  ] = await Promise.all([
    pool.query("SELECT COUNT(*) AS totalUsers FROM Users"),
    pool.query("SELECT COUNT(*) AS totalMovies FROM Movies WHERE status = 'active'"),
    pool.query("SELECT COUNT(*) AS totalGenres FROM Genres"),

    // Views today = watch history entries created today
    pool.query(
      `SELECT COUNT(*) AS viewsToday
       FROM   Watch_History
       WHERE  DATE(watched_at) = CURDATE()`
    ),
  ]);

  return {
    totalUsers:  Number(totalUsers),
    totalMovies: Number(totalMovies),
    totalGenres: Number(totalGenres),
    viewsToday:  Number(viewsToday),
  };
}

// ── Daily signup counts for a period r.
async function getSignupStats(period = "week") {
  const days = period === "month" ? 30 : 7;

  // Build a subquery that generates the last N dates as a virtual table.
  // This ensures every day appears in results even if nobody signed up.
  const [rows] = await pool.query(
    `SELECT dates.date, COUNT(u.user_id) AS signups
     FROM (
       -- Generate a row for each of the last N days
       SELECT DATE(DATE_SUB(CURDATE(), INTERVAL seq DAY)) AS date
       FROM (
         SELECT 0 AS seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3
         UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
         UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
         UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
         UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
         UNION SELECT 16 UNION SELECT 17 UNION SELECT 18
         UNION SELECT 19 UNION SELECT 20 UNION SELECT 21
         UNION SELECT 22 UNION SELECT 23 UNION SELECT 24
         UNION SELECT 25 UNION SELECT 26 UNION SELECT 27
         UNION SELECT 28 UNION SELECT 29
       ) seq_table
       WHERE seq < ?
     ) dates
     LEFT JOIN Users u
            ON DATE(u.created_at) = dates.date
     GROUP BY dates.date
     ORDER BY dates.date ASC`,
    [days]
  );

  return rows.map((r) => ({
    date:    r.date,
    signups: Number(r.signups),
  }));
}

// ── Top movies by view count 
async function getTopMovies(limit = 10) {
  const [rows] = await pool.query(
    `SELECT m.movie_id, m.title, m.release_year, m.view_count,
            MIN(mg.genre_id) AS genre_id,
            GROUP_CONCAT(DISTINCT g.name SEPARATOR ', ') AS genre_name
     FROM   Movies m
     LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
     LEFT JOIN Genres g ON mg.genre_id = g.genre_id
     WHERE  m.status = 'active'
     GROUP BY m.movie_id
     ORDER BY m.view_count DESC
     LIMIT  ?`,
    [Number(limit)]
  );
  return rows;
}

module.exports = {
  getUsers,
  getUserById,
  updateRole,
  updateStatus,
  getUserWatchHistory,
  getStats,
  getSignupStats,
  getTopMovies,
};
