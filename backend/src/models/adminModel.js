const pool = require("../config/db");
const { toDbRole } = require("./userModel");

function toDbStatus(status) {
  const value = String(status).toLowerCase();
  if (value === "deactivated" || value === "inactive") return "INACTIVE";
  if (value === "banned") return "BANNED";
  return "ACTIVE";
}

async function getUsers({ page = 1, limit = 20, search }) {
  const safeLimit = Math.min(Number(limit) || 20, 100);
  const offset = ((Number(page) || 1) - 1) * safeLimit;
  const conditions = [];
  const params = [];

  if (search && search.trim()) {
    conditions.push("(u.display_name LIKE ? OR u.email LIKE ?)");
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [[users], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT id, id AS user_id, display_name, display_name AS username,
              email, role, status, avatar_url, created_at
       FROM users u
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    ),
    pool.query(`SELECT COUNT(*) AS total FROM users u ${whereClause}`, params),
  ]);

  return {
    data: users,
    pagination: {
      total: Number(total),
      page: Number(page) || 1,
      limit: safeLimit,
      totalPages: Math.ceil(Number(total) / safeLimit),
    },
  };
}

async function getUserById(userId) {
  const [rows] = await pool.query(
    `SELECT id, id AS user_id, display_name, display_name AS username,
            email, role, status, avatar_url, created_at
     FROM users WHERE id = ?`,
    [userId]
  );
  return rows[0];
}

async function updateRole(userId, role) {
  const [result] = await pool.query("UPDATE users SET role = ? WHERE id = ?", [toDbRole(role), userId]);
  return result.affectedRows > 0;
}

async function updateStatus(userId, status) {
  const [result] = await pool.query("UPDATE users SET status = ? WHERE id = ?", [toDbStatus(status), userId]);
  return result.affectedRows > 0;
}

async function getUserWatchHistory(userId, { page = 1, limit = 20 }) {
  const safeLimit = Math.min(Number(limit) || 20, 100);
  const offset = ((Number(page) || 1) - 1) * safeLimit;

  const [[history], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT wh.id AS history_id, wh.progress_seconds, wh.last_watched_at AS watched_at,
              v.id AS movie_id, v.title, v.duration_seconds AS duration, v.thumbnail_url AS poster_url
       FROM watch_history wh
       JOIN videos v ON wh.video_id = v.id
       WHERE wh.user_id = ?
       ORDER BY wh.last_watched_at DESC
       LIMIT ? OFFSET ?`,
      [userId, safeLimit, offset]
    ),
    pool.query("SELECT COUNT(*) AS total FROM watch_history WHERE user_id = ?", [userId]),
  ]);

  return {
    data: history,
    pagination: {
      total: Number(total),
      page: Number(page) || 1,
      limit: safeLimit,
      totalPages: Math.ceil(Number(total) / safeLimit),
    },
  };
}

async function getStats() {
  const [
    [[{ totalUsers }]],
    [[{ totalMovies }]],
    [[{ totalGenres }]],
    [[{ viewsToday }]],
  ] = await Promise.all([
    pool.query("SELECT COUNT(*) AS totalUsers FROM users"),
    pool.query("SELECT COUNT(*) AS totalMovies FROM videos WHERE status = 'ACTIVE'"),
    pool.query("SELECT COUNT(*) AS totalGenres FROM genres"),
    pool.query("SELECT COUNT(*) AS viewsToday FROM watch_history WHERE DATE(last_watched_at) = CURDATE()"),
  ]);

  return {
    totalUsers: Number(totalUsers),
    totalMovies: Number(totalMovies),
    totalGenres: Number(totalGenres),
    viewsToday: Number(viewsToday),
  };
}

async function getSignupStats(period = "week", from, to) {
  const days = period === "custom"
    ? Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1
    : period === "month" ? 30 : 7;
  const fromDate = period === "custom" ? from : `DATE_SUB(CURDATE(), INTERVAL ${days} DAY)`;
  const toDate = period === "custom" ? to : "CURDATE()";

  const [rows] = await pool.query(
    `SELECT dates.date, COALESCE(COUNT(u.id), 0) AS signups
     FROM (
       SELECT DATE(${fromDate} + INTERVAL seq DAY) AS date
       FROM (
         SELECT 0 AS seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3
         UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7
         UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
         UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
         UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
         UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23
         UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27
         UNION SELECT 28 UNION SELECT 29
       ) seq_table
       WHERE seq < ?
     ) dates
     LEFT JOIN users u ON DATE(u.created_at) = dates.date
     WHERE dates.date >= ${fromDate} AND dates.date <= ${toDate}
     GROUP BY dates.date
     ORDER BY dates.date ASC`,
    [days]
  );
  return rows.map((r) => ({ date: r.date, signups: Number(r.signups) }));
}

async function getSubscriptionPlanStats() {
  const [rows] = await pool.query(
    `SELECT plan, COUNT(*) AS count FROM (
      SELECT s.plan FROM subscriptions s WHERE s.status = 'ACTIVE'
      UNION ALL
      SELECT 'FREE' FROM users u
      WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE user_id = u.id AND status = 'ACTIVE')
    ) plans GROUP BY plan`
  );
  return rows;
}

async function getTopMovies(limit = 10) {
  const [rows] = await pool.query(
    `SELECT v.id AS movie_id, v.title, v.release_year, v.view_count,
            MIN(vg.genre_id) AS genre_id,
            GROUP_CONCAT(DISTINCT g.name SEPARATOR ', ') AS genre_name
     FROM videos v
     LEFT JOIN video_genres vg ON v.id = vg.video_id
     LEFT JOIN genres g ON vg.genre_id = g.id
     WHERE v.status = 'ACTIVE'
     GROUP BY v.id
     ORDER BY v.view_count DESC
     LIMIT ?`,
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
  getSubscriptionPlanStats,
};
