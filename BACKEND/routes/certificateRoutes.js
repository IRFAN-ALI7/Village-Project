const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const {protect, adminOnly} = require("../middlewares/protect");
const {
     createCertificate,
     getMyCertificates,
     getAllCertificates,
      approveCertificate,
      rejectCertificate, 
      downloadCertificate,
      deleteCertificate} = require("../controllers/certificateController");


router.post("/certificates", protect,  wrapAsync(createCertificate));
router.get("/certificates/my", protect, wrapAsync(getMyCertificates));
router.get("/admin/certificates", protect, adminOnly, wrapAsync(getAllCertificates));
router.put("/certificates/approve/:id", protect, adminOnly, wrapAsync(approveCertificate));
router.put("/certificates/reject/:id", protect, adminOnly, wrapAsync(rejectCertificate));
router.get("/certificates/download/:id", protect, wrapAsync(downloadCertificate));
router.delete("/certificates/:id", protect, wrapAsync(deleteCertificate));

module.exports = router;