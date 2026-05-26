const express = require("express");
const router = express.Router();
const authorizationAdmin = require('../middleware/adminAuth');
const movieController = require("../controllers/movieController");

/*router.get("/", (req, res)=>{
  res.json({
    message: "Movie route works"
  });
});
*/
router.get("/", movieController.getMovies);
module.exports = router;