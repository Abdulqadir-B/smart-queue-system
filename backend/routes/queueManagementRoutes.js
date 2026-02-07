/**
 * Queue Management Routes
 * Handles queue creation, listing, and status
 */
const express = require("express");
const { createQueue, listQueues, getStatus, deleteQueue } = require("../controllers");
const {
  createQueueValidation,
  queueNameParamValidation,
} = require("../validators");
const {
  queueActionLimiter,
  publicQueueLimiter,
  auth,
  authorize,
} = require("../middleware");

const router = express.Router();

/**
 * Queue management routes
 */

// PUBLIC ROUTES (No authentication required)

// List all queues (customers can see available queues)
router.get("/", publicQueueLimiter, listQueues); // GET /api/queues

// Get queue status (customers can check queue status)
router.get("/:name/status", queueNameParamValidation, publicQueueLimiter, getStatus); // GET /api/queues/:name/status

// ADMIN-ONLY ROUTES (Authentication + Admin role required)

// Create a new queue (admin only)
router.post(
  "/",
  auth,
  authorize(["admin"]),
  createQueueValidation,
  queueActionLimiter,
  createQueue
); // POST /api/queues { name }

// Delete a queue (admin only)
router.delete(
  "/:name",
  auth,
  authorize(["admin"]),
  queueNameParamValidation,
  queueActionLimiter,
  deleteQueue
); // DELETE /api/queues/:name

module.exports = router;
