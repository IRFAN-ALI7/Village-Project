const express = require("express");
const router = express.Router();

const {
  protect,
  adminOnly,
} = require("../../middlewares/protect");

const wrapAsync = require("../../utils/wrapAsync");

const {
  getAllUsers,
  updateUserByAdmin,
  requestEmailChangeByAdmin,
  verifyEmailChangeByAdmin,
  deleteUser,
} = require("../../controllers/admin/userController");

// GET ALL USERS
router.get(
  "/users",
  protect,
  adminOnly,
  wrapAsync(getAllUsers)
);

// REQUEST EMAIL CHANGE OTP
router.post(
  "/users/:id/request-email-change",
  protect,
  adminOnly,
  wrapAsync(requestEmailChangeByAdmin)
);

// VERIFY EMAIL CHANGE OTP
router.post(
  "/users/:id/verify-email-change",
  protect,
  adminOnly,
  wrapAsync(verifyEmailChangeByAdmin)
);

// UPDATE USER
router.put(
  "/users/:id",
  protect,
  adminOnly,
  wrapAsync(updateUserByAdmin)
);

// DELETE USER
router.delete(
  "/users/:id",
  protect,
  adminOnly,
  wrapAsync(deleteUser)
);

module.exports = router;