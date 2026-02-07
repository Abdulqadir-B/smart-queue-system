/**
 * Controllers index file
 * Central export point for all controllers
 */

// Queue Management Controllers
const queueManagementController = require("./queueManagementController");
const tokenController = require("./tokenController");
const queueStateController = require("./queueStateController");
const analyticsController = require("./analyticsController");
const authController = require("./authController");

// Export all controllers
module.exports = {
  // Queue Management
  ...queueManagementController,

  // Token operations
  ...tokenController,

  // Queue state operations
  ...queueStateController,

  // Analytics operations
  ...analyticsController,

  // Authentication
  ...authController,

  // Add other controllers as needed
};
