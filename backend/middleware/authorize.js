/**
 * Authorization Middleware
 * Checks if authenticated user has required role(s)
 */

/**
 * Middleware factory to check if user has required role
 * Must be used AFTER auth middleware (requires req.user)
 *
 * @param {Array<String>} roles - Array of allowed roles (e.g., ['admin', 'staff'])
 * @returns {Function} Express middleware function
 *
 * @example
 * router.post('/admin-only', auth, authorize(['admin']), controller.method);
 * router.post('/staff-or-admin', auth, authorize(['staff', 'admin']), controller.method);
 */
const authorize = (roles = []) => {
  // Ensure roles is an array
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    // Check if user is attached (auth middleware should run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(404).json({
        success: false,
        message: "The requested resource could not be found.",
      });
    }

    // User is authorized
    next();
  };
};

module.exports = authorize;
