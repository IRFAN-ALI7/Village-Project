const exxpress = require('express');
const router = exxpress.Router();
const wrapAsync = require("../utils/wrapAsync");
const { protect, adminOnly } = require("../middlewares/protect");
const {addScheme, getAllSchemes, updateScheme,deleteScheme} = require("../controllers/schemeController");
const upload = require("../middlewares/cloudinaryStorage");
const { schemeValidate } = require("../middlewares/Validation");

router.post("/add", protect, adminOnly, upload.single("image"),schemeValidate, wrapAsync(addScheme));
router.get("/all",protect, wrapAsync(getAllSchemes));
router.put("/update/:id", protect, adminOnly, upload.single("image"), wrapAsync(updateScheme));
router.delete("/delete/:id", protect, adminOnly, wrapAsync(deleteScheme));
module.exports = router;