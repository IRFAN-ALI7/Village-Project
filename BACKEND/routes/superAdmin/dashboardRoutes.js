const express = require("express");

const router = express.Router();

const {
  getSuperAdminDashboard,
} = require("../../controllers/superAdmin/dashboardController");

const superAdminAuth = require("../../middlewares/superAdminAuth");

// GET Super Admin Dashboard
router.get("/", superAdminAuth, getSuperAdminDashboard);

module.exports = router;