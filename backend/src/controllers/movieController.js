const movieModel = require("../models/movieModel");

exports.getMovies = async (req, res)=>{
  try{
    const movies = await movieModel.getAllMovies();
    res.json(movies);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};