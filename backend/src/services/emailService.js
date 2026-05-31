const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) return null;
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST || "smtp.gmail.com",
    port: Number(EMAIL_PORT) || 587,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
}

function loadTemplate(name, replacements) {
  const filePath = path.join(__dirname, "..", "templates", name);
  try {
    let html = fs.readFileSync(filePath, "utf8");
    for (const [key, val] of Object.entries(replacements)) {
      html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
    }
    return html;
  } catch {
    return null;
  }
}

async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.sendMail({ from: `"StreamVault" <${process.env.EMAIL_USER}>`, to, subject, html });
    return true;
  } catch (err) {
    console.error("Email send failed:", err.message);
    return false;
  }
}

async function sendWelcomeEmail(user) {
  const html = loadTemplate("welcome-email.html", { name: user.display_name || user.email });
  return sendEmail({ to: user.email, subject: "Welcome to StreamVault!", html: html || "" });
}

async function sendNewEpisodeAlert(user, series, episode) {
  const html = loadTemplate("new-episode-email.html", {
    name: user.display_name || user.email,
    series: series.title,
    episode: episode.title || `Episode ${episode.episode_number}`,
  });
  return sendEmail({ to: user.email, subject: `New Episode: ${series.title}`, html: html || "" });
}

async function sendExpiryReminder(user, daysLeft) {
  const html = loadTemplate("expiry-reminder-email.html", {
    name: user.display_name || user.email,
    days: String(daysLeft),
  });
  return sendEmail({ to: user.email, subject: "Subscription Expiring Soon", html: html || "" });
}

module.exports = { sendWelcomeEmail, sendNewEpisodeAlert, sendExpiryReminder };
