const path = require("path");
const dotenv = require("dotenv");

// Load backend/src/.env regardless of cwd (npm run dev from backend/)
dotenv.config({ path: path.join(__dirname, "..", ".env") });

module.exports = process.env;
