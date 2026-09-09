const express = require("express");

const router = express.Router();

const {
  createAdmin,
  sendCreateAdminEmailOtp,
  verifyCreateAdminEmailOtp,
  sendEditAdminEmailOtp,
  verifyEditAdminEmailOtp,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin,
} = require("../../controllers/superAdmin/adminController");

const superAdminAuth = require("../../middlewares/superAdminAuth");

const {
  adminUpload,
} = require("../../middlewares/cloudinaryStorage");

// CREATE ADMIN EMAIL VERIFICATION
router.post(
  "/verify-email/send-otp",
  superAdminAuth,
  sendCreateAdminEmailOtp
);

// VERIFY OTP
router.post(
  "/verify-email/verify-otp",
  superAdminAuth,
  verifyCreateAdminEmailOtp
);


// CREATE ADMIN
router.post(
  "/",
  superAdminAuth,
  adminUpload.single("profilePhoto"),
  createAdmin
);


// GET ALL ADMINS
router.get(
  "/",
  superAdminAuth,
  getAllAdmins
);


// EDIT ADMIN EMAIL VERIFICATION
router.post(
  "/:id/verify-email/send-otp",
  superAdminAuth,
  sendEditAdminEmailOtp
);

// VERIFY OTP
router.post(
  "/:id/verify-email/verify-otp",
  superAdminAuth,
  verifyEditAdminEmailOtp
);


// GET ADMIN BY ID
router.get(
  "/:id",
  superAdminAuth,
  getAdminById
);


// UPDATE ADMIN
router.put(
  "/:id",
  superAdminAuth,
  adminUpload.single("profilePhoto"),
  updateAdmin
);


// DELETE ADMIN
router.delete(
  "/:id",
  superAdminAuth,
  deleteAdmin
);


// TOGGLE ADMIN STATUS
router.patch(
  "/:id/status",
  superAdminAuth,
  toggleAdminStatus
);


module.exports = router;