const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    audience: {
      type: String,
      enum: ["user", "admin", "all"],
      required: true,
    },

    createdBy: {
      type: String,
      enum: ["user", "admin", "system"],
      required: true,
    },

    type: {
      type: String,
      enum: [
        "REGISTERED",
        "LOGIN",
        "PROFILE_UPDATED",
        "PASSWORD_CHANGED",
        "PASSWORD_RESET",
        "ACCOUNT_DELETED",

        // Complaint
        "COMPLAINT_SUBMITTED",
        "COMPLAINT_IN_PROGRESS",
        "COMPLAINT_RESOLVED",
        "COMPLAINT_REJECTED",

        // Certificate
        "CERTIFICATE_APPLIED",
        "CERTIFICATE_APPROVED",
        "CERTIFICATE_REJECTED",

        // Scheme & Notice
        "NEW_SCHEME",
        "NEW_NOTICE",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    route: {
      type: String,
      default: "/",
    },

    isNotification: {
      type: Boolean,
      default: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    priority:{
        type: String,
        enum:["low", "medium", "high", "urgent"],
        default: "medium",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);