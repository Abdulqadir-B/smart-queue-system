/**
 * Queue State Routes
 * Handles queue state operations (pause, resume, reset)
 */
const express = require("express");
const { pauseQueue, resumeQueue, resetQueue } = require("../controllers");
const { queueNameParamValidation } = require("../validators");
const { queueActionLimiter, auth, authorize } = require("../middleware");

const router = express.Router();

/**
 * Queue state operation routes
 * Staff and Admin can control queue state
 */

// Pause a queue (staff and admin)
router.post(
  "/:name/pause",
  auth,
  authorize(["staff", "admin"]),
  queueNameParamValidation,
  queueActionLimiter,
  pauseQueue
); // POST /api/queues/:name/pause

// Resume a queue (staff and admin)
router.post(
  "/:name/resume",
  auth,
  authorize(["staff", "admin"]),
  queueNameParamValidation,
  queueActionLimiter,
  resumeQueue
); // POST /api/queues/:name/resume

// Reset a queue (staff and admin)
router.post(
  "/:name/reset",
  auth,
  authorize(["staff", "admin"]),
  queueNameParamValidation,
  queueActionLimiter,
  resetQueue
); // POST /api/queues/:name/reset

module.exports = router;
