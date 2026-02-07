/**
 * Frontend Input Sanitization Utility
 * Protects against XSS attacks by sanitizing user inputs
 */

/**
 * Remove potentially dangerous HTML tags and scripts
 * @param {string} input - The string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== "string") return input;

  // Remove script tags and content
  let sanitized = input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );

  // Remove dangerous HTML tags
  sanitized = sanitized.replace(
    /<(iframe|object|embed|link|style|img|svg)[^>]*>/gi,
    ""
  );

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/data:text\/html/gi, "");

  return sanitized.trim();
};

/**
 * Sanitize email input
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (!email) return "";
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w@.+-]/g, "");
};

/**
 * Sanitize phone number
 * @param {string} phone - Phone number to sanitize
 * @returns {string} - Sanitized phone
 */
export const sanitizePhone = (phone) => {
  if (!phone) return "";
  // Allow only numbers, spaces, +, -, (, )
  return phone.trim().replace(/[^\d\s+()-]/g, "");
};

/**
 * Sanitize name (allow only letters, spaces, apostrophes, hyphens, dots)
 * @param {string} name - Name to sanitize
 * @returns {string} - Sanitized name
 */
export const sanitizeName = (name) => {
  if (!name) return "";
  // Allow letters (any language), spaces, apostrophes, hyphens, dots
  // Don't trim here - let user type spaces naturally
  return name.replace(/[^a-zA-Z\s.'-]/g, "");
};

/**
 * Sanitize queue name (alphanumeric, dash, underscore only)
 * @param {string} queueName - Queue name to sanitize
 * @returns {string} - Sanitized queue name
 */
export const sanitizeQueueName = (queueName) => {
  if (!queueName) return "";
  return queueName.trim().replace(/[^a-zA-Z0-9_-]/g, "");
};

/**
 * Validate and sanitize email format
 * @param {string} email - Email to validate
 * @returns {object} - {isValid: boolean, sanitized: string, error: string}
 */
export const validateEmail = (email) => {
  const sanitized = sanitizeEmail(email);

  if (!sanitized) {
    return { isValid: false, sanitized: "", error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return {
      isValid: false,
      sanitized,
      error: "Please enter a valid email address",
    };
  }

  if (sanitized.length > 100) {
    return {
      isValid: false,
      sanitized,
      error: "Email must not exceed 100 characters",
    };
  }

  return { isValid: true, sanitized, error: "" };
};

/**
 * Validate and sanitize phone number
 * @param {string} phone - Phone to validate
 * @returns {object} - {isValid: boolean, sanitized: string, error: string}
 */
export const validatePhone = (phone) => {
  const sanitized = sanitizePhone(phone);

  if (!sanitized) {
    return { isValid: true, sanitized: "", error: "" }; // Optional field
  }

  // Remove all non-digit characters for length check
  const digitsOnly = sanitized.replace(/\D/g, "");

  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return {
      isValid: false,
      sanitized,
      error: "Phone number must be between 7 and 15 digits",
    };
  }

  return { isValid: true, sanitized, error: "" };
};

/**
 * Validate and sanitize customer name
 * @param {string} name - Name to validate
 * @returns {object} - {isValid: boolean, sanitized: string, error: string}
 */
export const validateCustomerName = (name) => {
  const sanitized = sanitizeName(name);
  const trimmed = sanitized.trim(); // Trim for validation only

  if (!trimmed) {
    return { isValid: false, sanitized, error: "Name is required" };
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      sanitized,
      error: "Name must be at least 3 characters long",
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      sanitized,
      error: "Name must not exceed 100 characters",
    };
  }

  // Check if name contains at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return {
      isValid: false,
      sanitized,
      error: "Name must contain at least one letter",
    };
  }

  return { isValid: true, sanitized, error: "" };
};

/**
 * Escape HTML to prevent XSS when displaying user content
 * Use this when you need to display user input in HTML
 * @param {string} text - Text to escape
 * @returns {string} - HTML-safe text
 */
export const escapeHtml = (text) => {
  if (typeof text !== "string") return text;

  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitize object properties recursively
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
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
 * Sanitize API response data before using it
 * @param {object} data - API response data
 * @returns {object} - Sanitized data
 */
export const sanitizeApiResponse = (data) => {
  return sanitizeObject(data);
};
