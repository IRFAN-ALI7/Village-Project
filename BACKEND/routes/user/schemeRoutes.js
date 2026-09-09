const express = require("express");
const router = express.Router();

const { protect, userOnly } = require("../../middlewares/protect");
const wrapAsync = require("../../utils/wrapAsync");

const {
    getUserSchemes
} = require("../../controllers/user/schemeController");


// =====================================================
// GET USER'S PANCHAYAT SCHEMES
// =====================================================

router.get(
    "/schemes",
    protect,
    userOnly,
    wrapAsync(getUserSchemes)
);


module.exports = router;