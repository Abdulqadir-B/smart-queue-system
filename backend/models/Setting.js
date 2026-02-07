/**
 * Setting model
 * Handles application configuration settings
 */
const mongoose = require("mongoose");

// Schema definition
const SettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    type: {
      type: String,
      enum: ["string", "number", "boolean", "json", "array"],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Add static methods
SettingSchema.statics = {
  /**
   * Get setting by key
   * @param {String} key - Setting key
   * @returns {Promise<*>} Setting value or null
   */
  async getValue(key) {
    const setting = await this.findOne({ key });
    return setting ? setting.value : null;
  },

  /**
   * Set a setting value
   * @param {String} key - Setting key
   * @param {*} value - Setting value
   * @param {Object} options - Additional options
   * @returns {Promise<Setting>} Updated setting
   */
  async setValue(key, value, options = {}) {
    const update = {
      value,
      ...options,
    };

    return this.findOneAndUpdate(
      { key },
      { $set: update },
      { new: true, upsert: true }
    );
  },

  /**
   * Get all public settings
   * @returns {Promise<Object>} Object with key-value pairs
   */
  async getPublicSettings() {
    const settings = await this.find({ isPublic: true });
    return settings.reduce((result, item) => {
      result[item.key] = item.value;
      return result;
    }, {});
  },
};

// Create and export the model
const Setting = mongoose.model("Setting", SettingSchema);
module.exports = Setting;
