const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const userModel = require("../models/userModel");
const notificationModel = require("../models/notificationModel");

const LOG_FILE = path.join(__dirname, "../../oauth-debug.log");
function olog(msg, data) {
  const line = `[${new Date().toISOString()}] ${msg} ${data ? JSON.stringify(data, null, 2) : ""}\n`;
  fs.appendFileSync(LOG_FILE, line);
}

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

async function googleCallback(req, res) {
  const { code, error: oauthError } = req.query;
  if (oauthError) {
    console.error("Google returned error:", oauthError);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_denied`);
  }
  if (!code) return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_not_configured`);
  }

  try {
    const redirectUri = `${process.env.API_URL}/auth/google/callback`;
    olog("Step 1: callback called", { redirectUri, hasCode: !!code, clientIdPrefix: clientId.substring(0, 10) });

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    olog("Step 2: token exchange", { status: tokenRes.status });
    const tokens = await tokenRes.json();
    olog("Step 3: token response", { hasAccessToken: !!tokens.access_token, error: tokens.error, error_description: tokens.error_description });

    if (!tokens.access_token) {
      olog("Step X: token exchange failed", tokens);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_exchange_failed&details=${encodeURIComponent(tokens.error_description || tokens.error || 'unknown')}`);
    }

    const userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();
    olog("Step 4: google user info", { email: googleUser.email, name: googleUser.name });

    if (!googleUser.email) {
      console.error("[OAuth] No email from Google:", JSON.stringify(googleUser));
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_email`);
    }

    let user = await userModel.getUserByEmail(googleUser.email);
    if (user) {
      await userModel.saveOAuthInfo(user.id, "google", googleUser.id);
    } else {
      const password = crypto.randomBytes(20).toString("hex");
      const bcrypt = require("bcrypt");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const displayName = googleUser.name || googleUser.email.split("@")[0];
      const userId = await userModel.createUser(displayName, googleUser.email, hashedPassword, "GUEST");
      await userModel.saveOAuthInfo(userId, "google", googleUser.id);
      user = await userModel.getUserByEmail(googleUser.email);
      notificationModel
        .createNotification({
          userId,
          type: "welcome",
          title: "Welcome to StreamVault!",
          message: "Your account was created via Google login.",
        })
        .catch(() => {});
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await userModel.saveRefreshToken(user.id, refreshToken, expiresAt);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}/login?token=${accessToken}`);
  } catch (err) {
    olog("CATCH error", { message: err.message, stack: err.stack, name: err.name, code: err.code });
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
}

module.exports = { googleCallback };
