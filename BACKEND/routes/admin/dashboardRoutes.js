const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../../middlewares/protect");
const wrapAsync = require("../../utils/wrapAsync");
const { getDashboardStats } = require("../../controllers/admin/dashboardController");


router.get("/dashboard-stats",protect,adminOnly,wrapAsync(getDashboardStats));

module.exports = router;