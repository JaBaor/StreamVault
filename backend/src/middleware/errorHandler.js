const AppError = require("../errors/AppError");

// ── Handle specific known MySQL error codes 
function handleDatabaseError(err) {
  switch (err.code) {
    case "ER_DUP_ENTRY":
      // MySQL duplicate key (inserting username already exists)
      return new AppError("A record with this value already exists", 409, "CONFLICT");

    case "ER_NO_REFERENCED_ROW_2":
      // Foreign key constraint failed: referenced row doesn't exist
      // inserting a movie with a genre_id that doesn't exist
      return new AppError("Referenced resource does not exist", 400, "BAD_REQUEST");

    case "ER_ROW_IS_REFERENCED_2":
      // Cannot delete because other rows reference this one
      // trying to delete a genre that movies still reference
      return new AppError(
        "Cannot delete this resource because other records depend on it",
        409,
        "CONFLICT"
      );

    default:
      return null; // not a known DB error — let it fall through
  }
}

// ── Handle JWT errors thrown by jsonwebtoken 
function handleJwtError(err) {
  if (err.name === "JsonWebTokenError") {
    return new AppError("Invalid token", 401, "UNAUTHORIZED");
  }
  if (err.name === "TokenExpiredError") {
    return new AppError("Token has expired", 401, "TOKEN_EXPIRED");
  }
  return null;
}

// Global error handler 
function errorHandler(err, req, res, next) {
  // Translate known raw errors into AppErrors

  const dbError  = handleDatabaseError(err);
  const jwtError = handleJwtError(err);

  // Use the translated error if we have one, otherwise use the original
  const error = dbError || jwtError || err;

  // Log the error
 
  if (error.isOperational) {
    console.warn(`[${error.code}] ${error.message}`);
  } else {
    // error — log the full
    console.error("UNHANDLED ERROR:", err.stack);
  }

  // Response

  // Operational AppError — use its own status + code + message
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      code:    error.code,
      message: error.message,
      ...(error.details && { details: error.details }), // only include if present
    });
  }

  return res.status(500).json({
    code:    "INTERNAL_SERVER_ERROR",
    message: process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : err.message, // show real message in dev to debug
  });
}

module.exports = errorHandler;