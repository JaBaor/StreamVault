const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const adminAuth = require("../middleware/adminAuth");
const adminExport = require("../controllers/adminExportController");

router.use(verifyToken);
router.use(adminAuth);

router.get("/users", adminExport.exportUsers);
router.get("/videos", adminExport.exportVideos);

module.exports = router;
