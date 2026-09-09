const mongoose = require("mongoose");

const panchayatSchema = new mongoose.Schema(
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

    panchayatCode: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    panchayatName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Panchayat", panchayatSchema);