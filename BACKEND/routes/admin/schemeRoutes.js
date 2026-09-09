const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../../middlewares/protect");
const { schemeUpload } = require("../../middlewares/cloudinaryStorage");
const { schemeValidate } = require("../../middlewares/Validation");
const wrapAsync = require("../../utils/wrapAsync");

const {
    addScheme,
    getAllSchemes,
    updateScheme,
    deleteScheme
} = require("../../controllers/admin/schemeController");


// Create Scheme
router.post(
    "/create",
    protect,
    adminOnly,
    schemeUpload.single("image"),
    schemeValidate,
    wrapAsync(addScheme)
);


// Get All Schemes
router.get(
    "/all",
    protect,
    adminOnly,
    wrapAsync(getAllSchemes)
);


// Update Scheme
router.put(
    "/:id",
    protect,
    adminOnly,
    schemeUpload.single("image"),
    wrapAsync(updateScheme)
);


// Delete Scheme
router.delete(
    "/:id",
    protect,
    adminOnly,
    wrapAsync(deleteScheme)
);


module.exports = router;