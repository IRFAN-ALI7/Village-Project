const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    // PERSONAL INFORMATION
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{10}$/,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    // EMAIL OTP
    emailOtp: {
      type: String,
      default: null,
    },

    emailOtpExpiresAt: {
      type: Date,
      default: null,
    },

    emailOtpPurpose: {
      type: String,
      enum: [
        "registration",
        "forgot-password",
        "email-change",
        null,
      ],
      default: null,
    },

    emailOtpAttempts: {
      type: Number,
      default: 0,
    },

    emailOtpLastSentAt: {
      type: Date,
      default: null,
    },

    // PENDING EMAIL
    pendingEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },

    pendingEmailVerified: {
      type: Boolean,
      default: false,
    },

    // REGISTRATION STATUS
    registrationStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "completed",
    },

    profileImage: {
      type: String,
      default: "",
    },

    profileImagePublicId: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    // LOCATION
    state: {
      type: String,
      required: true,
      trim: true,
    },

    stateCode: {
      type: Number,
      required: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    districtCode: {
      type: Number,
      required: true,
    },

    subDistrict: {
      type: String,
      required: true,
      trim: true,
    },

    subDistrictCode: {
      type: Number,
      required: true,
    },

    panchayat: {
      type: String,
      required: true,
      trim: true,
    },

    panchayatCode: {
      type: Number,
      required: true,
    },

    village: {
      type: String,
      required: true,
      trim: true,
    },

    villageCode: {
      type: Number,
      required: true,
    },

    // ADDRESS DETAILS
    pincode: {
      type: Number,
      required: true,
      min: 100000,
      max: 999999,
    },

    postOffice: {
      type: String,
      required: true,
      trim: true,
    },

    policeStation: {
      type: String,
      required: true,
      trim: true,
    },

    // AUTHENTICATION
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// HASH PASSWORD
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);