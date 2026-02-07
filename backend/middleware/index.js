/**
 * Middleware index file
 * Central export point for all middleware components
 */

// Import middleware components
const { AppError, errorHandler, notFoundHandler } = require("./errorHandler");
const {
  globalLimiter,
  authLimiter,
  queueActionLimiter,
  tokenStatusLimiter,
  publicQueueLimiter,
  tokenGenerationLimiter,
} = require("./rateLimiter");
const { auth, optionalAuth } = require("./auth");
const authorize = require("./authorize");
const {
  sanitizeInput,
  mongoSanitizeMiddleware,
  sanitizeString,
  sanitizeObject,
} = require("./sanitize");

// Export all middleware components
module.exports = {
  // Error handling components
  AppError,
  errorHandler,
  notFoundHandler,

  // Rate limiting components
  globalLimiter,
  authLimiter,
  queueActionLimiter,
  tokenStatusLimiter,
  publicQueueLimiter,
  tokenGenerationLimiter,

  // Authentication & Authorization
  auth,
  optionalAuth,
  authorize,

  // Input sanitization
  sanitizeInput,
  mongoSanitizeMiddleware,
  sanitizeString,
  sanitizeObject,
};
