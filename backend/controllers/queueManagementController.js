/**
 * Queue Management Controller
 * Handles queue creation and listing
 */
const { Queue, QueueToken } = require("../models");
const { AppError } = require("../middleware");

/**
 * Create a new queue
 * @route POST /api/queues
 */
exports.createQueue = async (req, res, next) => {
  try {
    const { name } = req.body;

    const exists = await Queue.findOne({ name });
    if (exists) {
      throw new AppError("Queue with this name already exists", 409);
    }

    const queue = await Queue.create({ name });
    return res.status(201).json({
      status: "success",
      data: queue,
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("createQueue error", err);
    return next(new AppError("Failed to create queue", 500));
  }
};

/**
 * List all queues
 * @route GET /api/queues
 */
exports.listQueues = async (_req, res, next) => {
  try {
    const queues = await Queue.find({}).sort({ name: 1 });
    return res.status(200).json({
      status: "success",
      results: queues.length,
      data: queues,
    });
  } catch (err) {
    console.error("listQueues error", err);
    return next(new AppError("Failed to list queues", 500));
  }
};

/**
 * Get queue status
 * @route GET /api/queues/:name/status
 */
exports.getStatus = async (req, res, next) => {
  try {
    const { name } = req.params;
    const queue = await Queue.findOne({ name });
    if (!queue) {
      throw new AppError("Queue not found", 404);
    }

    return res.status(200).json({
      status: "success",
      data: {
        name: queue.name,
        servingToken: queue.servingToken,
        lastToken: queue.lastToken,
        waiting: Math.max(0, queue.lastToken - queue.servingToken),
        isActive: queue.isActive,
      },
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("getStatus error", err);
    return next(new AppError("Failed to get queue status", 500));
  }
};

/**
 * Delete a queue
 * @route DELETE /api/queues/:name
 */
exports.deleteQueue = async (req, res, next) => {
  try {
    const { name } = req.params;
    const queue = await Queue.findOne({ name });

    if (!queue) {
      throw new AppError("Queue not found", 404);
    }

    await QueueToken.deleteMany({ queue: queue._id });
    await Queue.deleteOne({ _id: queue._id });

    return res.status(200).json({
      status: "success",
      message: `Queue '${name}' has been deleted successfully`,
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("deleteQueue error", err);
    return next(new AppError("Failed to delete queue", 500));
  }
};
