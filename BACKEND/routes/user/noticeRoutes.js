const express = require("express");
const router = express.Router();

const { protect, userOnly } = require("../../middlewares/protect");
const wrapAsync = require("../../utils/wrapAsync");

const {
    getUserNotices
} = require("../../controllers/user/noticeController");


router.get(
    "/notices",
    protect,
    userOnly,
    wrapAsync(getUserNotices)
);


module.exports = router;