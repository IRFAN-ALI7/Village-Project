const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const { protect, userOnly } = require("../middlewares/protect");
const { getDashboard } = require("../controllers/dashboardController");

router.get("/", protect, userOnly, wrapAsync(getDashboard));

module.exports = router;