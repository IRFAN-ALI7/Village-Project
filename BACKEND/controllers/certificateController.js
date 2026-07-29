const Certificate = require("../models/Certificate");
const expressError = require("../utils/expressError");
const PDFDocument = require("pdfkit");
const Activity = require("../models/Activity");
const User = require("../models/User");

const createCertificate = async(req, res)=> {
    let prefix = "";
    if(req.body.type === "Income Certificate") prefix = "INC";
    else if (req.body.type === "Caste Certificate") prefix = "CST";
    else if (req.body.type === "Residential Certificate") prefix = "RSD";
    else if (req.body.type === "Birth Certificate") prefix = "BTH";
    else if (req.body.type === "Death Certificate") prefix = "DTH";

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

    //Income
    if(req.body.type === "Income Certificate"){
        data.annualIncome = req.body.annualIncome;
        data.occupation = req.body.occupation;
    }

    // Caste
    if(req.body.type === "Caste Certificate"){
        data.casteCategory = req.body.casteCategory;
    }

    //Residential
    if(req.body.type === "Residential Certificate"){
        data.yearsOfResidence = req.body.yearsOfResidence;
    }

    //Birth
    if(req.body.type === "Birth Certificate"){
        data.placeOfBirth = req.body.placeOfBirth;
        data.birthLocation = req.body.birthLocation;
    }

    //Death
    if(req.body.type === "Death Certificate"){
        data.deceasedName = req.body.deceasedName;
        data.dateOfDeath = req.body.dateOfDeath;
        data.causeOfDeath = req.body.causeOfDeath;
    }

    const certificate = new Certificate(data);
    
    const saved = await certificate.save();

    const user = await User.findById(req.userId);

// User Activity
await Activity.create({
    user: req.userId,
    audience: "user",
    createdBy: "user",
    type: "CERTIFICATE_APPLIED",
    title: "Certificate Applied",
    description: `Your ${saved.type} application has been submitted successfully.`,
    route: "/my-certificates",
    isNotification: true,
    isRead: false,
    priority: "urgent",
    status: "pending",
});

// Admin Notification
await Activity.create({
    audience: "admin",
    createdBy: "user",
    type: "CERTIFICATE_APPLIED",
    title: "New Certificate Request",
    description: `${user.name} applied for ${saved.type}.`,
    route: "/admin/certificates",
    isNotification: true,
    isRead: false,
    priority: "urgent",
    status: "pending",
});
    res.status(201).json({
        message: "Certificate applied successfully!",
        data : saved
    });
}

const getMyCertificates = async(req,res)=> {
const certificates = await Certificate.find({userId: req.userId})
.sort({createdAt: -1});

res.status(200).json({
    data: certificates
});
}

const getAllCertificates = async(req,res)=> {
    const certificates = await Certificate.find()
    .populate("userId", "name email mobile")
    .sort({createdAt: -1});

    res.status(200).json({
        data: certificates,
    });
}

const approveCertificate = async(req,res)=> {
    const {id} = req.params;
    console.log(id);
    
    const certificate = await Certificate.findById(id);

    if(!certificate) {
        throw new expressError(404, "Certificate not found");
    }
    certificate.status = "approved";
    certificate.issueDate = new Date();

     const updatedCertificate = await certificate.save();
     await Activity.create({
    user: certificate.userId,
    audience: "user",
    createdBy: "admin",
    type: "CERTIFICATE_APPROVED",
    title: "Certificate Approved",
    description: `Your ${certificate.type} has been approved.`,
    route: "/certificates",
    isNotification: true,
    isRead: false,
    priority: "high",
    status: "completed",
});
    res.status(200).json({
        message: "Certificate approved successfully",
        data: updatedCertificate
    });

}

const rejectCertificate = async(req,res)=> {
    console.log("Sending", req.body);
    const {id} = req.params;
    const {reason} = req.body;
    
    if(!reason) {
        throw new expressError(404, "Reason is required");
    }
    const cert = await Certificate.findByIdAndUpdate(
        id,
        {
            status: "rejected",
            rejectionReason: reason
        },
        {new: true}
    );

    if(!cert){
        throw new expressError(404, "Certificate not found");
    }
    await Activity.create({
    user: cert.userId,
    audience: "user",
    createdBy: "admin",
    type: "CERTIFICATE_REJECTED",
    title: "Certificate Rejected",
    description: `Your ${cert.type} has been rejected.`,
    route: "/certificates",
    isNotification: true,
    isRead: false,
    priority: "high",
    status: "rejected",
});
    res.status(200).json({
        message: "Certificate Rejected",
        data: cert
    });
}

const downloadCertificate = async (req, res) => {
  const cert = await Certificate.findById(req.params.id);

  if (!cert) {
    return res.status(404).json({ message: "Certificate not found" });
  }

  if(cert.status !== "approved"){
    throw new expressError(400, "Not approved yet");
  }

  const doc = new PDFDocument();

  //headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${cert.certificateId}.pdf`
  );

  // pipe
  doc.pipe(res);

  // HEADER
  doc.fontSize(18).text(cert.type.toUpperCase(), { align: "center" });
  doc.moveDown();

  // COMMON DATA 
  doc.fontSize(12);
  doc.text(`Certificate ID: ${cert.certificateId}`);
  doc.text(`Issue Date: ${new Date(cert.issueDate).toLocaleString('en-IN')}`);
  doc.text(`Name: ${cert.applicantName}`);
  doc.text(`Father Name: ${cert.fatherName}`);
  doc.text(`DOB: ${cert.dateOfBirth}`);
  doc.text(`Gender: ${cert.gender}`);
  doc.text(`Phone: ${cert.phoneNumber}`);
  doc.text(`Address: ${cert.address}`);
  doc.text(`Aadhaar: ${cert.aadhaarNumber}`);
  doc.text(`PAN: ${cert.panNumber || "N/A"}`);
  doc.text(`Purpose: ${cert.purpose}`);

  doc.moveDown();

  // TYPE SPECIFIC 

  if (cert.type === "Income Certificate") {
    doc.text(`Annual Income: ₹${cert.annualIncome}`);
    doc.text(`Occupation: ${cert.occupation}`);
  }

  if (cert.type === "Caste Certificate") {
    doc.text(`Caste Category: ${cert.casteCategory}`);
  }

  if (cert.type === "Residential Certificate") {
    doc.text(`Years of Residence: ${cert.yearsOfResidence}`);
  }

  if (cert.type === "Birth Certificate") {
    doc.text(`Place of Birth: ${cert.placeOfBirth}`);
    doc.text(`Birth Location: ${cert.birthLocation}`);
  }

  if (cert.type === "Death Certificate") {
    doc.text(`Deceased Name: ${cert.deceasedName}`);
    doc.text(`Date of Death: ${cert.dateOfDeath}`);
    doc.text(`Cause of Death: ${cert.causeOfDeath}`);
  }

  //FOOTER 
  doc.moveDown();
  doc.text("Authorized Signature", { align: "right" });

  // end
  doc.end();
};

const deleteCertificate = async(req,res)=> {
    const cert = await Certificate.findById(req.params.id);

    if(!cert) {
        throw new expressError(404, "Certificate not found");
    }
    await cert.deleteOne();
    res.status(200).json({
        message: "Certificate deleted successfully"
    });
}

module.exports = { downloadCertificate };

module.exports = {
    createCertificate,
    getMyCertificates,
    getAllCertificates,
    approveCertificate,
    rejectCertificate,
    downloadCertificate,
    deleteCertificate,
}