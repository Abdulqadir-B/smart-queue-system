/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

const { verifyToken } = require("../utils/jwt");
const { User } = require("../models");

/**
 * Middleware to authenticate requests using JWT
 * Extracts token from Authorization header, verifies it, and attaches user to req.user
 */
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyToken(token);

    // Find user in database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.message === "Token has expired") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    if (error.message === "Invalid token") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
      error: error.message,
    });
  }
};

/**
 * Optional authentication middleware
 * Attempts to authenticate if token is present, but doesn't fail if missing
 * Useful for routes that work for both authenticated and anonymous users
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    // If no token, just continue without authentication
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Find user in database
      const user = await User.findById(decoded.userId).select("-password");

      if (user) {
        // Attach user to request object
        req.user = user;
      }
    } catch (error) {
      // Token verification failed, but we continue anyway
      console.log("Optional auth failed:", error.message);
    }

    next();
  } catch (error) {
    // If any error occurs, just continue without authentication
    next();
  }
};

module.exports = { auth, optionalAuth };
