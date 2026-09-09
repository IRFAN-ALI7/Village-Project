const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  requestLoginOtp,
  loginWithOtp,
  getAdminProfile,
  updateAdminProfile,
  requestEmailChange,
  verifyEmailChange,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetAdminPassword,
  changeAdminPassword,
} = require("../../controllers/admin/authController");

const { protect, adminOnly } = require("../../middlewares/protect");

const { adminUpload } = require("../../middlewares/cloudinaryStorage");

// Email/Phone + Password
router.post("/login", loginAdmin);

// Email + OTP - Request OTP
router.post("/request-login-otp", requestLoginOtp);

// Email + OTP - Verify OTP & Login
router.post("/login-with-otp", loginWithOtp);

// Request password reset OTP
router.post("/forgot-password", forgotPassword);

// Verify password reset OTP
router.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);

// Set new password after OTP verification
router.post("/reset-password", resetAdminPassword);

// ADMIN PROFILE
router.get(
  "/profile",
  protect,
  adminOnly,
  getAdminProfile
);

router.put(
  "/profile",
  protect,
  adminOnly,
  adminUpload.single("profilePhoto"),
  updateAdminProfile
);


// Request email change + send OTP
router.post(
  "/request-email-change",
  protect,
  adminOnly,
  requestEmailChange
);

// Verify OTP + update email
router.post(
  "/verify-email-change",
  protect,
  adminOnly,
  verifyEmailChange
);

// CHANGE PASSWORD
router.put(
  "/change-password",
  protect,
  adminOnly,
  changeAdminPassword
);

module.exports = router;