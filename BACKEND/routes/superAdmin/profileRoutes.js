const express = require("express");
const router = express.Router();

const {
  getSuperAdminProfile,
  updateSuperAdminProfile,
  requestSuperAdminEmailChange,
  verifySuperAdminEmailChange,
  changeSuperAdminPassword,
} = require("../../controllers/superAdmin/profileController");

const superAdminAuth = require("../../middlewares/superAdminAuth");
const {
  superAdminUpload,
} = require("../../middlewares/cloudinaryStorage");

// Get Super Admin Profile
router.get(
  "/",
  superAdminAuth,
  getSuperAdminProfile
);

// Update Super Admin Profile
router.put(
  "/",
  superAdminAuth,
  superAdminUpload.single("profileImage"),
  updateSuperAdminProfile
);

// Request Email Change OTP
router.post(
  "/request-email-change",
  superAdminAuth,
  requestSuperAdminEmailChange
);

// Verify Email Change OTP
router.post(
  "/verify-email-change",
  superAdminAuth,
  verifySuperAdminEmailChange
);

// Change Super Admin Password
router.put(
  "/change-password",
  superAdminAuth,
  changeSuperAdminPassword
);

module.exports = router;