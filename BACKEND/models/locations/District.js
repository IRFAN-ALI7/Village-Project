const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema(
  {
    districtCode: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    districtVersion: {
      type: Number,
      required: true,
    },

    districtName: {
      type: String,
      required: true,
      trim: true,
    },

    districtNameLocal: {
      type: String,
      trim: true,
    },

    census2001Code: {
      type: String,
      default: "",
      trim: true,
    },

    census2011Code: {
      type: String,
      default: "",
      trim: true,
    },

    stateCode: {
      type: Number,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("District", districtSchema);