const mongoose = require("mongoose");

const superAdminNoticeSchema = new mongoose.Schema(
  {
    // Notice information
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "General",
        "Administrative",
        "Technical",
        "Security",
        "Training",
        "Emergency",
      ],
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    validUpto: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    fullDetails: {
      type: String,
      default: "",
      trim: true,
    },

    // Audience
    audience: {
      type: String,
      enum: ["all", "specific"],
      required: true,
      default: "all",
    },

    // Filled only when audience = specific
    selectedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    // Pin notice
    isPinned: {
      type: Boolean,
      default: false,
    },

    // Super Admin who created the notice
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster notice listing/filtering
superAdminNoticeSchema.index({ createdAt: -1 });
superAdminNoticeSchema.index({ category: 1 });
superAdminNoticeSchema.index({ audience: 1 });
superAdminNoticeSchema.index({ selectedAdmin: 1 });
superAdminNoticeSchema.index({ isPinned: -1 });

const SuperAdminNotice = mongoose.model(
  "SuperAdminNotice",
  superAdminNoticeSchema
);

module.exports = SuperAdminNotice;