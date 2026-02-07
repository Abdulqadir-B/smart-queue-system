/**
 * Models index file
 * Central export point for all models
 */

// Export all models
module.exports = {
  Queue: require("./Queue"),
  User: require("./User"),
  Token: require("./Token"),
  Setting: require("./Setting"),
  QueueToken: require("./QueueToken"),
  // Add new models here as they're created
};
