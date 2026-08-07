const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
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
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

     panchayat: {
      type: String,
      required: true,
      trim: true,
    },

    village: {
      type: String,
      required: true,
      trim: true,
    },

    wardNo: {
      type: Number,
      required: true,
      min: 1,
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

    district: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: Number,
      required: true,
      min: 100000,
      max: 999999,
    },

    password: {
      type: String,
      required: true,
      minlength: 4,
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

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);