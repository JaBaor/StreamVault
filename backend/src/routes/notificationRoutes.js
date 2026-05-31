const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/notificationController");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);

router.get("/", ctrl.getNotifications);
router.get("/unread-count", ctrl.getUnreadCount);
router.put("/:id/read", ctrl.markRead);
router.put("/read-all", ctrl.markAllRead);

module.exports = router;
