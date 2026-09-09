const expressError = require("../../utils/expressError");
const User = require("../../models/User");
const Certificate = require("../../models/Certificate");
const Activity = require("../../models/Activity");
const PDFDocument = require("pdfkit");


// CREATE CERTIFICATE
const createCertificate = async (req, res) => {

    const user = await User.findById(req.userId);

    if (!user) {
        throw new expressError(404, "User not found");
    }

    let prefix = "";

    if (req.body.type === "Income Certificate") {
        prefix = "INC";
    } else if (req.body.type === "Caste Certificate") {
        prefix = "CST";
    } else if (req.body.type === "Residential Certificate") {
        prefix = "RSD";
    } else if (req.body.type === "Birth Certificate") {
        prefix = "BTH";
    } else if (req.body.type === "Death Certificate") {
        prefix = "DTH";
    } else {
        throw new expressError(400, "Invalid certificate type");
    }


    const randomNumber = Math.floor(10000 + Math.random() * 90000);

    const certificateId = prefix + randomNumber;


    const data = {
        userId: req.userId,

        certificateId,

        type: req.body.type,

        applicantName: req.body.applicantName,

        fatherName: req.body.fatherName,

        dateOfBirth: req.body.dateOfBirth,

        gender: req.body.gender,

        phoneNumber: req.body.phoneNumber,

        address: req.body.address,

        aadhaarNumber: req.body.aadhaarNumber,

        panNumber: req.body.panNumber,

        purpose: req.body.purpose,
    };


    
    // INCOME CERTIFICATE
    if (req.body.type === "Income Certificate") {

        data.annualIncome = req.body.annualIncome;

        data.occupation = req.body.occupation;
    }


    // CASTE CERTIFICATE
    if (req.body.type === "Caste Certificate") {

        data.casteCategory = req.body.casteCategory;
    }


    // RESIDENTIAL CERTIFICATE
    if (req.body.type === "Residential Certificate") {

        data.yearsOfResidence = req.body.yearsOfResidence;
    }



    // BIRTH CERTIFICATE
    if (req.body.type === "Birth Certificate") {

        data.placeOfBirth = req.body.placeOfBirth;

        data.birthLocation = req.body.birthLocation;
    }



    // DEATH CERTIFICATE
    if (req.body.type === "Death Certificate") {

        data.deceasedName = req.body.deceasedName;

        data.dateOfDeath = req.body.dateOfDeath;

        data.causeOfDeath = req.body.causeOfDeath;
    }
    const certificate = new Certificate(data);
    const saved = await certificate.save();


    // USER NOTIFICATION
    await Activity.create({
        user: req.userId,
        audience: "user",
        createdBy: "user",
        type: "CERTIFICATE_APPLIED",
        title: "Certificate Applied",
        description:
            `Your ${saved.type} application has been submitted successfully.`,
        route: "/my-certificates",
        isNotification: true,
        isRead: false,
        priority: "urgent",
        status: "pending",

        // Panchayat information
        panchayat: user.panchayat || "",
        panchayatCode: user.panchayatCode || null,
    });



    // ADMIN NOTIFICATION
    await Activity.create({
        audience: "admin",
        createdBy: "user",
        type: "CERTIFICATE_APPLIED",
        title: "New Certificate Request",
        description:
            `${user.name} applied for ${saved.type}.`,
        route: "/admin/certificates",
        isNotification: true,
        isRead: false,
        priority: "urgent",
        status: "pending",
        // user's Panchayat
        panchayat: user.panchayat || "",
        panchayatCode: user.panchayatCode || null,
    });


    res.status(201).json({
        message: "Certificate applied successfully!",
        data: saved
    });
};


// GET MY CERTIFICATES
const getMyCertificates = async (req, res) => {

    const certificates = await Certificate.find({
        userId: req.userId
    })
        .sort({ createdAt: -1 });


    res.status(200).json({

        data: certificates

    });
};


// DOWNLOAD CERTIFICATE
const downloadCertificate = async (req, res) => {

    const cert = await Certificate.findById(req.params.id);

    if (!cert) {
        throw new expressError(
            404,
            "Certificate not found"
        );
    }


    //  SECURITY: USER CAN DOWNLOAD ONLY HIS OWN CERTIFICATE
    if (
        String(cert.userId) !== String(req.userId)
    ) {

        throw new expressError(
            403,
            "You are not authorized to download this certificate."
        );
    }
    if (cert.status !== "approved") {

        throw new expressError(
            400,
            "Certificate is not approved yet."
        );
    }
    const doc = new PDFDocument();


    // HEADERS
    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${cert.certificateId}.pdf`
    );

    // PIPE
    doc.pipe(res);

    // HEADER
    doc
        .fontSize(18)
        .text(
            cert.type.toUpperCase(),
            {
                align: "center"
            }
        );

    doc.moveDown();


    // COMMON DATA
    doc.fontSize(12);

    doc.text(
        `Certificate ID: ${cert.certificateId}`
    );

    doc.text(
        `Issue Date: ${
            cert.issueDate
                ? new Date(cert.issueDate).toLocaleString("en-IN")
                : "N/A"
        }`
    );

    doc.text(
        `Name: ${cert.applicantName || "N/A"}`
    );

    doc.text(
        `Father Name: ${cert.fatherName || "N/A"}`
    );

    doc.text(
        `DOB: ${cert.dateOfBirth || "N/A"}`
    );

    doc.text(
        `Gender: ${cert.gender || "N/A"}`
    );

    doc.text(
        `Phone: ${cert.phoneNumber || "N/A"}`
    );

    doc.text(
        `Address: ${cert.address || "N/A"}`
    );

    doc.text(
        `Aadhaar: ${cert.aadhaarNumber || "N/A"}`
    );

    doc.text(
        `PAN: ${cert.panNumber || "N/A"}`
    );

    doc.text(
        `Purpose: ${cert.purpose || "N/A"}`
    );


    doc.moveDown();


    // TYPE SPECIFIC DATA
    if (cert.type === "Income Certificate") {

        doc.text(
            `Annual Income: ₹${cert.annualIncome || "N/A"}`
        );

        doc.text(
            `Occupation: ${cert.occupation || "N/A"}`
        );
    }


    if (cert.type === "Caste Certificate") {

        doc.text(
            `Caste Category: ${cert.casteCategory || "N/A"}`
        );
    }


    if (cert.type === "Residential Certificate") {

        doc.text(
            `Years of Residence: ${
                cert.yearsOfResidence || "N/A"
            }`
        );
    }


    if (cert.type === "Birth Certificate") {

        doc.text(
            `Place of Birth: ${
                cert.placeOfBirth || "N/A"
            }`
        );

        doc.text(
            `Birth Location: ${
                cert.birthLocation || "N/A"
            }`
        );
    }


    if (cert.type === "Death Certificate") {

        doc.text(
            `Deceased Name: ${
                cert.deceasedName || "N/A"
            }`
        );

        doc.text(
            `Date of Death: ${
                cert.dateOfDeath || "N/A"
            }`
        );

        doc.text(
            `Cause of Death: ${
                cert.causeOfDeath || "N/A"
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



// DELETE CERTIFICATE
const deleteCertificate = async (req, res) => {

    const cert = await Certificate.findById(
        req.params.id
    );


    if (!cert) {

        throw new expressError(
            404,
            "Certificate not found"
        );
    }

    //  SECURITY: USER CAN DELETE ONLY HIS OWN CERTIFICATE
    if (
        String(cert.userId) !== String(req.userId)
    ) {

        throw new expressError(
            403,
            "You are not authorized to delete this certificate."
        );
    }

    // APPROVED CERTIFICATE SHOULD NOT BE DELETED
    if (cert.status === "approved") {

        throw new expressError(
            400,
            "Approved certificate cannot be deleted."
        );
    }


    await cert.deleteOne();
    res.status(200).json({
        message: "Certificate deleted successfully"
    });
};


module.exports = {
    createCertificate,
    getMyCertificates,
    downloadCertificate,
    deleteCertificate
};