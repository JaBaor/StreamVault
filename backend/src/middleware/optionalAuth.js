const jwt = require("jsonwebtoken");

function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token      = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null; // guest — controller handles this case
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null; // invalid token treated same as no token
  }
  next();
}

module.exports = optionalAuth;