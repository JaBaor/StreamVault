const pool = require("../config/db");

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapGenre(row) {
  if (!row) return row;
  return { ...row, genre_id: row.genre_id ?? row.id };
}

async function getAllGenres() {
  const [rows] = await pool.query(`
    SELECT g.id, g.id AS genre_id, g.name, g.slug, g.description,
           COUNT(v.id) AS movie_count
    FROM genres g
    LEFT JOIN video_genres vg ON g.id = vg.genre_id
    LEFT JOIN videos v ON vg.video_id = v.id AND v.status = 'ACTIVE'
    GROUP BY g.id
    ORDER BY g.name ASC
  `);
  return rows.map(mapGenre);
}

async function getGenreById(genreId) {
  const [rows] = await pool.query("SELECT id, id AS genre_id, name, slug, description FROM genres WHERE id = ?", [genreId]);
  return mapGenre(rows[0]);
}

async function createGenre(name, description = null) {
  const [result] = await pool.query(
    "INSERT INTO genres (name, slug, description) VALUES (?, ?, ?)",
    [name, slugify(name), description]
  );
  return getGenreById(result.insertId);
}

async function updateGenre(genreId, name, description) {
  await pool.query(
    "UPDATE genres SET name = ?, slug = ?, description = COALESCE(?, description) WHERE id = ?",
    [name, slugify(name), description ?? null, genreId]
  );
  return getGenreById(genreId);
}

async function getMovieCountByGenre(genreId) {
  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM videos v
     INNER JOIN video_genres vg ON v.id = vg.video_id
     WHERE vg.genre_id = ? AND v.status = 'ACTIVE'`,
    [genreId]
  );
  return Number(count);
}

async function deleteGenre(genreId) {
  const [result] = await pool.query("DELETE FROM genres WHERE id = ?", [genreId]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  getMovieCountByGenre,
  deleteGenre,
};
