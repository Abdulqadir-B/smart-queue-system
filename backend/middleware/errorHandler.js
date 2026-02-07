/**
 * Error response utility class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error response formatter
 */
const formatError = (err, req) => {
  // Default error object
  const error = {
    status: err.status || "error",
    message: err.message || "Something went wrong",
    path: req.path,
  };

  // Add details if available
  if (err.details) {
    error.details = err.details;
  }

  // Add stack trace in development environment
  if (process.env.NODE_ENV === "development") {
    error.stack = err.stack;
  }

  return error;
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || 500;
  const errorResponse = formatError(err, req);

  res.status(statusCode).json(errorResponse);
};

/**
 * Not found handler middleware - for invalid routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
};
