const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../../middlewares/protect");
const wrapAsync = require("../../utils/wrapAsync");
const { getAllComplaints, getRecentComplaints, updateStatus } = require("../../controllers/admin/complaintController");

router.get("/complaints", protect, adminOnly, wrapAsync(getAllComplaints));
router.get("/recent-complaints", protect, adminOnly, wrapAsync(getRecentComplaints));
router.put("/status-update/:id", protect, adminOnly, wrapAsync(updateStatus));

module.exports = router;