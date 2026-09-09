const Admin = require("../../models/Admin");
const User = require("../../models/User");
const Complaint = require("../../models/Complaint");
const PanchayatVillage = require("../../models/locations/PanchayatVillage");

const getDashboardStats = async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId).select(
      "name panchayat panchayatCode"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // ADMIN KI ASSIGNED PANCHAYAT KA USER FILTER
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

    // ADMIN KI PANCHAYAT KE USERS
    const users = await User.find(userFilter).select("_id");
    const userIds = users.map((user) => user._id);
    const totalUsers = userIds.length;

    // TOTAL VILLAGES
    let totalVillages = 0;

    if (admin.panchayatCode) {
      totalVillages = await PanchayatVillage.countDocuments({
        panchayatCode: admin.panchayatCode,
      });
    }

    // COMPLAINT FILTER
    const complaintFilter = {
      userId: {
        $in: userIds,
      },
    };

    
    // COMPLAINT COUNTS
    const totalComplaints = await Complaint.countDocuments(
      complaintFilter
    );

    const pending = await Complaint.countDocuments({
      ...complaintFilter,
      status: "pending",
    });

    const inProgress = await Complaint.countDocuments({
      ...complaintFilter,
      status: "in-progress",
    });

    const resolved = await Complaint.countDocuments({
      ...complaintFilter,
      status: "resolved",
    });

    const rejected = await Complaint.countDocuments({
      ...complaintFilter,
      status: "rejected",
    });

   
    // RESOLUTION RATE
    const resolutionRate =
      totalComplaints > 0
        ? Math.round((resolved / totalComplaints) * 100)
        : 0;

    // RESPONSE
    return res.status(200).json({
      success: true,
      adminName: admin.name,
      panchayat: admin.panchayat,
      panchayatCode: admin.panchayatCode || null,
      totalUsers,
      totalVillages,
      totalComplaints,
      complaintStats: {
        pending,
        inProgress,
        resolved,
        rejected,
      },

      resolutionRate,
    });
  } catch (error) {
    console.error("Admin Dashboard Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getDashboardStats,
};