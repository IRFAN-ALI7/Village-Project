const express = require("express");
const router = express.Router();

const {
  createNotice,
  getAllNotices,
  getNoticeById,
  deleteNotice,
} = require("../../controllers/superAdmin/noticeController");

const superAdminAuth = require("../../middlewares/superAdminAuth");

// Create notice
router.post("/", superAdminAuth, createNotice);

// Get all notices
router.get("/", superAdminAuth, getAllNotices);

// Get single notice
router.get("/:id", superAdminAuth, getNoticeById);

// Delete notice
router.delete("/:id", superAdminAuth, deleteNotice);

module.exports = router;