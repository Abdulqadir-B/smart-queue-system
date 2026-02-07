/**
 * QueueToken model
 * Tracks individual tokens issued to customers
 */
const mongoose = require("mongoose");

const QueueTokenSchema = new mongoose.Schema(
  {
    // Reference to the queue this token belongs to
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
      index: true,
    },
    // The queue name (for easier queries)
    queueName: {
      type: String,
      required: true,
      index: true,
    },
    // Token number
    tokenNumber: {
      type: Number,
      required: true,
      index: true,
    },
    // Reference to user (optional - only for registered users)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    // Customer information
    customer: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
    },
    // Verification key for secure token tracking (6-digit PIN)
    verificationKey: {
      type: String,
      required: true,
      index: true,
    },
    // Status of the token
    status: {
      type: String,
      enum: ["waiting", "serving", "served", "abandoned"],
      default: "waiting",
      index: true,
    },
    // Estimated wait time (in minutes) at the time of issuance
    estimatedWaitTime: {
      type: Number,
      default: 0,
    },
    // When the token was called for service
    calledAt: {
      type: Date,
      default: null,
    },
    // When the service was completed
    servedAt: {
      type: Date,
      default: null,
    },
    // Notes or special requests
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Add instance methods
QueueTokenSchema.methods = {
  /**
   * Mark this token as being served
   * @returns {Promise<void>}
   */
  async markServing() {
    try {
      this.status = "serving";
      this.calledAt = new Date();
      await this.save();
    } catch (error) {
      console.error(`Error marking token as serving:`, error);
      throw error;
    }
  },

  /**
   * Mark this token as served (completed)
   * @returns {Promise<void>}
   */
  async markServed() {
    this.status = "served";
    this.servedAt = new Date();
    await this.save();
  },

  /**
   * Mark this token as abandoned
   * @returns {Promise<void>}
   */
  async markAbandoned() {
    this.status = "abandoned";
    await this.save();
  },

  /**
   * Calculate wait time (in minutes)
   * @returns {Number} Wait time in minutes
   */
  getWaitTime() {
    if (!this.calledAt) return null;

    const startTime = new Date(this.createdAt);
    const endTime = new Date(this.calledAt);

    return Math.round((endTime - startTime) / (1000 * 60));
  },

  /**
   * Calculate service time (in minutes)
   * @returns {Number} Service time in minutes
   */
  getServiceTime() {
    if (!this.calledAt || !this.servedAt) return null;

    const startTime = new Date(this.calledAt);
    const endTime = new Date(this.servedAt);

    return Math.round((endTime - startTime) / (1000 * 60));
  },
};

// Add static methods
QueueTokenSchema.statics = {
  /**
   * Find all active tokens for a queue
   * @param {String} queueId - Queue ID
   * @returns {Promise<Array>} Array of active tokens
   */
  async findActiveByQueue(queueId) {
    return this.find({
      queue: queueId,
      status: { $in: ["waiting", "serving"] },
    }).sort({ tokenNumber: 1 });
  },

  /**
   * Get the next waiting token for a queue
   * @param {String} queueId - Queue ID
   * @returns {Promise<QueueToken>} Next waiting token or null
   */
  async getNextWaiting(queueId) {
    return this.findOne({
      queue: queueId,
      status: "waiting",
    }).sort({ tokenNumber: 1 });
  },

  /**
   * Calculate average wait time for a queue (in minutes)
   * @param {String} queueId - Queue ID
   * @param {Number} [lastNHours=24] - Consider tokens from the last N hours
   * @returns {Promise<Number>} Average wait time in minutes
   */
  async getAverageWaitTime(queueId, lastNHours = 24) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - lastNHours);

    const result = await this.aggregate([
      {
        $match: {
          queue: mongoose.Types.ObjectId(queueId),
          calledAt: { $exists: true, $ne: null },
          createdAt: { $gte: cutoffTime },
        },
      },
      {
        $project: {
          waitTime: {
            $divide: [
              { $subtract: ["$calledAt", "$createdAt"] },
              60000, // Convert ms to minutes
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageWaitTime: { $avg: "$waitTime" },
        },
      },
    ]);

    return result.length > 0 ? Math.round(result[0].averageWaitTime) : 0;
  },
};

// Create and export the model
const QueueToken = mongoose.model("QueueToken", QueueTokenSchema);
module.exports = QueueToken;
