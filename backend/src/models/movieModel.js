const pool = require("../config/db");

function buildMovieFilters({genre_id, release_year, status = "active" }){
  const conditions = ["m.status = ?"];
  const params = [status];

  if(genre_id){
    conditions.push("m.genre_id = ?");
    params.push(Number(genre_id));
  }

  if (release_year) {
    conditions.push("m.release_year = ?");
    params.push(Number(release_year));
  }

  return { conditions, params };
}
const SORT_MAP = {
  newest:     "m.created_at DESC",
  oldest:     "m.created_at ASC",
  title_asc:  "m.title ASC",
  title_desc: "m.title DESC",
  year_desc:  "m.release_year DESC",
  year_asc:   "m.release_year ASC",
};

function getSortClause(sort) {
  return SORT_MAP[sort] || SORT_MAP.newest; // default to newest
}

// GET all, pagiated + filtered + sorted

async function getAllMovies({ page = 1, limit = 10, genre_id, release_year, sort }) {
  const offset = (Number(page) - 1) * Number(limit); // page 1 → offset 0, page 2 → offset 10
  const { conditions, params } = buildMovieFilters({ genre_id, release_year });
  const whereClause = conditions.join(" AND ");
  const orderClause = getSortClause(sort);

  // Two queries run together: one for the data page, one for the total count.
  // The total is needed to calculate totalPages on the frontend.
  const dataQuery = `
    SELECT m.movie_id, m.title, m.description, m.release_year,
           m.duration, m.poster_url, m.trailer_url, m.view_count,
           m.created_at, g.name AS genre_name
    FROM   Movies m
    LEFT JOIN movie_genres mg ON m.movie_id = mg.genre_id
    LEFT JOIN Genres g       ON mg.genre_id = g.genre_id
    WHERE  ${whereClause}
    ORDER BY ${orderClause}
    LIMIT  ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM   Movies m
    WHERE  ${whereClause}
  `;

  // Run both queries in parallel 
  const [[movies], [[{ total }]]] = await Promise.all([
    pool.query(dataQuery,  [...params, Number(limit), offset]),
    pool.query(countQuery, params),
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

//GET by id 
async function getMovieById(movieId) {
  const [rows] = await pool.query(
    `SELECT m.*, g.name AS genre_name
     FROM   Movies m
     LEFT JOIN Genres g ON m.genre_id = g.genre_id
     WHERE  m.movie_id = ? AND m.status = 'active'`,
    [movieId]
  );
  return rows[0]; // undefined if not found
}

// SEARCH — multi-field
// Using parameterized query
async function searchMovies({ q, page = 1, limit = 10 }) {
  const offset     = (Number(page) - 1) * Number(limit);
  const searchTerm = `%${q}%`;   // wrap in % for "contains" search

  const dataQuery = `
   SELECT m.movie_id, m.title, m.description, m.release_year,
       m.duration, m.poster_url, m.view_count,
       g.name AS genre_name
    FROM   Movies m
    LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
    LEFT JOIN Genres g       ON mg.genre_id = g.genre_id
    WHERE  m.status = 'active'
      AND  (m.title LIKE ? OR m.description LIKE ?)
    ORDER BY m.view_count DESC
    LIMIT  ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM   Movies m
    WHERE  m.status = 'active'
      AND  (m.title LIKE ? OR m.description LIKE ?)
  `;

  const [[movies], [[{ total }]]] = await Promise.all([
    pool.query(dataQuery,  [searchTerm, searchTerm, Number(limit), offset]),
    pool.query(countQuery, [searchTerm, searchTerm]),
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

// CREATE
async function createMovie({ title, description, release_year, duration, poster_url, trailer_url, genre_id }) {
  const [result] = await pool.query(
    `INSERT INTO Movies (title, description, release_year, duration, poster_url, trailer_url, genre_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description || null, release_year || null, duration || null,
     poster_url || null, trailer_url || null, genre_id || null]
  );
  return getMovieById(result.insertId); // return the full created movie
}

// UPDATE 
async function updateMovie(movieId, fields) {
  const allowed = ["title", "description", "release_year", "duration",
                   "poster_url", "trailer_url", "genre_id"];

  const setClauses = [];
  const params     = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      params.push(fields[key]);
    }
  }

  if (setClauses.length === 0) return null; // nothing to update

  params.push(movieId);

  await pool.query(
    `UPDATE Movies SET ${setClauses.join(", ")} WHERE movie_id = ? AND status = 'active'`,
    params
  );

  return getMovieById(movieId);
}

// ── SOFT DELETE 
// Sets status = 'inactive'. The row stays in the DB.
// All GET queries filter WHERE status = 'active' so it disappears from all lists.
async function softDeleteMovie(movieId) {
  const [result] = await pool.query(
    "UPDATE Movies SET status = 'inactive' WHERE movie_id = ? AND status = 'active'",
    [movieId]
  );
  return result.affectedRows > 0; // false if movie didn't exist or already deleted
}

// INCREMENT VIEW COUNT 
// Called when a user plays a movie.
async function incrementViewCount(movieId) {
  await pool.query(
    "UPDATE Movies SET view_count = view_count + 1 WHERE movie_id = ?",
    [movieId]
  );
}
module.exports = {
  getAllMovies,
  getMovieById,
  searchMovies,
  createMovie,
  updateMovie,
  softDeleteMovie,
  incrementViewCount,
};