const mongoose = require("mongoose");

const villageSchema = new mongoose.Schema(
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

    subDistrictCode: {
      type: Number,
      required: true,
      index: true,
    },

    villageCode: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    villageName: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: Number,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Village", villageSchema);