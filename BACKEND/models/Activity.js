const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Notification audience
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

        "COMPLAINT_SUBMITTED",
        "COMPLAINT_IN_PROGRESS",
        "COMPLAINT_RESOLVED",
        "COMPLAINT_REJECTED",

        "CERTIFICATE_APPLIED",
        "CERTIFICATE_APPROVED",
        "CERTIFICATE_REJECTED",

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
      default: "",
      trim: true,
    },

    route: {
      type: String,
      default: "",
    },

    isNotification: {
      type: Boolean,
      default: false,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "low",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "completed",
    },

  
    // PANCHAYAT SCOPE
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


// INDEXES
activitySchema.index({
  user: 1,
  createdAt: -1,
});

activitySchema.index({
  audience: 1,
  panchayatCode: 1,
  createdAt: -1,
});

activitySchema.index({
  panchayatCode: 1,
  createdAt: -1,
});


module.exports = mongoose.model("Activity", activitySchema);