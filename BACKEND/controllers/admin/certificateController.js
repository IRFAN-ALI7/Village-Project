const expressError = require("../../utils/expressError");
const Certificate = require("../../models/Certificate");
const User = require("../../models/User");
const Admin = require("../../models/Admin");
const Activity = require("../../models/Activity");
const PDFDocument = require("pdfkit");


// GET ALL CERTIFICATES OF ADMIN'S PANCHAYAT
const getAllCertificates = async (req, res) => {

    const admin = await Admin.findById(req.userId)
        .select("panchayat panchayatCode");

    if (!admin) {
        throw new expressError(404, "Admin not found");
    }

    const userFilter = admin.panchayatCode
        ? {
            $or: [
                { panchayatCode: admin.panchayatCode },
                { panchayat: admin.panchayat }
            ]
        }
        : {
            panchayat: admin.panchayat
        };

    const users = await User.find(userFilter)
        .select("_id");

    const userIds = users.map((user) => user._id);

    const certificates = await Certificate.find({
        userId: { $in: userIds }
    })
        .populate(
            "userId",
            "name email mobile phoneNumber"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: certificates
    });
};


// APPROVE CERTIFICATE
const approveCertificate = async (req, res) => {

    const { id } = req.params;

    const admin = await Admin.findById(req.userId)
        .select("panchayat panchayatCode");

    if (!admin) {
        throw new expressError(404, "Admin not found");
    }

    const certificate = await Certificate.findById(id);

    if (!certificate) {
        throw new expressError(404, "Certificate not found");
    }

    const user = await User.findById(certificate.userId)
        .select("name panchayat panchayatCode");

    if (!user) {
        throw new expressError(
            404,
            "Certificate user not found"
        );
    }

    const isAuthorized = admin.panchayatCode
        ? (
            user.panchayatCode === admin.panchayatCode ||
            user.panchayat === admin.panchayat
        )
        : user.panchayat === admin.panchayat;

    if (!isAuthorized) {
        throw new expressError(
            403,
            "You are not authorized to manage this certificate."
        );
    }

    if (certificate.status !== "pending") {
        throw new expressError(
            400,
            "Only pending certificates can be approved."
        );
    }

    certificate.status = "approved";
    certificate.issueDate = new Date();

    const updatedCertificate = await certificate.save();


    // USER NOTIFICATION
    await Activity.create({
        user: certificate.userId,
        audience: "user",
        createdBy: "admin",
        type: "CERTIFICATE_APPROVED",
        title: "Certificate Approved",
        description:
            `Your ${certificate.type} has been approved.`,
        route: "/certificates",
        isNotification: true,
        isRead: false,
        priority: "high",
        status: "completed",
        panchayat: user.panchayat || "",
        panchayatCode: user.panchayatCode || null
    });
    res.status(200).json({
        success: true,
        message: "Certificate approved successfully",
        data: updatedCertificate
    });
};

// REJECT CERTIFICATE
const rejectCertificate = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
        throw new expressError(
            400,
            "Reason is required"
        );
    }
    const admin = await Admin.findById(req.userId)
        .select("panchayat panchayatCode");

    if (!admin) {
        throw new expressError(
            404,
            "Admin not found"
        );
    }

    const certificate = await Certificate.findById(id);

    if (!certificate) {
        throw new expressError(
            404,
            "Certificate not found"
        );
    }

    const user = await User.findById(certificate.userId)
        .select("name panchayat panchayatCode");

    if (!user) {
        throw new expressError(
            404,
            "Certificate user not found"
        );
    }

    const isAuthorized = admin.panchayatCode
        ? (
            user.panchayatCode === admin.panchayatCode ||
            user.panchayat === admin.panchayat
        )
        : user.panchayat === admin.panchayat;

    if (!isAuthorized) {
        throw new expressError(
            403,
            "You are not authorized to manage this certificate."
        );
    }

    if (certificate.status !== "pending") {
        throw new expressError(
            400,
            "Only pending certificates can be rejected."
        );
    }

    certificate.status = "rejected";
    certificate.rejectionReason = reason.trim();
    const updatedCertificate = await certificate.save();

    // USER NOTIFICATION
    await Activity.create({
        user: certificate.userId,
        audience: "user",
        createdBy: "admin",
        type: "CERTIFICATE_REJECTED",
        title: "Certificate Rejected",
        description:
            `Your ${certificate.type} has been rejected. Reason: ${reason.trim()}`,

        route: "/certificates",
        isNotification: true,
        isRead: false,
        priority: "high",
        status: "rejected",
        panchayat: user.panchayat || "",
        panchayatCode: user.panchayatCode || null
    });


    res.status(200).json({
        success: true,
        message: "Certificate rejected successfully",
        data: updatedCertificate
    });
};



// ADMIN DOWNLOAD CERTIFICATE
const downloadCertificate = async (req, res) => {
    const { id } = req.params;

    // GET ADMIN
    const admin = await Admin.findById(req.userId)
        .select("panchayat panchayatCode");

    if (!admin) {
        throw new expressError(
            404,
            "Admin not found"
        );
    }

    // GET CERTIFICATE
    const certificate = await Certificate.findById(id);

    if (!certificate) {
        throw new expressError(
            404,
            "Certificate not found"
        );
    }

    // ONLY APPROVED CERTIFICATE
    if (certificate.status !== "approved") {
        throw new expressError(
            400,
            "Certificate is not approved yet."
        );
    }

    // GET CERTIFICATE USER
    const user = await User.findById(certificate.userId)
        .select(
            "name email mobile phoneNumber panchayat panchayatCode"
        );

    if (!user) {
        throw new expressError(
            404,
            "Certificate user not found"
        );
    }


    // PANCHAYAT AUTHORIZATION
    const isAuthorized = admin.panchayatCode
        ? (
            user.panchayatCode === admin.panchayatCode ||
            user.panchayat === admin.panchayat
        )
        : user.panchayat === admin.panchayat;


    if (!isAuthorized) {

        throw new expressError(
            403,
            "You are not authorized to download this certificate."
        );
    }

    // CREATE PDF
    const doc = new PDFDocument();

    // RESPONSE HEADERS
    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${certificate.certificateId}.pdf`
    );

    // PIPE PDF TO RESPONSE
    doc.pipe(res);

    // HEADER
    doc
        .fontSize(18)
        .text(
            certificate.type.toUpperCase(),
            {
                align: "center"
            }
        );

    doc.moveDown();

    // COMMON DATA
    doc.fontSize(12);
    doc.text(
        `Certificate ID: ${certificate.certificateId}`
    );

    doc.text(
        `Issue Date: ${
            certificate.issueDate
                ? new Date(
                    certificate.issueDate
                ).toLocaleString("en-IN")
                : "N/A"
        }`
    );

    doc.text(
        `Name: ${certificate.applicantName || "N/A"}`
    );
    doc.text(
        `Father Name: ${certificate.fatherName || "N/A"}`
    );
    doc.text(
        `DOB: ${certificate.dateOfBirth || "N/A"}`
    );
    doc.text(
        `Gender: ${certificate.gender || "N/A"}`
    );
    doc.text(
        `Phone: ${certificate.phoneNumber || "N/A"}`
    );
    doc.text(
        `Address: ${certificate.address || "N/A"}`
    );
    doc.text(
        `Aadhaar: ${certificate.aadhaarNumber || "N/A"}`
    );
    doc.text(
        `PAN: ${certificate.panNumber || "N/A"}`
    );
    doc.text(
        `Purpose: ${certificate.purpose || "N/A"}`
    );

    doc.moveDown();

    // TYPE SPECIFIC DATA
    if (
        certificate.type === "Income Certificate"
    ) {

        doc.text(
            `Annual Income: ₹${
                certificate.annualIncome || "N/A"
            }`
        );

        doc.text(
            `Occupation: ${
                certificate.occupation || "N/A"
            }`
        );
    }

    if (
        certificate.type === "Caste Certificate"
    ) {

        doc.text(
            `Caste Category: ${
                certificate.casteCategory || "N/A"
            }`
        );
    }

    if (
        certificate.type === "Residential Certificate"
    ) {

        doc.text(
            `Years of Residence: ${
                certificate.yearsOfResidence || "N/A"
            }`
        );
    }

    if (
        certificate.type === "Birth Certificate"
    ) {

        doc.text(
            `Place of Birth: ${
                certificate.placeOfBirth || "N/A"
            }`
        );

        doc.text(
            `Birth Location: ${
                certificate.birthLocation || "N/A"
            }`
        );
    }

    if (
        certificate.type === "Death Certificate"
    ) {

        doc.text(
            `Deceased Name: ${
                certificate.deceasedName || "N/A"
            }`
        );

        doc.text(
            `Date of Death: ${
                certificate.dateOfDeath || "N/A"
            }`
        );

        doc.text(
            `Cause of Death: ${
                certificate.causeOfDeath || "N/A"
            }`
        );
    }

    // FOOTER
    doc.moveDown();

    doc.text(
        "Authorized Signature",
        {
            align: "right"
        }
    );

    // END PDF
    doc.end();
};

// EXPORTS
module.exports = {
    getAllCertificates,
    approveCertificate,
    rejectCertificate,
    downloadCertificate
};