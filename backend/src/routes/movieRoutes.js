const express = require("express");
const router = express.Router();
const authorizationAdmin = require('../middleware/adminAuth');
const verifyToken = require('../middleware/verifyToken');
const movieController = require("../controllers/movieController");

/*router.get("/", (req, res)=>{
  res.json({
    message: "Movie route works"
  });
});
*/
router.get("/", movieController.getMovies);
module.exports = router;
router.post("/", verifyToken, authorizationAdmin, (req, res)=>{
  res.json({message: "Admin successfully acceessed protected route!"})
})