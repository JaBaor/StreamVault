const express = require("express");
const router = express.Router({ mergeParams: true });
const ctrl = require("../controllers/seriesSubscriptionController");
const verifyToken = require("../middleware/verifyToken");

router.post("/subscribe", verifyToken, ctrl.subscribe);
router.post("/unsubscribe", verifyToken, ctrl.unsubscribe);
router.get("/status", verifyToken, ctrl.status);

module.exports = router;
