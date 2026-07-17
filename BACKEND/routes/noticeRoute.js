const express = require("express");
const { protect, adminOnly } = require("../middlewares/protect");
const { noticeValidate } = require("../middlewares/Validation");
const wrapAsync = require("../utils/wrapAsync");
const { createNotice, getAllNotices, updateNotice, deleteNotice } = require("../controllers/noticeController");
const router = express.Router();

router.post("/notices", protect, adminOnly, noticeValidate, wrapAsync(createNotice));
router.get("/notices", wrapAsync(getAllNotices));
router.put("/notices/:id", protect, adminOnly, wrapAsync(updateNotice));
router.delete("/notices/:id", protect, adminOnly, wrapAsync(deleteNotice));

module.exports = router;
