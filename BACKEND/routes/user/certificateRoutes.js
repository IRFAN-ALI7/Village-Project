const express = require("express");
const router = express.Router();
const { protect, userOnly } = require("../../middlewares/protect");
const wrapAsync = require("../../utils/wrapAsync");
const { createCertificate, getMyCertificates, downloadCertificate, deleteCertificate } = require("../../controllers/user/certificateController");

router.post("/create", protect, userOnly, wrapAsync(createCertificate));
router.get("/my-certificates", protect, userOnly, wrapAsync(getMyCertificates));
router.get("/download/:id", protect, wrapAsync(downloadCertificate));
router.delete("/delete/:id", protect, userOnly, wrapAsync(deleteCertificate));

module.exports = router;