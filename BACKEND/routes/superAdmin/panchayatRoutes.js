const express = require("express");

const router = express.Router();

const {
  getAllPanchayats,
  getPanchayatByCode,
} = require("../../controllers/superAdmin/panchayatController");

const superAdminAuth = require("../../middlewares/superAdminAuth");

// GET ALL PANCHAYATS
router.get(
  "/",
  superAdminAuth,
  getAllPanchayats
);

// GET PANCHAYAT DETAILS
router.get(
  "/:panchayatCode",
  superAdminAuth,
  getPanchayatByCode
);

module.exports = router;