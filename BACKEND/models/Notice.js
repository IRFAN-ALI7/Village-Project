const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "urgent",
        "meeting",
        "scheme",
        "service",
        "general",
      ],
      default: "general",
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    validUpto: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    fullDetails: {
      type: String,
      default: "",
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    // NOTICE OWNER / PANCHAYAT
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    panchayat: {
      type: String,
      default: "",
      trim: true,
    },

    panchayatCode: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for Panchayat-wise notice queries
noticeSchema.index({
  panchayatCode: 1,
  createdAt: -1,
});

noticeSchema.index({
  panchayat: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Notice", noticeSchema);