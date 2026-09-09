const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../../middlewares/protect");
const wrapAsync = require("../../utils/wrapAsync");

const {
    getAllCertificates,
    approveCertificate,
    rejectCertificate,
    downloadCertificate
} = require("../../controllers/admin/certificateController");


// GET ALL CERTIFICATES
router.get(
    "/all-certificates",
    protect,
    adminOnly,
    wrapAsync(getAllCertificates)
);


// APPROVE CERTIFICATE
router.put(
    "/approve/:id",
    protect,
    adminOnly,
    wrapAsync(approveCertificate)
);


// REJECT CERTIFICATE
router.put(
    "/reject/:id",
    protect,
    adminOnly,
    wrapAsync(rejectCertificate)
);


// DOWNLOAD CERTIFICATE
router.get(
    "/certificates/download/:id",
    protect,
    adminOnly,
    wrapAsync(downloadCertificate)
);


module.exports = router;