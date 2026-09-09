const mongoose = require("mongoose");

const postOfficeSchema = new mongoose.Schema(
  {
    circleName: {
      type: String,
      trim: true,
    },

    regionName: {
      type: String,
      trim: true,
    },

    divisionName: {
      type: String,
      trim: true,
    },

    officeName: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: Number,
      required: true,
      index: true,
    },

    officeType: {
      type: String,
      trim: true,
    },

    delivery: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
      index: true,
    },

    stateName: {
      type: String,
      trim: true,
      index: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

postOfficeSchema.index({
  pincode: 1,
  officeName: 1,
});

module.exports = mongoose.model("PostOffice", postOfficeSchema);