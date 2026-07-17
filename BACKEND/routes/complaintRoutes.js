const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const {protect} = require("../middlewares/protect");
const {createComplaint, getUserComplaints, deleteComplaint} = require("../controllers/complaintsController");
const upload = require("../middlewares/cloudinaryStorage");

router.post(
    "/complaints",
     protect,
     upload.array("photos", 5),
      wrapAsync(createComplaint)
    );

router.get("/my-complaints", protect, wrapAsync(getUserComplaints));
router.delete("/complaints/:complaintId",protect, wrapAsync(deleteComplaint));

module.exports = router;