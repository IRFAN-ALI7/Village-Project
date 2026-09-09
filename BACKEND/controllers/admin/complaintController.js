const Complaint = require("../../models/Complaint");
const User = require("../../models/User");
const Admin = require("../../models/Admin");
const Activity = require("../../models/Activity");
const expressError = require("../../utils/expressError");


// GET ALL COMPLAINTS ,ONLY LOGGED-IN ADMIN'S PANCHAYAT
const getAllComplaints = async (req, res) => {
  const admin = await Admin.findById(req.userId).select(
    "panchayat panchayatCode"
  );

  if (!admin) {
    throw new expressError(404, "Admin not found");
  }

  const userFilter = admin.panchayatCode
    ? {
        $or: [
          { panchayatCode: admin.panchayatCode },
          { panchayat: admin.panchayat },
        ],
      }
    : {
        panchayat: admin.panchayat,
      };

  const users = await User.find(userFilter).select("_id");
  const userIds = users.map((user) => user._id);
  const complaints = await Complaint.find({
    userId: { $in: userIds },
  })
    .populate("userId", "name mobile email")
    .sort({ createdAt: -1 });

  res.status(200).json(complaints);
};



//GET RECENT COMPLAINTS, ONLY LOGGED-IN ADMIN'S PANCHAYAT
const getRecentComplaints = async (req, res) => {
  const admin = await Admin.findById(req.userId).select(
    "panchayat panchayatCode"
  );

  if (!admin) {
    throw new expressError(404, "Admin not found");
  }

  const userFilter = admin.panchayatCode
    ? {
        $or: [
          { panchayatCode: admin.panchayatCode },
          { panchayat: admin.panchayat },
        ],
      }
    : {
        panchayat: admin.panchayat,
      };

  const users = await User.find(userFilter).select("_id");
  const userIds = users.map((user) => user._id);
  const complaints = await Complaint.find({
    userId: { $in: userIds },
  })
    .populate("userId", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  const totalComplaints = await Complaint.countDocuments({
    userId: { $in: userIds },
  });

  res.status(200).json({
    complaints,
    totalComplaints,
  });
};



//   UPDATE COMPLAINT STATUS ,ONLY COMPLAINT OF ADMIN'S PANCHAYAT
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, statusReason } = req.body;

  const admin = await Admin.findById(req.userId).select(
    "panchayat panchayatCode"
  );

  if (!admin) {
    throw new expressError(404, "Admin not found");
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new expressError(404, "Complaint not found");
  }

  // Find complaint owner
  const user = await User.findById(complaint.userId).select(
    "panchayat panchayatCode"
  );

  if (!user) {
    throw new expressError(404, "Complaint user not found");
  }

  // Check Panchayat ownership
  const samePanchayat = admin.panchayatCode
    ? (
        user.panchayatCode === admin.panchayatCode ||
        String(user.panchayatCode) === String(admin.panchayatCode) ||
        user.panchayat === admin.panchayat
      )
    : user.panchayat === admin.panchayat;

  if (!samePanchayat) {
    throw new expressError(
      403,
      "You are not authorized to manage this complaint."
    );
  }

  // Update status
  complaint.status = status;

  if (statusReason !== undefined) {
    complaint.statusReason = statusReason;
  }

  // Status timestamps
  if (status === "in-progress") {
    complaint.inProgressAt = new Date();
  }

  if (status === "resolved") {
    complaint.resolvedAt = new Date();
  }

  if (status === "rejected") {
    complaint.rejectedAt = new Date();
  }

  await complaint.save();

  // USER ACTIVITY / NOTIFICATION
  let activityType;
  let title;
  let description;
  let priority = "medium";

  if (status === "in-progress") {
    activityType = "COMPLAINT_IN_PROGRESS";
    title = "Complaint In Progress";
    description =
      "Your complaint is now being processed by the administrator.";
  } else if (status === "resolved") {
    activityType = "COMPLAINT_RESOLVED";
    title = "Complaint Resolved";
    description =
      "Your complaint has been resolved by the administrator.";
    priority = "high";
  } else if (status === "rejected") {
    activityType = "COMPLAINT_REJECTED";
    title = "Complaint Rejected";
    description =
      statusReason ||
      "Your complaint has been rejected by the administrator.";
    priority = "high";
  } else {
    activityType = null;
  }

  if (activityType) {
    await Activity.create({
      user: complaint.userId,
      audience: "user",
      createdBy: "admin",
      type: activityType,
      title,
      description,
      route: "/complaints",
      isNotification: true,
      isRead: false,
      priority,
      status: "completed",
    });
  }

  const updatedComplaint = await Complaint.findById(id).populate(
    "userId",
    "name mobile email"
  );

  res.status(200).json({
    message: "Complaint status updated successfully!",
    complaint: updatedComplaint,
  });
};


module.exports = {
  getAllComplaints,
  getRecentComplaints,
  updateStatus,
};