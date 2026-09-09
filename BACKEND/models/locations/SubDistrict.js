const mongoose = require("mongoose");

const subDistrictSchema = new mongoose.Schema(
  {
    stateCode: {
      type: Number,
      required: true,
      index: true,
    },

    districtCode: {
      type: Number,
      required: true,
      index: true,
    },

    districtName: {
      type: String,
      required: true,
      trim: true,
    },

    subDistrictCode: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    subDistrictVersion: {
      type: Number,
      required: true,
    },

    subDistrictName: {
      type: String,
      required: true,
      trim: true,
    },

    subDistrictNameLocal: {
      type: String,
      default: "",
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SubDistrict",
  subDistrictSchema
);