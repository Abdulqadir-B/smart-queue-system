/**
 * Authentication Routes
 * Handles user registration, login, and logout
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { auth } = require("../middleware");
const { authLimiter, registrationRateLimiter } = require("../middleware/rateLimiter");
const { registerValidation, loginValidation } = require("../validators");

/**
 * Public routes (no authentication required)
 */

// Register new user
// POST /api/auth/register
// Rate limits: 3 successful registrations per 24h, 10 failed attempts per 6h
router.post("/register", registrationRateLimiter, registerValidation, authController.register);

// Login user
// POST /api/auth/login
router.post("/login", authLimiter, loginValidation, authController.login);

/**
 * Protected routes (authentication required)
 */

// Get current user profile
// GET /api/auth/me
router.get("/me", auth, authController.getMe);

// Logout user
// POST /api/auth/logout
router.post("/logout", auth, authController.logout);

// Delete user account
// DELETE /api/auth/delete-account
router.delete("/delete-account", auth, authController.deleteAccount);

module.exports = router;
