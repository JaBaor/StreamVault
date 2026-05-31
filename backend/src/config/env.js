const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

process.env.API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api/v1`;
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

module.exports = process.env;
