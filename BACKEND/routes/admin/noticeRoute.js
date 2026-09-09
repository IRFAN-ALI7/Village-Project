const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../../middlewares/protect");
const wrapAsync = require("../../utils/wrapAsync");

const { noticeValidate } = require("../../middlewares/Validation");

const {
    createNotice,
    getAllNotices,
    updateNotice,
    deleteNotice,
    getOfficialNotices
} = require("../../controllers/admin/noticeController");

router.post(
    "/notices",
    protect,
    adminOnly,
    noticeValidate,
    wrapAsync(createNotice)
);

router.get(
    "/notices",
    protect,
    adminOnly,
    wrapAsync(getAllNotices)
);

router.get(
    "/official-notices",
    protect,
    adminOnly,
    wrapAsync(getOfficialNotices)
);

router.put(
    "/notices/:id",
    protect,
    adminOnly,
    wrapAsync(updateNotice)
);


router.delete(
    "/notices/:id",
    protect,
    adminOnly,
    wrapAsync(deleteNotice)
);

module.exports = router;