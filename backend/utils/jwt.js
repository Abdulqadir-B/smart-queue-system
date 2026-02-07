/**
 * JWT Utility Functions
 * Handles token generation and verification
 */

const jwt = require("jsonwebtoken");

/**
 * Generate JWT token for a user
 * @param {Object} payload - Data to encode in token (userId, role, etc.)
 * @param {String} expiresIn - Token expiry time (default: 1h)
 * @returns {String} JWT token
 */
const generateToken = (
  payload,
  expiresIn = process.env.JWT_EXPIRES_IN || "1h"
) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    issuer: "queue-management-system",
  });
};

/**
 * Verify and decode JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "queue-management-system",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
