
const express     = require("express");
const router      = express.Router();
const ctrl        = require("../controllers/watchlistController");
const verifyToken = require("../middleware/verifyToken");
const validate    = require("../middleware/validate");
const {
  movieIdParam,
  paginationRules,
} = require("../middleware/validators/watchlistValidators");

router.use(verifyToken); // all watchlist routes require login

router.get(    "/",          paginationRules, validate, ctrl.getWatchlist);
router.post(   "/:movieId",  movieIdParam,    validate, ctrl.addMovie);
router.delete( "/:movieId",  movieIdParam,    validate, ctrl.removeMovie);

module.exports = router;