/**
 * Token Operation Routes
 * Handles token issuance and processing
 */
const express = require("express");
const {
  joinQueue,
  callNext,
  completeService,
  getTokenStatus,
  listQueueTokens,
  abandonToken,
  getMyActiveTokens,
} = require("../controllers");
const { 
  queueNameParamValidation,
  joinQueueValidation,
  completeServiceValidation,
  tokenStatusValidation,
  tokenNumberParamValidation,
} = require("../validators");
const { 
  queueActionLimiter, 
  tokenStatusLimiter,
  tokenGenerationLimiter,
  auth,
  optionalAuth,
  authorize 
} = require("../middleware");

const router = express.Router();

/**
 * Token operation routes
 */

// PUBLIC ROUTES (No authentication required)

// Get logged-in user's active tokens
router.get(
  "/my-tokens",
  auth, // Requires authentication
  getMyActiveTokens
); // GET /api/queues/my-tokens

// Customer joins queue and gets a token
router.post(
  "/:name/join",
  optionalAuth, // Optional: Link to user if authenticated
  queueNameParamValidation,
  joinQueueValidation,
  tokenGenerationLimiter, // Per-queue rate limit: 2 tokens per hour per IP
  joinQueue
); // POST /api/queues/:name/join

// Get status for a specific token (customer tracking)
router.get(
  "/:name/token/:tokenNumber",
  queueNameParamValidation,
  tokenStatusValidation,
  tokenStatusLimiter,
  getTokenStatus
); // GET /api/queues/:name/token/:tokenNumber?verificationKey=123456

// STAFF + ADMIN ROUTES (Authentication + Role required)

// Staff calls next token
router.post(
  "/:name/next",
  auth,
  authorize(["staff", "admin"]),
  queueNameParamValidation,
  queueActionLimiter,
  callNext
); // POST /api/queues/:name/next

// Complete service for current token
router.post(
  "/:name/complete",
  auth,
  authorize(["staff", "admin"]),
  queueNameParamValidation,
  completeServiceValidation,
  queueActionLimiter,
  completeService
); // POST /api/queues/:name/complete

// Mark a token as abandoned
router.post(
  "/:name/token/:tokenNumber/abandon",
  auth,
  authorize(["staff", "admin"]),
  queueNameParamValidation,
  tokenNumberParamValidation,
  queueActionLimiter,
  abandonToken
); // POST /api/queues/:name/token/:tokenNumber/abandon

// List all tokens for a queue (staff/admin view)
router.get(
  "/:name/tokens",
  auth,
  authorize(["staff", "admin"]),
  queueNameParamValidation,
  listQueueTokens
); // GET /api/queues/:name/tokens

module.exports = router;
