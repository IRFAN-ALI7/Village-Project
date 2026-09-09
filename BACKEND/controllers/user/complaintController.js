const Complaint = require("../../models/Complaint");
const User = require("../../models/User");
const expressError = require("../../utils/expressError");
const Activity = require("../../models/Activity");
const cloudinary = require("../../config/cloudinary");

const createComplaint = async (req, res) => {
    const {
        complaintType,
        otherComplaint,
        priority,
        description,
        wardNo,
        landmark
    } = req.body;

    if (!complaintType) {
        throw new expressError(400, "Complaint type is required");
    }

    if (!description) {
        throw new expressError(400, "Complaint description is required");
    }

    const type = complaintType.toLowerCase();

    const categoryMap = {
        "street-light": "Infrastructure",
        "electricity": "Infrastructure",
        "road-damage": "Infrastructure",

        "water-supply": "Basic Amenities",
        "drainage": "Basic Amenities",

        "garbage": "Sanitation",
        "public-toilet": "Sanitation",

        "government-service": "Government",
        "ration-shop": "Government",
        "pension": "Government",
        "birth-death-cert": "Government",
        "land-records": "Government",

        "health-center": "Health",
        "school-education": "Education",

        "tree-cutting": "Environment",
        "noise-pollution": "Environment",
        "construction": "Environment",
        "animal-issue": "Environment",
        "illegal construction": "Environment",
        "public-safety": "Safety",

        "agriculture": "Agriculture"
    };

    const category = categoryMap[type] || "Other";

    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const complaintId = "CMP" + randomNumber;

    const photoUrls = req.files
        ? req.files.map((file) => file.path)
        : [];

    const photoPublicIds = req.files
        ? req.files.map((file) => file.filename)
        : [];

    const validPriority = ["low", "medium", "high", "urgent"].includes(priority)
        ? priority
        : "medium";

    const complaint = new Complaint({
        complaintId,
        complaintType,
        category,
        otherComplaint,
        priority: validPriority,
        description,
        wardNo,
        landmark,
        photos: photoUrls,
        photoPublicIds,
        userId: req.userId
    });

    await complaint.save();

    const user = await User.findById(req.userId);

    if (!user) {
        throw new expressError(404, "User not found");
    }

  
    // USER NOTIFICATION
    await Activity.create({
        user: req.userId,
        audience: "user",
        createdBy: "user",
        type: "COMPLAINT_SUBMITTED",
        title: "Complaint Submitted",
        description: `Your complaint (${complaintId}) has been submitted successfully.`,
        route: "/my-complaints",
        isNotification: true,
        isRead: false,
        priority: validPriority,
        status: "pending",

        panchayat: user.panchayat || "",
        panchayatCode: user.panchayatCode || null
    });

    // ADMIN NOTIFICATION
    await Activity.create({
        audience: "admin",
        createdBy: "user",
        type: "COMPLAINT_SUBMITTED",
        title: "New Complaint Received",
        description: `${user.name} submitted a complaint.`,
        route: "/admin/complaints",
        isNotification: true,
        isRead: false,
        priority: validPriority,
        status: "pending",

        panchayat: user.panchayat || "",
        panchayatCode: user.panchayatCode || null
    });

    res.status(201).json({
        success: true,
        message: "Complaint submitted successfully",
        complaintId
    });
};


const getUserComplaints = async (req, res) => {
    const complaints = await Complaint.find({
        userId: req.userId
    }).sort({ createdAt: -1 });

    res.status(200).json(complaints);
};


const deleteComplaint = async (req, res) => {
    const complaintId = req.params.complaintId;

    const deleted = await Complaint.findOneAndDelete({
        complaintId,
        userId: req.userId
    });

    if (!deleted) {
        throw new expressError(404, "Complaint not found");
    }

     // Delete complaint photos from Cloudinary
  if (deleted.photoPublicIds && deleted.photoPublicIds.length > 0) {
    for (const publicId of deleted.photoPublicIds) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

    res.status(200).json({
        success: true,
        message: "Deleted successfully"
    });
};


module.exports = {
    createComplaint,
    getUserComplaints,
    deleteComplaint
};