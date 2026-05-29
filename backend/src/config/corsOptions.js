
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5500")
  .split(",")             // supports multiple origins
  .map(o => o.trim());

const corsOptions = {
  // Called on every request — return true to allow, false to block
  origin: (incomingOrigin, callback) => {
    // incomingOrigin is undefined for same-origin requests (Postman, curl, server-to-server)
    // Allow those through unconditionally — they don't need CORS headers
    if (!incomingOrigin) return callback(null, true);

    if (allowedOrigins.includes(incomingOrigin)) {
      callback(null, true);   // ← origin is allowed
    } else {
      callback(new Error(`CORS: origin ${incomingOrigin} is not allowed`));
    }
  },

  credentials:     true, // ← required so cookies (refresh token) travel with requests
  methods:         ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders:  ["Content-Type", "Authorization"],
  exposedHeaders:  ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
  maxAge:          86400, // browser caches preflight result for 24h (reduces OPTIONS calls)
};

module.exports = corsOptions;