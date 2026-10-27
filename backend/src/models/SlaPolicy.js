const mongoose = require('mongoose');

const slaPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    responseHours: {
      type: Number,
      required: true,
      default: 24,
    },
    resolutionHours: {
      type: Number,
      required: true,
      default: 72,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SlaPolicy', slaPolicySchema);
