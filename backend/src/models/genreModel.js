
const pool = require("../config/db");

//GET all — with movie count per genre 
async function getAllGenres() {
  const [rows] = await pool.query(`
   SELECT   g.genre_id, g.name,
         COUNT(m.movie_id) AS movie_count
    FROM     Genres g
    LEFT JOIN movie_genres mg ON g.genre_id = mg.genre_id
    LEFT JOIN Movies m        ON mg.movie_id = m.movie_id AND m.status = 'active'
    GROUP BY g.genre_id, g.name
    ORDER BY g.name ASC;
  `);
  return rows;
}

// GET by id 
async function getGenreById(genreId) {
  const [rows] = await pool.query(
    "SELECT * FROM Genres WHERE genre_id = ?",
    [genreId]
  );
  return rows[0];
}

//CREATE 
async function createGenre(name) {
  const [result] = await pool.query(
    "INSERT INTO Genres (name) VALUES (?)",
    [name]
  );
  return getGenreById(result.insertId);
}

//UPDATE 
async function updateGenre(genreId, name) {
  await pool.query(
    "UPDATE Genres SET name = ? WHERE genre_id = ?",
    [name, genreId]
  );
  return getGenreById(genreId);
}

//CHECK if any active movies reference this genre 
async function getMovieCountByGenre(genreId) {
  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) AS count 
      FROM   Movies m
      INNER JOIN movie_genres mg ON m.movie_id = mg.movie_id
      WHERE  mg.genre_id = ? 
        AND  m.status = 'active';`,
    [genreId]
  );
  return Number(count);
}

//DELETE 
// Hard delete — genres are reference data, not user content.
// The controller checks getMovieCountByGenre first.
async function deleteGenre(genreId) {
  const [result] = await pool.query(
    `DELETE FROM movie_genres WHERE genreid = ?;
    DELETE FROM Genres WHERE genre_id = ?;`,
    [genreId]
  );
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