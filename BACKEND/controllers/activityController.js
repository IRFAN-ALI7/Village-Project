const Activity = require("../models/Activity");
const expressError = require("../utils/expressError");

// =======================================
// GET USER ACTIVITIES / NOTIFICATIONS
// =======================================
const getUserActivities = async (req, res) => {
  const activities = await Activity.find({
    $or: [{ user: req.userId }, { audience: "all" }],
    isNotification: true,
  }).sort({ createdAt: -1 });

  const unreadCount = await Activity.countDocuments({
    $or: [{ user: req.userId }, { audience: "all" }],
    isNotification: true,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    activities,
    unreadCount,
  });
};

// =======================================
// GET ADMIN ACTIVITIES / NOTIFICATIONS
// =======================================
const getAdminActivities = async (req, res) => {
  const activities = await Activity.find({
    $or: [{ audience: "admin" }, { audience: "all" }],
    isNotification: true,
  }).sort({ createdAt: -1 });

  const unreadCount = await Activity.countDocuments({
    $or: [{ audience: "admin" }, { audience: "all" }],
    isNotification: true,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    activities,
    unreadCount,
  });
};

// =======================================
// MARK SINGLE NOTIFICATION AS READ
// =======================================
const markAsRead = async (req, res) => {
  const { id } = req.params;

  const activity = await Activity.findById(id);

  if (!activity) {
    throw new expressError(404, "Activity not found");
  }

  activity.isRead = true;
  await activity.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    activity,
  });
};

// =======================================
// MARK ALL NOTIFICATIONS AS READ
// =======================================
const markAllAsRead = async (req, res) => {
  let filter = {};

  if (req.role === "admin") {
    filter = {
      $or: [{ audience: "admin" }, { audience: "all" }],
      isNotification: true,
      isRead: false,
    };
  } else {
    filter = {
      $or: [{ user: req.userId }, { audience: "all" }],
      isNotification: true,
      isRead: false,
    };
  }

  await Activity.updateMany(filter, {
    $set: { isRead: true },
  });

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
};

// =======================================
// DELETE SINGLE NOTIFICATION
// =======================================
const deleteActivity = async (req, res) => {
  const { id } = req.params;

  const activity = await Activity.findById(id);

  if (!activity) {
    throw new expressError(404, "Activity not found");
  }

  await Activity.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
};

// =======================================
// DELETE ALL NOTIFICATIONS
// =======================================
const deleteAllActivities = async (req, res) => {
  let filter = {};

  if (req.role === "admin") {
    filter = {
      $or: [{ audience: "admin" }, { audience: "all" }],
      isNotification: true,
    };
  } else {
    filter = {
      $or: [{ user: req.userId }, { audience: "all" }],
      isNotification: true,
    };
  }

  await Activity.deleteMany(filter);

  res.status(200).json({
    success: true,
    message: "All notifications deleted successfully",
  });
};

module.exports = {
  getUserActivities,
  getAdminActivities,
  markAsRead,
  markAllAsRead,
  deleteActivity,
  deleteAllActivities,
};