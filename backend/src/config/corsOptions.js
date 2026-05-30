
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5500")
  .split(",")
  .map(o => o.trim());

const corsOptions = {
  origin: (incomingOrigin, callback) => {
    if (!incomingOrigin) return callback(null, true);

    if (allowedOrigins.includes(incomingOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${incomingOrigin} is not allowed`));
    }
  },

  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
  maxAge: 86400,
};

module.exports = corsOptions;
