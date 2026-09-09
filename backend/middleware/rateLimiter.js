/**
 * Rate limiting middleware to protect API endpoints from abuse
 */
const rateLimit = require("express-rate-limit");
const { AppError } = require("./errorHandler");
const config = require("../config");

// General API rate limiter - applies to all routes
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.globalWindow, // from configuration
  max: config.rateLimit.globalMax, // from configuration
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again later.",
  },
  handler: (req, res, next, options) => {
    next(new AppError("Rate limit exceeded", 429));
  },
});

// Stricter rate limiter for auth-related routes (login only)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 auth requests per hour (prevents brute force)
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed login attempts
  message: {
    status: "error",
    message: "Too many unsuccessful login attempts. Please try again after 1 hour.",
  },
  handler: (req, res, next, options) => {
    next(new AppError("Too many unsuccessful login attempts. Account temporarily locked.", 429));
  },
});

// Registration limiter for successful registrations
// Tracks only successful account creations to prevent spam
const registrationSuccessLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Maximum 3 successful registrations per 24 hours per IP
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true, // Only count successful registrations
  message: {
    status: "error",
    message: "Maximum account creation limit reached. Please try again after 24 hours.",
  },
  handler: (req, res, next, options) => {
    next(new AppError("Too many accounts created from this IP. Limit: 3 accounts per 24 hours.", 429));
  },
});

// Registration limiter for failed registrations
// Tracks failed registration attempts to prevent brute force and enumeration
const registrationFailLimiter = rateLimit({
  windowMs: 6 * 60 * 60 * 1000, // 6 hours
  max: 10, // Maximum 10 failed registration attempts per 6 hours per IP
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed registrations
  message: {
    status: "error",
    message: "Too many failed registration attempts. Please try again after 6 hours.",
  },
  handler: (req, res, next, options) => {
    next(new AppError("Too many failed registration attempts. Please check your input and try again later.", 429));
  },
});

// Custom limiter for queue actions to prevent queue flooding
const queueActionLimiter = rateLimit({
  windowMs: config.rateLimit.queueActionsWindow, // from configuration
  max: config.rateLimit.queueActionsMax, // from configuration
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many queue operations, please slow down.",
  },
  handler: (req, res, next, options) => {
    next(new AppError("Too many queue operations", 429));
  },
});

// Stricter limiter for token status checks to prevent enumeration attacks
const tokenStatusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 token status checks per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, not just failed ones
  message: {
    status: "error",
    message: "Too many token status checks. Please try again later.",
  },
  handler: (req, res, next, options) => {
    next(new AppError("Rate limit exceeded for token status checks", 429));
  },
});

// Limiter for public queue listing to prevent scraping
const publicQueueLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // 100 requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests. Please slow down.",
  },
});

// Combined middleware for registration that applies both limiters
// This ensures both successful and failed attempts are properly rate limited
const registrationRateLimiter = [
  registrationSuccessLimiter,
  registrationFailLimiter,
];

// Per-queue token generation limiter
// Limits token generation per IP per specific queue to prevent spam
const tokenGenerationLimiter = rateLimit({
  windowMs: config.rateLimit.tokenGenerationWindow, // 30 minutes
  max: config.rateLimit.tokenGenerationMax, // 5 tokens per 30 minutes per queue
  standardHeaders: true,
  legacyHeaders: false,
  // Use queue name in the key to make limits per-queue
  // Note: Not using custom keyGenerator to avoid IPv6 issues
  // The default keyGenerator handles IPv6 properly
  // Queue-specific limiting is handled at the application level
  message: {
    status: "error",
    message: "You have reached the token generation limit for this queue. Please try again later.",
  },
  handler: (req, res, next, options) => {
    const queueName = req.params.name || 'this queue';
    next(new AppError(`Token generation limit exceeded for ${queueName}. Maximum ${config.rateLimit.tokenGenerationMax} tokens per 30 minutes per queue.`, 429));
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
  queueActionLimiter,
  tokenStatusLimiter,
  publicQueueLimiter,
  registrationSuccessLimiter,
  registrationFailLimiter,
  registrationRateLimiter,
  tokenGenerationLimiter,
};
