/**
 * Error Handler Utility
 * Provides user-friendly error messages for API errors
 */

/**
 * Error message mapping for common API errors
 */
const ERROR_MESSAGES = {
  // Client errors (4xx)
  400: "Invalid request. Please check your input and try again.",
  401: "Your session has expired. Please login again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This operation conflicts with existing data.",
  422: "Invalid data provided. Please check your input.",
  429: "Too many requests. Please slow down and try again later.",

  // Server errors (5xx)
  500: "Server error. Please try again later.",
  502: "Service temporarily unavailable. Please try again later.",
  503: "Service is under maintenance. Please try again later.",
  504: "Request timeout. Please check your connection and try again.",

  // Network errors
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  TIMEOUT: "Request timed out. Please try again.",
  UNKNOWN: "An unexpected error occurred. Please try again.",
};

/**
 * Get user-friendly error message from API error
 * @param {Error|Object} error - The error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Check if it's an Axios error with response
  if (error.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    // Return server message if available and meaningful
    if (serverMessage && serverMessage !== "Internal Server Error") {
      return serverMessage;
    }

    // Return status-based message
    return ERROR_MESSAGES[status] || ERROR_MESSAGES.UNKNOWN;
  }

  // Network or timeout errors
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return ERROR_MESSAGES.TIMEOUT;
  }

  if (error.message === "Network Error") {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Return error message if available
  return error.message || ERROR_MESSAGES.UNKNOWN;
};

/**
 * Parse validation errors from API response
 * @param {Object} error - The error object with response
 * @returns {Object} Field-specific validation errors
 */
export const parseValidationErrors = (error) => {
  if (!error.response?.data?.errors) {
    return {};
  }

  const errors = error.response.data.errors;
  const fieldErrors = {};

  // Handle express-validator format
  if (Array.isArray(errors)) {
    errors.forEach((err) => {
      if (err.param) {
        fieldErrors[err.param] = err.msg;
      }
    });
  }
  // Handle custom format { field: message }
  else if (typeof errors === "object") {
    Object.keys(errors).forEach((field) => {
      fieldErrors[field] = errors[field];
    });
  }

  return fieldErrors;
};

/**
 * Check if error is a rate limit error
 * @param {Error|Object} error - The error object
 * @returns {boolean} True if rate limit error
 */
export const isRateLimitError = (error) => {
  return error.response?.status === 429;
};

/**
 * Get retry-after time from rate limit error
 * @param {Error|Object} error - The error object
 * @returns {number|null} Seconds to wait, or null if not available
 */
export const getRetryAfter = (error) => {
  if (!isRateLimitError(error)) {
    return null;
  }

  const retryAfter = error.response?.headers?.["retry-after"];
  return retryAfter ? parseInt(retryAfter, 10) : null;
};

/**
 * Format rate limit error message with retry time
 * @param {Error|Object} error - The error object
 * @returns {string} Formatted error message
 */
export const formatRateLimitMessage = (error) => {
  const retryAfter = getRetryAfter(error);

  if (retryAfter) {
    const minutes = Math.ceil(retryAfter / 60);
    return `Too many requests. Please wait ${minutes} minute${
      minutes > 1 ? "s" : ""
    } before trying again.`;
  }

  return ERROR_MESSAGES[429];
};

/**
 * Check if error requires authentication
 * @param {Error|Object} error - The error object
 * @returns {boolean} True if authentication error
 */
export const isAuthError = (error) => {
  return error.response?.status === 401;
};

/**
 * Check if error is a permission error
 * @param {Error|Object} error - The error object
 * @returns {boolean} True if permission error
 */
export const isPermissionError = (error) => {
  return error.response?.status === 403;
};

/**
 * Check if error is a server error
 * @param {Error|Object} error - The error object
 * @returns {boolean} True if server error (5xx)
 */
export const isServerError = (error) => {
  const status = error.response?.status;
  return status >= 500 && status < 600;
};

/**
 * Log error to console in development
 * @param {string} context - Context where error occurred
 * @param {Error|Object} error - The error object
 */
export const logError = (context, error) => {
  if (import.meta.env.DEV) {
    console.error(`[${context}] Error:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack,
    });
  }
};

/**
 * Handle error with toast/snackbar notification
 * @param {Error|Object} error - The error object
 * @param {Function} showNotification - Function to show notification (e.g., toast, snackbar)
 * @param {string} context - Optional context for logging
 */
export const handleErrorWithNotification = (
  error,
  showNotification,
  context = "API"
) => {
  logError(context, error);

  let message;

  if (isRateLimitError(error)) {
    message = formatRateLimitMessage(error);
  } else {
    message = getErrorMessage(error);
  }

  if (showNotification) {
    showNotification(message, "error");
  }

  return message;
};

const errorHandler = {
  getErrorMessage,
  parseValidationErrors,
  isRateLimitError,
  getRetryAfter,
  formatRateLimitMessage,
  isAuthError,
  isPermissionError,
  isServerError,
  logError,
  handleErrorWithNotification,
};

export default errorHandler;
