/**
 * Input Sanitization Middleware
 * Protects against XSS and rejects MongoDB operator keys
 */

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
 * Middleware to sanitize request bodies.
 * Express 5 exposes query objects as read-only, so NoSQL key checks are handled
 * centrally for body, query, and params instead of trying to rewrite the request.
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize body (most important - where POST data comes from)
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }

  next();
};

/**
 * Reject MongoDB operators in request data.
 * Keys containing "$" or "." could otherwise be interpreted by MongoDB when
 * request objects are passed into queries.
 */
const hasProhibitedKeys = (value) => {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) {
    return value.some(hasProhibitedKeys);
  }

  return Object.keys(value).some((key) =>
    key.includes("$") || key.includes(".") || hasProhibitedKeys(value[key])
  );
};

const rejectNoSqlInjection = (req, res, next) => {
  if (
    hasProhibitedKeys(req.body) ||
    hasProhibitedKeys(req.query) ||
    hasProhibitedKeys(req.params)
  ) {
    return res.status(400).json({
      status: "error",
      message: "Invalid request data",
    });
  }
  next();
};

module.exports = {
  sanitizeInput,
  rejectNoSqlInjection,
  sanitizeString,
  sanitizeObject,
};
