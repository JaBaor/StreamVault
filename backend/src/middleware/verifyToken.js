const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../errors/errors");

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // If it starts with "Bearer ", split it. Otherwise, use the raw header string.
  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.split(" ")[1] 
    : authHeader;
  if(!token){
    return next(new UnauthorizedError("Access token required"))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; //{ id, role }
    next(); 
  } catch (error) {
    next(error);
  }
}

module.exports = verifyToken;