/**
 * Routes index file
 * Centralized configuration for all routes
 */
const express = require("express");
const queueManagementRoutes = require("./queueManagementRoutes");
const tokenRoutes = require("./tokenRoutes");
const queueStateRoutes = require("./queueStateRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const authRoutes = require("./authRoutes");

const router = express.Router();

/**
 * Authentication routes
 */
router.use("/auth", authRoutes);

/**
 * Queue management routes
 */
router.use("/queues", queueManagementRoutes);

/**
 * Token operation routes
 */
router.use("/queues", tokenRoutes);

/**
 * Queue state operation routes
 */
router.use("/queues", queueStateRoutes);

/**
 * Analytics routes
 */
router.use("/analytics", analyticsRoutes);

module.exports = router;
