const rateLimit = require("express-rate-limit");
//Applies only to login route, 5 reqs/min
exports.loginLimiter = rateLimit({
  windowMs: 60 * 1000,         //1 min
  max: 5,                      // 5 req per windown per IP
  standardHeaders: true,       // sends RateLimit-* headers in the response
  legacyHeaders: false,        // disables the older X-RateLimit-* headers

  //Custom reponse
  handler: (req, res)=>{
    res.status(429).json({
      code:    "RATE_LIMIT_EXCEEDED",
      message: "Too many login attempts. Please try again in 1 minute.",
    });
  },
});
// General API limiter
exports.generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      100,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (req, res) => {
    res.status(429).json({
      code:    "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please slow down.",
    });
  },
});