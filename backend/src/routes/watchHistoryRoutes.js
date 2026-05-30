const express      = require("express");
const router       = express.Router();
const ctrl         = require("../controllers/watchHistoryController");
const verifyToken  = require("../middleware/verifyToken");
const validate     = require("../middleware/validate");
const {
  upsertProgressRules,
  historyIdParam,
  paginationRules,
} = require("../middleware/validators/watchHistoryValidators");

// All watch history routes require authentication
router.use(verifyToken);

router.post(  "/",    upsertProgressRules, validate, ctrl.upsertProgress);
router.get(   "/",    paginationRules,     validate, ctrl.getHistory);
router.delete("/",                                   ctrl.clearHistory);
router.delete("/:id", historyIdParam,      validate, ctrl.deleteEntry);

module.exports = router;