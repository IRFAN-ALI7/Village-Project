const upload = require("../../middlewares/cloudinaryStorage");
const { protect, userOnly } = require("../../middlewares/protect");
const wrapAsync = require("../../utils/wrapAsync");
const { getDashboard } = require("../../controllers/user/dashboardController");
const express = require("express");
const router = express.Router();

router.get("/", protect, userOnly, wrapAsync(getDashboard));
module.exports = router;