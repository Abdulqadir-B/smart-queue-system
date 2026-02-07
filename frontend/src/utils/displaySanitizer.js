/**
 * Display Sanitizer Utility
 * Sanitizes user-generated content before displaying in UI
 * Note: React automatically escapes JSX content, but this provides extra protection
 */

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeHtml = (text) => {
  if (!text) return "";

  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return String(text).replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitize display text (removes HTML tags and trims)
 * Use this for displaying user-generated content
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export const sanitizeDisplayText = (text) => {
  if (!text) return "";

  // Remove any HTML tags
  const withoutTags = String(text).replace(/<[^>]*>/g, "");

  // Trim whitespace
  return withoutTags.trim();
};

/**
 * Sanitize username for display
 * @param {string} username - Username to sanitize
 * @returns {string} Sanitized username
 */
export const sanitizeUsername = (username) => {
  if (!username) return "Unknown User";

  return sanitizeDisplayText(username);
};

/**
 * Sanitize email for display
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (!email) return "";

  return sanitizeDisplayText(email);
};

/**
 * Sanitize queue name for display
 * @param {string} queueName - Queue name to sanitize
 * @returns {string} Sanitized queue name
 */
export const sanitizeQueueName = (queueName) => {
  if (!queueName) return "Unknown Queue";

  return sanitizeDisplayText(queueName);
};

/**
 * Sanitize customer name for display
 * @param {string} name - Customer name to sanitize
 * @returns {string} Sanitized name
 */
export const sanitizeCustomerName = (name) => {
  if (!name) return "Anonymous";

  return sanitizeDisplayText(name);
};

/**
 * Sanitize phone number for display
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone
 */
export const sanitizePhone = (phone) => {
  if (!phone) return "";

  // Remove any non-digit characters except + and -
  return String(phone).replace(/[^0-9+-]/g, "");
};

/**
 * Sanitize any user content before displaying
 * Generic sanitization for unknown content types
 * @param {any} content - Content to sanitize
 * @returns {string} Sanitized content
 */
export const sanitizeUserContent = (content) => {
  if (content === null || content === undefined) return "";

  if (typeof content === "object") {
    // Convert objects to JSON string (safe representation)
    try {
      return sanitizeDisplayText(JSON.stringify(content));
    } catch {
      return "[Object]";
    }
  }

  return sanitizeDisplayText(String(content));
};

/**
 * Validate and sanitize URL
 * Prevents javascript: and data: URLs
 * @param {string} url - URL to validate
 * @returns {string|null} Safe URL or null if invalid
 */
export const sanitizeUrl = (url) => {
  if (!url) return null;

  const urlString = String(url).trim().toLowerCase();

  // Block dangerous URL schemes (literals for security validation only - not executed)
  // eslint-disable-next-line no-script-url
  const dangerousSchemes = ["javascript:", "data:", "vbscript:", "file:"];
  if (dangerousSchemes.some((scheme) => urlString.startsWith(scheme))) {
    return null;
  }

  // Only allow http, https, and relative URLs
  if (
    urlString.startsWith("http://") ||
    urlString.startsWith("https://") ||
    urlString.startsWith("/") ||
    urlString.startsWith("#")
  ) {
    return url.trim();
  }

  return null;
};

/**
 * Check if string contains potential XSS
 * @param {string} text - Text to check
 * @returns {boolean} True if potential XSS detected
 */
export const containsXSS = (text) => {
  if (!text) return false;

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /eval\(/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(String(text)));
};

const displaySanitizer = {
  escapeHtml,
  sanitizeDisplayText,
  sanitizeUsername,
  sanitizeEmail,
  sanitizeQueueName,
  sanitizeCustomerName,
  sanitizePhone,
  sanitizeUserContent,
  sanitizeUrl,
  containsXSS,
};

export default displaySanitizer;
