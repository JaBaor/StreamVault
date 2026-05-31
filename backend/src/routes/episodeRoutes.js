const express = require("express");
const router = express.Router({ mergeParams: true });
const verifyToken = require("../middleware/verifyToken");
const adminAuth = require("../middleware/adminAuth");
const episodeController = require("../controllers/episodeController");

// Public — get episodes for a movie
router.get("/", episodeController.getEpisodes);

// Public — get single episode
router.get("/:episodeId", episodeController.getEpisode);

// Admin — create/update/delete episodes
router.post("/", verifyToken, adminAuth, episodeController.createEpisode);
router.put("/:episodeId", verifyToken, adminAuth, episodeController.updateEpisode);
router.delete("/:episodeId", verifyToken, adminAuth, episodeController.deleteEpisode);

module.exports = router;
