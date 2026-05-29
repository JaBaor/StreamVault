const express          = require("express");
const router           = express.Router();
const genreController  = require("../controllers/genreController");
const verifyToken      = require("../middleware/verifyToken");
const adminAuth        = require("../middleware/adminAuth");
const validate         = require("../middleware/validate");
const {
  genreIdParam,
  createGenreRules,
  updateGenreRules,
} = require("../middleware/validators/genreValidators");

router.get( "/",    genreController.getAllGenres);
router.get( "/:id", genreIdParam, validate, genreController.getGenreById);

router.post(  "/",    verifyToken, adminAuth, createGenreRules, validate, genreController.createGenre);
router.put(   "/:id", verifyToken, adminAuth, genreIdParam, updateGenreRules, validate, genreController.updateGenre);
router.delete("/:id", verifyToken, adminAuth, genreIdParam,                  validate, genreController.deleteGenre);

module.exports = router;