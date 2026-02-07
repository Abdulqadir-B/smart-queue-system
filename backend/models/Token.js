/**
 * Token model
 * Handles authentication tokens and session management
 */
const mongoose = require("mongoose");

// Schema definition
const TokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["access", "refresh", "reset"],
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Add instance methods
TokenSchema.methods = {
  /**
   * Check if token is expired
   * @returns {Boolean} True if expired
   */
  isExpired() {
    return Date.now() >= this.expiresAt;
  },

  /**
   * Revoke this token
   * @returns {Promise<void>}
   */
  async revoke() {
    this.isRevoked = true;
    await this.save();
  },
};

// Add static methods
TokenSchema.statics = {
  /**
   * Find valid token
   * @param {String} token - Token string
   * @param {String} type - Token type
   * @returns {Promise<Token>} Token document
   */
  async findValid(token, type) {
    return this.findOne({
      token,
      type,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
  },

  /**
   * Revoke all tokens for a user
   * @param {String} userId - User ID
   * @param {String} [type] - Optional token type
   * @returns {Promise<Number>} Number of tokens revoked
   */
  async revokeAll(userId, type = null) {
    const query = { user: userId };
    if (type) {
      query.type = type;
    }

    const result = await this.updateMany(query, { isRevoked: true });
    return result.modifiedCount;
  },
};

// Create and export the model
const Token = mongoose.model("Token", TokenSchema);
module.exports = Token;
