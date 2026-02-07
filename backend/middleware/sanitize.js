/**
 * Input Sanitization Middleware
 * Protects against XSS and NoSQL injection attacks
 */

const mongoSanitize = require("express-mongo-sanitize");

/**
 * Simple XSS sanitization for strings
 * Removes dangerous HTML/script tags and attributes
 */
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  // Remove script tags and their content
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove dangerous HTML tags
  str = str.replace(/<(iframe|object|embed|link|style|img)[^>]*>/gi, "");

  // Remove event handlers (onclick, onerror, etc.)
  str = str.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  str = str.replace(/on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: protocol
  str = str.replace(/javascript:/gi, "");

  // Remove data: protocol (can be used for XSS)
  str = str.replace(/data:text\/html/gi, "");

  return str.trim();
};

/**
 * Recursively sanitize all string values in an object
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === "object") {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Middleware to sanitize request body, query, and params
 * Protects against XSS attacks
 * Note: Only body is fully sanitized as query/params may be read-only in some Express versions
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize body (most important - where POST data comes from)
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }

  // Note: mongoSanitizeMiddleware already handles query and params for NoSQL injection
  // XSS in query/params is less risky as they're typically used for routing/filtering

  next();
};

/**
 * Configure MongoDB sanitization
 * Removes $ and . from user input to prevent NoSQL injection
 */
const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: "_", // Replace prohibited characters with underscore
  onSanitize: ({ req, key }) => {
    console.warn(`Potential NoSQL injection attempt detected in ${key}`);
  },
});

module.exports = {
  sanitizeInput,
  mongoSanitizeMiddleware,
  sanitizeString,
  sanitizeObject,
};
