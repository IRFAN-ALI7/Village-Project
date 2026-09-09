const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    stateCode: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    stateName: {
      type: String,
      required: true,
      trim: true,
    },

    stateNameLocal: {
      type: String,
      trim: true,
    },

    stateVersion: {
      type: Number,
    },

    census2001Code: {
      type: Number,
    },

    census2011Code: {
      type: Number,
    },

    type: {
      type: String,
      enum: ["STATE", "UT"],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("State", stateSchema);