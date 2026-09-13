/**
 * Configuration management with validation
 * Centralizes all environment variables and configuration settings
 */

// Load environment variables
require("dotenv").config();

// Configuration with validation and defaults
const config = {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || "development",

  // Server configuration
  server: {
    port: validatePort(process.env.PORT, 5000),
    host: process.env.HOST || "0.0.0.0",
  },

  // MongoDB configuration
  database: {
    uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart_queue",
    options: {
      // Modern MongoDB driver (v4.0.0+) doesn't need these deprecated options
    },
  },

  // CORS configuration
  cors: {
    origins: parseOrigins(process.env.CORS_ORIGINS, [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]),
    credentials: process.env.CORS_CREDENTIALS === "false" ? false : true,
  },

  // Rate limiting configuration
  rateLimit: {
    globalWindow:
      parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MINS || "15") * 60 * 1000,
    globalMax: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || "200"),
    queueActionsWindow:
      parseInt(process.env.RATE_LIMIT_QUEUE_WINDOW_SECS || "60") * 1000,
    queueActionsMax: parseInt(process.env.RATE_LIMIT_QUEUE_MAX || "30"),
    // Token generation specific limits
    tokenGenerationWindow:
      parseInt(process.env.RATE_LIMIT_TOKEN_WINDOW_MINS || "30") * 60 * 1000, // 30 minutes
    tokenGenerationMax: parseInt(process.env.RATE_LIMIT_TOKEN_MAX || "5"), // 5 tokens per 30 minutes per queue
    duplicateCheckWindow:
      parseInt(process.env.DUPLICATE_CHECK_WINDOW_HOURS || "24") * 60 * 60 * 1000, // 24 hours
  },
};

// Helper function to validate port number
function validatePort(port, defaultPort) {
  const parsedPort = parseInt(port);
  if (isNaN(parsedPort) || parsedPort < 0 || parsedPort > 65535) {
    console.warn(`Invalid port ${port}, using default port ${defaultPort}`);
    return defaultPort;
  }
  return parsedPort;
}

// Helper function to parse CORS origins
function parseOrigins(originsString, defaultOrigins) {
  if (!originsString) return defaultOrigins;

  try {
    // Try to parse as JSON array
    const origins = JSON.parse(originsString);
    if (Array.isArray(origins)) return origins;
    return defaultOrigins;
  } catch (err) {
    // If not JSON, treat as comma-separated string
    return originsString.split(",").map((origin) => origin.trim());
  }
}

// Validate the NODE_ENV
if (!["development", "production", "test"].includes(config.NODE_ENV)) {
  console.warn(
    `Invalid NODE_ENV: ${config.NODE_ENV}, using 'development' as default`
  );
  config.NODE_ENV = "development";
}

if (config.NODE_ENV === "production") {
  const requiredProductionVariables = [
    "MONGODB_URI",
    "JWT_SECRET",
    "CORS_ORIGINS",
  ];
  const missingVariables = requiredProductionVariables.filter(
    (variable) => !process.env[variable]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missingVariables.join(", ")}`
    );
  }
}

// Log configuration in development mode
if (config.NODE_ENV === "development") {
  console.log("Configuration:", {
    NODE_ENV: config.NODE_ENV,
    port: config.server.port,
    database: { uri: maskUri(config.database.uri) },
    cors: { origins: config.cors.origins },
  });
}

// Helper function to mask sensitive URI parts
function maskUri(uri) {
  try {
    return uri.replace(/:\/\/[^@]+@/, "://***:***@");
  } catch (err) {
    return "Invalid URI";
  }
}

module.exports = config;
