const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema(
  {

    // PERSONAL INFORMATION
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    profilePhotoPublicId: {
    type: String,
      default: "",
   },

    // EMAIL CHANGE VERIFICATION
    pendingEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },

    emailChangeOtpHash: {
      type: String,
      default: null,
    },

    emailChangeOtpExpiresAt: {
      type: Date,
      default: null,
    },

    // LOGIN OTP VERIFICATION
    loginOtpHash: {
      type: String,
      default: null,
    },

    loginOtpExpiresAt: {
      type: Date,
      default: null,
    },


    // FORGOT PASSWORD OTP VERIFICATION
    forgotPasswordOtpHash: {
      type: String,
      default: null,
    },

    forgotPasswordOtpExpiresAt: {
      type: Date,
      default: null,
    },

    // LOCATION
    state: {
      type: String,
      default: "Jharkhand",
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

    // ACCOUNT INFORMATION
    role: {
      type: String,
      default: "admin",
      enum: ["admin"],
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// HASH PASSWORD BEFORE SAVING
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});


// COMPARE PASSWORD DURING LOGIN
adminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;