/**
 * Token Validators
 * Validation rules for token-related operations
 */

const { body, param, query } = require("express-validator");
const { validateRequest } = require("./queueValidators");

/**
 * Validation for token number parameter
 */
const tokenNumberParamValidation = [
  param("tokenNumber")
    .notEmpty()
    .withMessage("Token number is required")
    .isInt({ min: 1 })
    .withMessage("Token number must be a positive integer")
    .toInt(),
  validateRequest,
];

/**
 * Validation for joining a queue
 */
const joinQueueValidation = [
  body("customerName")
    .trim()
    .notEmpty()
    .withMessage("Customer name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Customer name must be between 3 and 100 characters")
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage(
      "Customer name can only contain letters, spaces, and basic punctuation (. ' -)"
    ),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[\d\s+()-]{7,20}$/)
    .withMessage("Please provide a valid phone number"),

  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("Email must not exceed 100 characters"),

  validateRequest,
];

/**
 * Validation for complete service endpoint
 */
const completeServiceValidation = [
  body("tokenNumber")
    .notEmpty()
    .withMessage("Token number is required")
    .isInt({ min: 1 })
    .withMessage("Token number must be a positive integer")
    .toInt(),
  validateRequest,
];

/**
 * Validation for token status query with verification key
 */
const tokenStatusValidation = [
  param("tokenNumber")
    .notEmpty()
    .withMessage("Token number is required")
    .isInt({ min: 1 })
    .withMessage("Token number must be a positive integer")
    .toInt(),

  query("verificationKey")
    .notEmpty()
    .withMessage("Verification key is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification key must be 6 digits")
    .isNumeric()
    .withMessage("Verification key must be numeric"),

  validateRequest,
];

module.exports = {
  tokenNumberParamValidation,
  joinQueueValidation,
  completeServiceValidation,
  tokenStatusValidation,
};
