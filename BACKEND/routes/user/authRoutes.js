const express = require("express");
const router = express.Router();

const {
  protect,
  userOnly,
} = require("../../middlewares/protect");

const wrapAsync = require("../../utils/wrapAsync");

const {
  userUpload,
} = require("../../middlewares/cloudinaryStorage");

const {
  userValidate,
} = require("../../middlewares/Validation");

const {
  registerUser,

  requestRegistrationOtp,
  verifyRegistrationOtp,
  resendRegistrationOtp,

  loginUser,

  getProfile,
  getCurrUser,

  updateUsers,

  requestEmailChange,
  verifyEmailChange,

  deleteUsers,

  changePassword,

  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
} = require("../../controllers/user/authController");


// ============================================================
// USER REGISTRATION
// ============================================================

// Request registration OTP
router.post(
  "/register/request-otp",
  wrapAsync(requestRegistrationOtp)
);

// Verify registration email OTP
router.post(
  "/register/verify-email",
  wrapAsync(verifyRegistrationOtp)
);

// Resend registration OTP
router.post(
  "/register/resend-otp",
  wrapAsync(resendRegistrationOtp)
);

// Create account after email verification
router.post(
  "/register",
  userUpload.single("profileImage"),
  userValidate,
  wrapAsync(registerUser)
);


// ============================================================
// USER LOGIN
// ============================================================

router.post(
  "/login",
  wrapAsync(loginUser)
);


// ============================================================
// USER PROFILE
// ============================================================

// Get profile
router.get(
  "/profile",
  protect,
  userOnly,
  wrapAsync(getProfile)
);

// Get current user
router.get(
  "/me",
  protect,
  userOnly,
  wrapAsync(getCurrUser)
);


// ============================================================
// CHANGE PASSWORD
// ============================================================

router.put(
  "/change-password",
  protect,
  userOnly,
  wrapAsync(changePassword)
);


// ============================================================
// UPDATE PROFILE
// ============================================================

router.put(
  "/:id",
  protect,
  userOnly,
  userUpload.single("profileImage"),
  wrapAsync(updateUsers)
);


// ============================================================
// EMAIL CHANGE
// ============================================================

// Request new email + send OTP
router.post(
  "/request-email-change",
  protect,
  userOnly,
  wrapAsync(requestEmailChange)
);

// Verify OTP + change email
router.post(
  "/verify-email-change",
  protect,
  userOnly,
  wrapAsync(verifyEmailChange)
);


// ============================================================
// DELETE ACCOUNT
// ============================================================

router.delete(
  "/:id",
  protect,
  userOnly,
  wrapAsync(deleteUsers)
);


// ============================================================
// FORGOT PASSWORD
// ============================================================

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