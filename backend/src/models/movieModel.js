const pool = require("../config/db");

function normalizeStatus(status = "ACTIVE") {
  return String(status).toUpperCase();
}

function mapMovie(row) {
  if (!row) return row;
  return {
    ...row,
    movie_id: row.movie_id ?? row.id,
    duration: row.duration ?? row.duration_seconds,
    poster_url: row.poster_url ?? row.thumbnail_url,
    access_level: row.access_level ?? (row.is_premium ? "premium" : "free"),
  };
}

function normalizeVideoInput(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  const iframeSrc = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeSrc) return iframeSrc[1];

  const abyssMatch = trimmed.match(/^abyss:(.+)$/i);
  if (abyssMatch) return `abyss:${abyssMatch[1]}`;

  return trimmed;
}

function buildMovieFilters({ genre_id, genre_ids, release_year, status = "ACTIVE" }) {
  const conditions = ["v.status = ?"];
  const params = [normalizeStatus(status)];

  const gids = genre_ids || (genre_id ? [genre_id] : []);
  if (gids.length > 0) {
    const placeholders = gids.map(() => "?").join(",");
    conditions.push(`EXISTS (SELECT 1 FROM video_genres vgf WHERE vgf.video_id = v.id AND vgf.genre_id IN (${placeholders}))`);
    params.push(...gids.map(Number));
  }

  if (release_year) {
    conditions.push("v.release_year = ?");
    params.push(Number(release_year));
  }

  return { conditions, params };
}

const SORT_MAP = {
  newest: "v.created_at DESC",
  oldest: "v.created_at ASC",
  title_asc: "v.title ASC",
  title_desc: "v.title DESC",
  year_desc: "v.release_year DESC",
  year_asc: "v.release_year ASC",
};

function getSortClause(sort) {
  return SORT_MAP[sort] || SORT_MAP.newest;
}

const selectMovieFields = `
  v.id,
  v.id AS movie_id,
  v.title,
  v.description,
  v.release_year,
  v.duration_seconds,
  v.duration_seconds AS duration,
  v.thumbnail_url,
  v.thumbnail_url AS poster_url,
  v.trailer_url,
  v.video_url,
  v.storage_key,
  v.slug,
  v.type,
  v.airing_status,
  v.status,
  v.view_count,
  v.age_rating,
  v.is_premium,
  CASE WHEN v.is_premium THEN 'premium' ELSE 'free' END AS access_level,
  v.created_at,
  GROUP_CONCAT(DISTINCT vg.genre_id ORDER BY vg.genre_id) AS genre_ids,
  GROUP_CONCAT(DISTINCT g.name ORDER BY vg.genre_id SEPARATOR ', ') AS genre_name
`;

async function getAllMovies({ page = 1, limit = 10, genre_id, release_year, sort }) {
  const safeLimit = Math.min(Number(limit) || 10, 100);
  const offset = ((Number(page) || 1) - 1) * safeLimit;
  const { conditions, params } = buildMovieFilters({ genre_id, release_year });
  const whereClause = conditions.join(" AND ");

  const [[rows], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT ${selectMovieFields}
       FROM videos v
       LEFT JOIN video_genres vg ON v.id = vg.video_id
       LEFT JOIN genres g ON vg.genre_id = g.id
       WHERE ${whereClause}
       GROUP BY v.id
       ORDER BY ${getSortClause(sort)}
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    ),
    pool.query(`SELECT COUNT(*) AS total FROM videos v WHERE ${whereClause}`, params),
  ]);

  return {
    data: rows.map(mapMovie),
    pagination: {
      total: Number(total),
      page: Number(page) || 1,
      limit: safeLimit,
      totalPages: Math.ceil(Number(total) / safeLimit),
    },
  };
}

async function getMovieById(movieId) {
  const [rows] = await pool.query(
    `SELECT ${selectMovieFields}
     FROM videos v
     LEFT JOIN video_genres vg ON v.id = vg.video_id
     LEFT JOIN genres g ON vg.genre_id = g.id
     WHERE v.id = ? AND v.status = 'ACTIVE'
     GROUP BY v.id`,
    [movieId]
  );
  return mapMovie(rows[0]);
}

async function searchMovies({ q, page = 1, limit = 10 }) {
  const safeLimit = Math.min(Number(limit) || 10, 100);
  const offset = ((Number(page) || 1) - 1) * safeLimit;
  const searchTerm = `%${q}%`;

  const [[rows], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT ${selectMovieFields}
       FROM videos v
       LEFT JOIN video_genres vg ON v.id = vg.video_id
       LEFT JOIN genres g ON vg.genre_id = g.id
       WHERE v.status = 'ACTIVE' AND (v.title LIKE ? OR v.description LIKE ?)
       GROUP BY v.id
       ORDER BY v.view_count DESC
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, safeLimit, offset]
    ),
    pool.query(
      "SELECT COUNT(*) AS total FROM videos v WHERE v.status = 'ACTIVE' AND (v.title LIKE ? OR v.description LIKE ?)",
      [searchTerm, searchTerm]
    ),
  ]);

  return {
    data: rows.map(mapMovie),
    pagination: {
      total: Number(total),
      page: Number(page) || 1,
      limit: safeLimit,
      totalPages: Math.ceil(Number(total) / safeLimit),
    },
  };
}

async function createMovie(fields) {
  const {
    title,
    description,
    release_year,
    duration,
    duration_seconds,
    poster_url,
    thumbnail_url,
    trailer_url,
    video_url,
    access_level,
    is_premium,
    genre_ids,
    type = "MOVIE",
  } = fields;

  // Convert minutes to seconds
  const durSec = duration_seconds || (duration ? duration * 60 : null);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO videos
       (title, description, release_year, duration_seconds, thumbnail_url, trailer_url, video_url, type, airing_status, is_premium, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [
        title,
        description || null,
        release_year || null,
        durSec,
        thumbnail_url || poster_url || null,
        trailer_url || null,
        normalizeVideoInput(video_url),
        String(type).toUpperCase(),
        fields.airing_status || "completed",
        is_premium !== undefined ? Boolean(is_premium) : access_level === "premium",
      ]
    );

    const gids = Array.isArray(genre_ids) ? genre_ids : (fields.genre_id ? [fields.genre_id] : []);
    for (const gid of gids) {
      await connection.query(
        "INSERT IGNORE INTO video_genres (video_id, genre_id) VALUES (?, ?)",
        [result.insertId, Number(gid)]
      );
    }

    await connection.commit();
    return getMovieById(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateMovie(movieId, fields) {
  const aliases = {
    duration: "duration_seconds",
    poster_url: "thumbnail_url",
  };
  const allowed = [
    "title",
    "description",
    "release_year",
    "duration_seconds",
    "thumbnail_url",
    "trailer_url",
    "video_url",
    "type",
    "airing_status",
    "age_rating",
    "is_premium",
  ];

  const normalized = { ...fields };
  for (const [from, to] of Object.entries(aliases)) {
    if (normalized[from] !== undefined && normalized[to] === undefined) {
      // Convert minutes to seconds when aliasing duration
      normalized[to] = from === "duration" ? normalized[from] * 60 : normalized[from];
    }
  }
  if (normalized.access_level !== undefined && normalized.is_premium === undefined) {
    normalized.is_premium = normalized.access_level === "premium";
  }
  if (normalized.video_url !== undefined) {
    normalized.video_url = normalizeVideoInput(normalized.video_url);
  }

  const setClauses = [];
  const params = [];
  for (const key of allowed) {
    if (normalized[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      params.push(key === "type" ? String(normalized[key]).toUpperCase() : normalized[key]);
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (setClauses.length > 0) {
      await connection.query(
        `UPDATE videos SET ${setClauses.join(", ")} WHERE id = ? AND status = 'ACTIVE'`,
        [...params, movieId]
      );
    }
    if (fields.genre_ids !== undefined || fields.genre_id !== undefined) {
      await connection.query("DELETE FROM video_genres WHERE video_id = ?", [movieId]);
      const gids = Array.isArray(fields.genre_ids) ? fields.genre_ids : (fields.genre_id ? [fields.genre_id] : []);
      for (const gid of gids) {
        await connection.query(
          "INSERT IGNORE INTO video_genres (video_id, genre_id) VALUES (?, ?)",
          [movieId, Number(gid)]
        );
      }
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return getMovieById(movieId);
}

async function softDeleteMovie(movieId) {
  const [result] = await pool.query(
    "UPDATE videos SET status = 'INACTIVE' WHERE id = ? AND status = 'ACTIVE'",
    [movieId]
  );
  return result.affectedRows > 0;
}

async function incrementViewCount(movieId) {
  await pool.query("UPDATE videos SET view_count = view_count + 1 WHERE id = ?", [movieId]);
}

module.exports = {
  getAllMovies,
  getMovieById,
  searchMovies,
  createMovie,
  updateMovie,
  softDeleteMovie,
  incrementViewCount,
  mapMovie,
};
