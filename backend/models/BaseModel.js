/**
 * Base model functionality to be shared across models
 */
const mongoose = require("mongoose");

/**
 * Creates a base schema with common fields
 * @returns {mongoose.Schema} A mongoose schema with common fields
 */
function createBaseSchema() {
  return new mongoose.Schema(
    {
      isDeleted: {
        type: Boolean,
        default: false,
        index: true,
      },
    },
    {
      timestamps: true,
      toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
          delete ret.__v;
          return ret;
        },
      },
      toObject: { virtuals: true },
    }
  );
}

/**
 * Adds common methods to a schema
 * @param {mongoose.Schema} schema - The schema to add methods to
 */
function addBaseMethods(schema) {
  // Static methods
  schema.statics.softDelete = async function (id) {
    return this.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  };
}

module.exports = {
  createBaseSchema,
  addBaseMethods,
};
