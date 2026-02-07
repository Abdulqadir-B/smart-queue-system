/**
 * Validators index file
 * Central export point for all validators
 */

// Import validators
const { validateRequest, createQueueValidation, queueNameParamValidation } = require('./queueValidators');
const { registerValidation, loginValidation } = require('./authValidators');
const {
  tokenNumberParamValidation,
  joinQueueValidation,
  completeServiceValidation,
  tokenStatusValidation,
} = require('./tokenValidators');

// Export all validators
module.exports = {
  // General validation utility
  validateRequest,
  
  // Queue validators
  createQueueValidation,
  queueNameParamValidation,
  
  // Auth validators
  registerValidation,
  loginValidation,

  // Token validators
  tokenNumberParamValidation,
  joinQueueValidation,
  completeServiceValidation,
  tokenStatusValidation,
};