const express = require("express");
const router = express.Router();

const wrapAsync = require("../../utils/wrapAsync");

const {
  loginSuperAdmin,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
} = require("../../controllers/superadmin/authController");

// SUPER ADMIN LOGIN

router.post(
  "/login",
  wrapAsync(loginSuperAdmin)
);

// FORGOT PASSWORD

// Request password reset OTP
router.post(
  "/forgot-password",
  wrapAsync(forgotPassword)
);

// Verify password reset OTP
router.post(
  "/forgot-password/verify-otp",
  wrapAsync(verifyForgotPasswordOtp)
);

// Reset password
router.post(
  "/forgot-password/reset",
  wrapAsync(resetPassword)
);

module.exports = router;