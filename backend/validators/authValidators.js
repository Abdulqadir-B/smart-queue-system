/**
 * Authentication Validators
 * Validation rules for registration and login endpoints
 */

const { body } = require("express-validator");
const { validateRequest } = require("./queueValidators");

/**
 * Validation rules for user registration
 */
const registerValidation = [
  // Username validation
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .custom((value) => {
      // Prevent SQL-like injections
      if (
        value.toLowerCase().includes("admin") ||
        value.toLowerCase().includes("root")
      ) {
        throw new Error("Username cannot contain reserved words");
      }
      return true;
    }),

  // Email validation
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("Email must not exceed 100 characters")
    .custom((value) => {
      // Additional email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        throw new Error("Invalid email format");
      }
      return true;
    }),

  // Password validation (matching frontend requirements)
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/(?=.*[a-z])/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/(?=.*[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/(?=.*\d)/)
    .withMessage("Password must contain at least one number")
    .matches(/(?=.*[@$!%*?&#])/)
    .withMessage(
      "Password must contain at least one special character (@$!%*?&#)"
    )
    .not()
    .matches(/\s/)
    .withMessage("Password cannot contain spaces")
    .isLength({ max: 128 })
    .withMessage("Password must not exceed 128 characters"),

  validateRequest,
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  // Email validation
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  // Password validation (basic check for login)
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1 })
    .withMessage("Password cannot be empty"),

  validateRequest,
];

module.exports = {
  registerValidation,
  loginValidation,
};
