const { body, param, query, validationResult } = require("express-validator");

// Middleware to check validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      errors: errors.array(),
    });
  }
  next();
};

// Validation rules for creating a queue
const createQueueValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Queue name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Queue name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Queue name can only contain letters, numbers, underscores, and hyphens"
    ),
  validateRequest,
];

// Validation rules for queue name parameter
const queueNameParamValidation = [
  param("name")
    .trim()
    .notEmpty()
    .withMessage("Queue name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Queue name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Queue name can only contain letters, numbers, underscores, and hyphens"
    ),
  validateRequest,
];

module.exports = {
  validateRequest,
  createQueueValidation,
  queueNameParamValidation,
};
