const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

// Import configuration
const config = require("./config");

// Import middleware
const { 
  errorHandler, 
  notFoundHandler, 
  globalLimiter, 
  sanitizeInput, 
  mongoSanitizeMiddleware 
} = require("./middleware");
// Import socket service
const { setupSocketIO } = require("./services");

const app = express();
// Enable trust proxy for reverse proxies (Render, Vercel, Heroku, etc.)
// Ensures req.ip correctly extracts the client's real IP from X-Forwarded-For
app.set("trust proxy", 1);

const server = http.createServer(app);
const { Server } = require("socket.io");

// Socket.io setup with configuration-based CORS
const io = new Server(server, {
  cors: {
    origin: config.cors.origins,
    methods: ["GET", "POST"],
    credentials: config.cors.credentials,
  },
});

// Basic middleware
app.use(
  cors({
    origin: config.cors.origins,
    credentials: config.cors.credentials,
  })
);

// Enhanced Helmet security headers
app.use(
  helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Material-UI
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", ...config.cors.origins],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    // HTTP Strict Transport Security (HSTS)
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    // Prevent clickjacking
    frameguard: {
      action: "deny",
    },
    // Prevent MIME type sniffing
    noSniff: true,
    // Disable X-Powered-By header
    hidePoweredBy: true,
    // XSS Protection (for older browsers)
    xssFilter: true,
    // Referrer Policy
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
  })
);

app.use(express.json({ limit: "10mb" })); // Limit request body size

// Sanitize request bodies before validation and route handlers.
// MongoDB query/param sanitization remains disabled because Express 5 exposes
// those objects as read-only; query and route inputs are explicitly validated.
app.use(sanitizeInput);

// Apply global rate limiting
app.use(globalLimiter);

// Routes
const routes = require("./routes");
app.use("/api", routes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Handle favicon requests to prevent 404 errors
app.get("/favicon.ico", (req, res) => {
  res.status(204).end(); // 204 No Content
});

// Initialize Socket.io service with our io instance
const socketService = setupSocketIO(io);

// Error handling middleware - must be after all routes
app.use(notFoundHandler); // Handle 404 errors
app.use(errorHandler); // Handle all other errors

// Make io and socketService available to our routes
app.set("socketio", io);
app.set("socketService", socketService);

// Start server after DB connect
const { port } = config.server;
const { uri, options } = config.database;

async function startServer() {
  try {
    await mongoose.connect(uri, options);
    console.log("Connected to MongoDB");

    server.listen(port, config.server.host, () => {
      console.log(`Server listening on ${config.server.host}:${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

startServer();
