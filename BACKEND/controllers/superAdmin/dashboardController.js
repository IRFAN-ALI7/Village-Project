const User = require("../../models/User");
const Admin = require("../../models/Admin");
const Complaint = require("../../models/Complaint");
const Panchayat = require("../../models/locations/Panchayat");

// SUPER ADMIN DASHBOARD
const getSuperAdminDashboard = async (req, res) => {
  try {
    
    // BASIC COUNTS
    const [
      totalUsers,
      totalAdmins,
      activeAdmins,
      inactiveAdmins,
      totalPanchayats,
    ] = await Promise.all([
      User.countDocuments(),

      Admin.countDocuments(),

      Admin.countDocuments({
        status: "active",
      }),

      Admin.countDocuments({
        status: "inactive",
      }),

      Panchayat.countDocuments(),
    ]);

    // PANCHAYATS HAVING ADMIN
    const assignedPanchayatResult = await Admin.aggregate([
      {
        $match: {
          panchayat: {
            $exists: true,
            $ne: "",
          },
        },
      },
      {
        $group: {
          _id: "$panchayat",
        },
      },
      {
        $count: "count",
      },
    ]);

    const panchayatsWithAdmin =
      assignedPanchayatResult.length > 0
        ? assignedPanchayatResult[0].count
        : 0;

    const panchayatsWithoutAdmin = Math.max(
      totalPanchayats - panchayatsWithAdmin,
      0
    );

    // RECENT ADMIN ACTIVITY
    const recentAdmins = await Admin.find()
      .select(
        "name email district subDistrict panchayat status createdAt updatedAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(6);

    const recentActivity = recentAdmins.map((admin) => ({
      id: admin._id,
      action:
        admin.status === "active"
          ? "Admin Created"
          : "Admin Created / Inactive",

      detail: `${admin.name} — ${admin.district}, ${admin.subDistrict}`,

      panchayat: admin.panchayat,

      status: admin.status,

      time: admin.createdAt,

      type:
        admin.status === "active"
          ? "create"
          : "deactivate",
    }));

    // RESPONSE
    return res.status(200).json({
      success: true,

      dashboard: {
        totalUsers,
        totalAdmins,
        activeAdmins,
        inactiveAdmins,
        totalPanchayats,
        panchayatsWithAdmin,
        panchayatsWithoutAdmin,
        recentActivity,
      },
    });
  } catch (error) {
    console.error(
      "Super Admin Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getSuperAdminDashboard,
};