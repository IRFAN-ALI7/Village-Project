const State = require("../models/locations/State");
const District = require("../models/locations/District");
const SubDistrict = require("../models/locations/SubDistrict");
const Panchayat = require("../models/locations/Panchayat");
const PanchayatVillage = require("../models/locations/PanchayatVillage");
const Village = require("../models/locations/Village");
const PostOffice = require("../models/locations/PostOffice");


// GET STATES
const getStates = async (req, res) => {
  try {
    const states = await State.find({})
      .select("stateCode stateName")
      .sort({ stateName: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: states.length,
      data: states,
    });
  } catch (error) {
    console.error("Get states error:", error);

    return res.status(500).json({
      success: false,
      message: "States fetch karne mein error hua.",
    });
  }
};


// GET DISTRICTS BY STATE
const getDistrictsByState = async (req, res) => {
  try {
    const stateCode = Number(req.params.stateCode);

    if (!Number.isInteger(stateCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid state code.",
      });
    }

    const districts = await District.find({
      stateCode,
    })
      .select("stateCode districtCode districtName")
      .sort({ districtName: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: districts.length,
      data: districts,
    });
  } catch (error) {
    console.error(
      "Get districts by state error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Districts fetch karne mein error hua.",
    });
  }
};


// GET SUBDISTRICTS BY DISTRICT
const getSubDistrictsByDistrict = async (
  req,
  res
) => {
  try {
    const districtCode = Number(
      req.params.districtCode
    );

    if (!Number.isInteger(districtCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid district code.",
      });
    }

    const subDistricts =
      await SubDistrict.find({
        districtCode,
      })
        .select(
          "districtCode subDistrictCode subDistrictName"
        )
        .sort({ subDistrictName: 1 })
        .lean();

    return res.status(200).json({
      success: true,
      count: subDistricts.length,
      data: subDistricts,
    });
  } catch (error) {
    console.error(
      "Get subdistricts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "SubDistricts fetch karne mein error hua.",
    });
  }
};


// GET PANCHAYATS BY SUBDISTRICT
const getPanchayatsBySubDistrict = async (
  req,
  res
) => {
  try {
    const subDistrictCode = Number(
      req.params.subDistrictCode
    );

    if (!Number.isInteger(subDistrictCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SubDistrict code.",
      });
    }

    const mappings =
      await PanchayatVillage.find({
        subDistrictCode,
      })
        .select("panchayatCode")
        .lean();

    const panchayatCodes = [
      ...new Set(
        mappings.map(
          (item) => item.panchayatCode
        )
      ),
    ];

    if (!panchayatCodes.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const panchayats =
      await Panchayat.find({
        panchayatCode: {
          $in: panchayatCodes,
        },
      })
        .select(
          "districtCode panchayatCode panchayatName"
        )
        .sort({ panchayatName: 1 })
        .lean();

    return res.status(200).json({
      success: true,
      count: panchayats.length,
      data: panchayats,
    });
  } catch (error) {
    console.error(
      "Get panchayats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Panchayats fetch karne mein error hua.",
    });
  }
};


// GET VILLAGES BY PANCHAYAT
const getVillagesByPanchayat = async (
  req,
  res
) => {
  try {
    const subDistrictCode = Number(
      req.params.subDistrictCode
    );

    const panchayatCode = Number(
      req.params.panchayatCode
    );

    if (
      !Number.isInteger(
        subDistrictCode
      ) ||
      !Number.isInteger(panchayatCode)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid SubDistrict or Panchayat code.",
      });
    }

    const mappings =
      await PanchayatVillage.find({
        subDistrictCode,
        panchayatCode,
      })
        .select("villageCode")
        .lean();

    const villageCodes = mappings.map(
      (item) => item.villageCode
    );

    if (!villageCodes.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const villages =
      await Village.find({
        villageCode: {
          $in: villageCodes,
        },
      })
        .select(
          "districtCode subDistrictCode villageCode villageName pincode"
        )
        .sort({ villageName: 1 })
        .lean();

    return res.status(200).json({
      success: true,
      count: villages.length,
      data: villages,
    });
  } catch (error) {
    console.error(
      "Get villages error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Villages fetch karne mein error hua.",
    });
  }
};

// GET POST OFFICES BY PINCODE
const getPostOfficesByPincode = async (
  req,
  res
) => {
  try {
    const pincode = Number(
      req.params.pincode
    );

    if (
      !Number.isInteger(pincode) ||
      pincode < 100000 ||
      pincode > 999999
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode.",
      });
    }

    const postOffices =
      await PostOffice.find({
        pincode,
      })
        .select(
          "circleName regionName divisionName officeName pincode officeType delivery district stateName latitude longitude"
        )
        .sort({ officeName: 1 })
        .lean();

    return res.status(200).json({
      success: true,
      count: postOffices.length,
      data: postOffices,
    });
  } catch (error) {
    console.error(
      "Get post offices error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Post Offices fetch karne mein error hua.",
    });
  }
};

module.exports = {
  getStates,
  getDistrictsByState,
  getSubDistrictsByDistrict,
  getPanchayatsBySubDistrict,
  getVillagesByPanchayat,
  getPostOfficesByPincode,
};