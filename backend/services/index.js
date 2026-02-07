/**
 * Services index file
 * Central export point for all services
 */

// Import services
const setupSocketIO = require("./socketService");

// Export all services
module.exports = {
  // Socket service
  setupSocketIO,

  // Future services can be added here
  // Example: authService, notificationService, etc.
};
