const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    certificateId: {
      type: String,
      required: true,
      unique: true,
    },

    type: String,

    applicantName: String,

    appliedDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    issueDate: {
      type: Date,
      default: null,
    },

    fatherName: String,
    dateOfBirth: String,
    gender: String,
    phoneNumber: String,
    address: String,

    annualIncome: String,
    occupation: String,

    placeOfBirth: String,
    birthLocation: String,

    deceasedName: String,
    dateOfDeath: String,
    causeOfDeath: String,

    casteCategory: String,
    yearsOfResidence: Number,

    aadhaarNumber: String,
    panNumber: String,

    purpose: String,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

const Certificate = mongoose.model("Certificate", certificateSchema);

module.exports = Certificate;