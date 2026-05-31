const express = require("express");
const router = express.Router();
const oauthController = require("../controllers/oauthController");

router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(501).json({
      message: "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env",
    });
  }
  const redirectUri = `${process.env.API_URL}/auth/google/callback`;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("openid email profile")}&access_type=offline`;
  res.redirect(url);
});

router.get("/google/callback", oauthController.googleCallback);

module.exports = router;
