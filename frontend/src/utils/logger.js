/**
 * Logger Utility
 * Provides development-only logging to prevent sensitive data leaks in production
 */

/**
 * Log info message (development only)
 * @param {string} message - Message to log
 * @param {any} data - Optional data to log
 */
export const logInfo = (message, data = null) => {
  if (import.meta.env.DEV) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

/**
 * Log error message (development only)
 * @param {string} message - Error message
 * @param {Error|any} error - Error object or data
 */
export const logError = (message, error = null) => {
  if (import.meta.env.DEV) {
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }
};

/**
 * Log warning message (development only)
 * @param {string} message - Warning message
 * @param {any} data - Optional data to log
 */
export const logWarning = (message, data = null) => {
  if (import.meta.env.DEV) {
    if (data) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  }
};

/**
 * Log debug message (development only)
 * @param {string} message - Debug message
 * @param {any} data - Optional data to log
 */
export const logDebug = (message, data = null) => {
  if (import.meta.env.DEV) {
    if (data) {
      console.debug(message, data);
    } else {
      console.debug(message);
    }
  }
};

const logger = {
  info: logInfo,
  error: logError,
  warning: logWarning,
  debug: logDebug,
};

export default logger;
