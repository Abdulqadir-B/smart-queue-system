/**
 * Queue model
 * Handles queue management functionality
 */
const mongoose = require("mongoose");

const QueueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    lastToken: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    servingToken: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Virtual: waiting count
QueueSchema.virtual("waiting").get(function () {
  const current = this.servingToken || 0;
  const last = this.lastToken || 0;
  return Math.max(0, last - current);
});

// Add instance methods
QueueSchema.methods = {
  /**
   * Get queue status summary
   * @returns {Object} Queue status data
   */
  getStatus() {
    return {
      name: this.name,
      lastToken: this.lastToken,
      servingToken: this.servingToken,
      waiting: this.waiting,
      isActive: this.isActive,
    };
  },

  /**
   * Issue new token to a customer
   * @returns {Number} New token number
   */
  async issueToken() {
    const updated = await this.constructor.findOneAndUpdate(
      { _id: this._id, isActive: true },
      { $inc: { lastToken: 1 } },
      { new: true, runValidators: true }
    );
    if (!updated) return null;
    this.lastToken = updated.lastToken;
    return this.lastToken;
  },

  /**
   * Advance to next customer
   * @returns {Number} New serving token
   */
  async callNextToken() {
    const updated = await this.constructor.findOneAndUpdate(
      {
        _id: this._id,
        isActive: true,
        $expr: { $lt: ["$servingToken", "$lastToken"] },
      },
      { $inc: { servingToken: 1 } },
      { new: true, runValidators: true }
    );
    if (!updated) return null;
    this.servingToken = updated.servingToken;
    return this.servingToken;
  },
};

// Add static methods
QueueSchema.statics = {
  /**
   * Find queue by name
   * @param {String} name - Queue name
   * @returns {Promise<Queue>} Queue document
   */
  async findByName(name) {
    return this.findOne({ name });
  },

  /**
   * List all active queues
   * @returns {Promise<Array>} List of queues
   */
  async listActive() {
    return this.find({ isActive: true }).sort({ name: 1 });
  },
};

// Create and export the model
const Queue = mongoose.model("Queue", QueueSchema);
module.exports = Queue;
