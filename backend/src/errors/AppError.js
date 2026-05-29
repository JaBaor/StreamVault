class AppError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message); // sets this.message, required by Error

    this.statusCode = statusCode; // HTTP status: 400, 401, 404, 409...
    this.code       = code;       // machine-readable string: "NOT_FOUND", "FORBIDDEN"...
    this.details    = details;    // optional extra info (array, object, or null)
    this.isOperational = true;    

    // Keeps the stack trace clean — hides AppError itself from the trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;