const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // If it starts with "Bearer ", split it. Otherwise, use the raw header string.
  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.split(" ")[1] 
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next(); 
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
}

module.exports = verifyToken;