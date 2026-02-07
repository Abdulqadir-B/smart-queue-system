/**
 * Queue State Controller
 * Handles queue state operations (pause, resume, reset)
 */
const { Queue, QueueToken } = require("../models");
const { AppError } = require("../middleware");

/**
 * Pause queue
 * @route POST /api/queues/:name/pause
 */
exports.pauseQueue = async (req, res, next) => {
  try {
    const { name } = req.params;
    const queue = await Queue.findOneAndUpdate(
      { name },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!queue) {
      throw new AppError("Queue not found", 404);
    }

    // Get socket.io instance
    const io = req.app.get("socketio");
    if (io) {
      // Emit real-time update
      io.emit("queue:update", {
        action: "pause",
        queueName: queue.name,
        isActive: false,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Queue paused",
      data: { name: queue.name, isActive: queue.isActive },
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("pauseQueue error", err);
    return next(new AppError("Failed to pause queue", 500));
  }
};

/**
 * Resume queue
 * @route POST /api/queues/:name/resume
 */
exports.resumeQueue = async (req, res, next) => {
  try {
    const { name } = req.params;
    const queue = await Queue.findOneAndUpdate(
      { name },
      { $set: { isActive: true } },
      { new: true }
    );
    if (!queue) {
      throw new AppError("Queue not found", 404);
    }

    // Get socket.io instance
    const io = req.app.get("socketio");
    if (io) {
      // Emit real-time update
      io.emit("queue:update", {
        action: "resume",
        queueName: queue.name,
        isActive: true,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Queue resumed",
      data: { name: queue.name, isActive: queue.isActive },
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("resumeQueue error", err);
    return next(new AppError("Failed to resume queue", 500));
  }
};

/**
 * Reset queue (clears counters and deletes all tokens)
 * @route POST /api/queues/:name/reset
 */
exports.resetQueue = async (req, res, next) => {
  try {
    const { name } = req.params;
    const queue = await Queue.findOne({ name });
    if (!queue) {
      throw new AppError("Queue not found", 404);
    }
    
    // Delete all tokens for this queue
    const deleteResult = await QueueToken.deleteMany({ queueName: queue.name });
    
    queue.lastToken = 0;
    queue.servingToken = 0;
    await queue.save();

    // Get socket.io instance
    const io = req.app.get("socketio");
    if (io) {
      // Emit real-time update
      io.emit("queue:update", {
        action: "reset",
        queueName: queue.name,
        lastToken: 0,
        servingToken: 0,
        waiting: 0,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Queue reset",
      data: {
        name: queue.name,
        servingToken: 0,
        lastToken: 0,
        tokensDeleted: deleteResult.deletedCount,
      },
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("resetQueue error", err);
    return next(new AppError("Failed to reset queue", 500));
  }
};
