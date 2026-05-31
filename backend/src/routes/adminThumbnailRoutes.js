const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const adminAuth = require("../middleware/adminAuth");
const thumbnailCtrl = require("../controllers/adminThumbnailController");

router.use(verifyToken);
router.use(adminAuth);

router.post("/thumbnail", thumbnailCtrl.uploadThumbnail);

module.exports = router;
