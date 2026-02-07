/**
 * Analytics Routes
 * Handles analytics and reporting endpoints
 */
const express = require("express");
const { analyticsCounts } = require("../controllers");
const { auth, authorize } = require("../middleware");

const router = express.Router();

/**
 * Analytics routes
 * All routes require ADMIN authentication
 */

// Get basic analytics counts (admin only)
router.get("/counts", auth, authorize(["admin"]), analyticsCounts); // GET /api/analytics/counts

module.exports = router;
