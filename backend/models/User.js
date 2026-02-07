/**
 * User model
 * Handles user authentication and authorization
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { addBaseMethods } = require("./BaseModel");
const { generateToken } = require("../utils/jwt");

// Schema definition
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't include by default in queries
    },
    role: {
      type: String,
      enum: ["admin", "staff", "user"],
      default: "user",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Add instance methods
UserSchema.methods = {
  /**
   * Get public user profile
   * @returns {Object} Public user data
   */
  getProfile() {
    return {
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
    };
  },

  /**
   * Record login timestamp
   * @returns {Promise<void>}
   */
  async updateLoginTimestamp() {
    this.lastLogin = new Date();
    await this.save();
  },

  /**
   * Compare provided password with stored hash
   * @param {String} candidatePassword - Password to check
   * @returns {Promise<Boolean>} True if password matches
   */
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  },

  /**
   * Generate JWT token for this user
   * @returns {String} JWT token
   */
  generateAuthToken() {
    return generateToken({
      userId: this._id,
      email: this.email,
      role: this.role,
    });
  },
};

// Add static methods
UserSchema.statics = {
  /**
   * Find user by email
   * @param {String} email - User email
   * @returns {Promise<User>} User document
   */
  async findByEmail(email) {
    return this.findOne({ email, isActive: true });
  },

  /**
   * Find user by username
   * @param {String} username - Username
   * @returns {Promise<User>} User document
   */
  async findByUsername(username) {
    return this.findOne({ username, isActive: true });
  },
};

// Add a pre-save hook for password hashing
UserSchema.pre("save", async function (next) {
  // Only hash password if it's new or modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Add base methods (from BaseModel)
addBaseMethods(UserSchema);

// Create and export the model
const User = mongoose.model("User", UserSchema);
module.exports = User;
