const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/protect");
const wrapAsync = require("../../utils/wrapAsync");
const { complaintUpload } = require("../../middlewares/cloudinaryStorage");
const { createComplaint, getUserComplaints, deleteComplaint } = require("../../controllers/user/complaintController");

router.post(
    "/complaints",
     protect,
     complaintUpload.array("photos", 5),
      wrapAsync(createComplaint)
    );  
router.get("/my-complaints", protect, wrapAsync(getUserComplaints));
router.delete("/complaints/:complaintId",protect, wrapAsync(deleteComplaint));

module.exports = router;