const AppError = require("./AppError");

// ── 400 Bad Request 
class BadRequestError extends AppError {
  constructor(message = "Bad request", details = null) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

// ── 401 Unauthorized 
class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

// ── 403 Forbidden 
class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN");
  }
}

// ── 404 Not Found 
// Use when a specific resource doesn't exist: movie not found, user not found.
class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

// ── 409 Conflict 
// Use when an action conflicts with existing data: duplicate username, email.
class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

// ── 422 Unprocessable Entity 

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
};