const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Housing",
        "Agriculture",
        "Health",
        "Education",
        "Social Welfare",
        "Employment",
        "Women Empowerment",
        "Environment",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    officialLink: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    imagePublicId: {
  type: String,
  default: "",
},

    startDate: {
      type: String,
      default: "",
    },

    endDate: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    eligibility: {
      type: String,
      required: true,
      trim: true,
    },

    documents: {
      type: String,
      default: "",
    },

    // SCHEME OWNE
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    // PANCHAYAT SCOP
    panchayat: {
      type: String,
      default: "",
      trim: true,
    },

    panchayatCode: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// PANCHAYAT-WISE QUERY INDEX
schemeSchema.index({
  panchayatCode: 1,
  createdAt: -1,
});

schemeSchema.index({
  panchayat: 1,
  createdAt: -1,
});


module.exports = mongoose.model("Scheme", schemeSchema);