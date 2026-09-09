const express = require("express");

const {
  getStates,
  getDistrictsByState,
  getSubDistrictsByDistrict,
  getPanchayatsBySubDistrict,
  getVillagesByPanchayat,
  getPostOfficesByPincode,
} = require("../controllers/locationController");

const router = express.Router();

// -----------------------------------------
// State
// -----------------------------------------

router.get(
  "/states",
  getStates
);

// -----------------------------------------
// State → Districts
// -----------------------------------------

router.get(
  "/states/:stateCode/districts",
  getDistrictsByState
);

// -----------------------------------------
// District → SubDistricts
// -----------------------------------------

router.get(
  "/districts/:districtCode/subdistricts",
  getSubDistrictsByDistrict
);

// -----------------------------------------
// SubDistrict → Panchayats
// -----------------------------------------

router.get(
  "/subdistricts/:subDistrictCode/panchayats",
  getPanchayatsBySubDistrict
);

// -----------------------------------------
// Panchayat → Villages
// -----------------------------------------

router.get(
  "/subdistricts/:subDistrictCode/panchayats/:panchayatCode/villages",
  getVillagesByPanchayat
);

// -----------------------------------------
// Pincode → Post Offices
// -----------------------------------------

router.get(
  "/pincodes/:pincode/postoffices",
  getPostOfficesByPincode
);

module.exports = router;