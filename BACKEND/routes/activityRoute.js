const express = require("express");
const router = express.Router();

const {
  getUserActivities,
  getAdminActivities,
  markAsRead,
  markAllAsRead,
  deleteActivity,
  deleteAllActivities,
} = require("../controllers/activityController");

const { protect } = require("../middlewares/protect");
const wrapAsync = require("../utils/wrapAsync");

// =======================================
// USER ACTIVITIES / NOTIFICATIONS
// =======================================
router.get("/user", protect, wrapAsync(getUserActivities));

// =======================================
// ADMIN ACTIVITIES / NOTIFICATIONS
// =======================================
router.get("/admin", protect, wrapAsync(getAdminActivities));

// =======================================
// MARK SINGLE NOTIFICATION AS READ
// =======================================
router.patch("/read/:id", protect, wrapAsync(markAsRead));

// =======================================
// MARK ALL NOTIFICATIONS AS READ
// =======================================
router.patch("/read-all", protect, wrapAsync(markAllAsRead));

// =======================================
// DELETE ALL NOTIFICATIONS
// =======================================
router.delete("/delete-all", protect, wrapAsync(deleteAllActivities));

// =======================================
// DELETE SINGLE NOTIFICATION
// =======================================
router.delete("/:id", protect, wrapAsync(deleteActivity));

module.exports = router;