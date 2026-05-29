// Wraps async route handlers to eliminate try/catch blocks
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the full error for devs
  console.error(`[ERROR] ${new Date().toISOString()} — ${req.method} ${req.url}`);
  console.error(err.stack || err.message);
 
  // Default status code
  const statusCode = err.statusCode || 500;
 
  const isDev = process.env.NODE_ENV !== 'production';
 
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    // Only expose stack trace during development
    ...(isDev && { stack: err.stack })
  });
};

//function to quickly create errors with status codes
const createError = (message, statusCode = 500) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};
 
module.exports = { 
  asyncHandler,
  errorHandler,
  createError 
};