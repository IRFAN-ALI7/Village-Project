const mongoose = require("mongoose");

const panchayatVillageSchema = new mongoose.Schema(
  {
    subDistrictCode: {
      type: Number,
      required: true,
      index: true,
    },

    panchayatCode: {
      type: Number,
      required: true,
      index: true,
    },

    villageCode: {
      type: Number,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

panchayatVillageSchema.index(
  {
    subDistrictCode: 1,
    panchayatCode: 1,
    villageCode: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "PanchayatVillage",
  panchayatVillageSchema
);