const SuperAdminNotice = require("../../models/SuperAdminNotice");
const Admin = require("../../models/Admin");

// CREATE NOTICE
const createNotice = async (req, res) => {
  try {
    const {
      title,
      category,
      date,
      time,
      location,
      validUpto,
      description,
      fullDetails,
      audience,
      selectedAdmin,
      isPinned,
    } = req.body;

    // Basic validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notice title is required",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Notice category is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Notice date is required",
      });
    }

    if (!validUpto) {
      return res.status(400).json({
        success: false,
        message: "Valid upto date is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notice description is required",
      });
    }

    if (!audience || !["all", "specific"].includes(audience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid audience",
      });
    }
    // Date validation

    const noticeDate = new Date(date);
    const expiryDate = new Date(validUpto);

    if (Number.isNaN(noticeDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice date",
      });
    }

    if (Number.isNaN(expiryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid valid upto date",
      });
    }

    if (expiryDate < noticeDate) {
      return res.status(400).json({
        success: false,
        message: "Valid upto date cannot be before notice date",
      });
    }
    // Specific admin validation
    let admin = null;

    if (audience === "specific") {
      if (!selectedAdmin) {
        return res.status(400).json({
          success: false,
          message: "Please select an admin",
        });
      }

      admin = await Admin.findById(selectedAdmin);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Selected admin not found",
        });
      }

      if (admin.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Selected admin is inactive",
        });
      }
    }
    // Super Admin authentication
    const superAdminId =
      req.superAdmin?._id ||
      req.superAdmin?.id ||
      req.user?._id ||
      req.user?.id;

    if (!superAdminId) {
      return res.status(401).json({
        success: false,
        message: "Super Admin authentication required",
      });
    }
  
    // Create notice
    const notice = await SuperAdminNotice.create({
      title: title.trim(),
      category,
      date: noticeDate,
      time: time ? time.trim() : "",
      location: location ? location.trim() : "",
      validUpto: expiryDate,
      description: description.trim(),
      fullDetails: fullDetails ? fullDetails.trim() : "",
      audience,
      selectedAdmin: audience === "specific" ? admin._id : null,
      isPinned: Boolean(isPinned),
      createdBy: superAdminId,
    });
    // Populate admin information

    await notice.populate({
      path: "selectedAdmin",
      select:
        "name email phone profilePhoto state district subDistrict panchayat status",
    });

    return res.status(201).json({
      success: true,
      message: "Notice created successfully",
      data: notice,
    });
  } catch (error) {
    console.error("Create super admin notice error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notice",
      error: error.message,
    });
  }
};

// GET ALL NOTICES
const getAllNotices = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      audience = "",
    } = req.query;

    const filter = {};

    // Category filter
    if (category) {
      filter.category = category;
    }

    // -----------------------------
    // Audience filter
    // -----------------------------
    if (audience && ["all", "specific"].includes(audience)) {
      filter.audience = audience;
    }

    // -----------------------------
    // Search filter
    // -----------------------------
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      filter.$or = [
        { title: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
        { fullDetails: searchRegex },
      ];
    }

    const notices = await SuperAdminNotice.find(filter)
      .populate({
        path: "selectedAdmin",
        select:
          "name email phone profilePhoto state district subDistrict panchayat status",
      })
      .populate({
        path: "createdBy",
        select: "name email profilePhoto",
      })
      .sort({
        isPinned: -1,
        createdAt: -1,
      });

    // Format audience for frontend
    const formattedNotices = notices.map((notice) => {
      const noticeObject = notice.toObject();

      return {
        ...noticeObject,

        audience:
          notice.audience === "all"
            ? "All Admins"
            : notice.selectedAdmin?.name || "Selected Admin",

        selectedAdmin: notice.selectedAdmin
          ? {
              id: notice.selectedAdmin._id,
              name: notice.selectedAdmin.name,
              email: notice.selectedAdmin.email,
              phone: notice.selectedAdmin.phone,
              profilePhoto: notice.selectedAdmin.profilePhoto,
              state: notice.selectedAdmin.state,
              district: notice.selectedAdmin.district,
              subDistrict: notice.selectedAdmin.subDistrict,
              panchayat: notice.selectedAdmin.panchayat,
              status: notice.selectedAdmin.status,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedNotices.length,
      data: formattedNotices,
    });
  } catch (error) {
    console.error("Get super admin notices error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notices",
      error: error.message,
    });
  }
};
// GET NOTICE BY ID
const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notice ID is required",
      });
    }

    const notice = await SuperAdminNotice.findById(id)
      .populate({
        path: "selectedAdmin",
        select:
          "name email phone profilePhoto state district subDistrict panchayat status",
      })
      .populate({
        path: "createdBy",
        select: "name email profilePhoto",
      });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    const noticeObject = notice.toObject();

    const data = {
      ...noticeObject,

      audience:
        notice.audience === "all"
          ? "All Admins"
          : notice.selectedAdmin?.name || "Selected Admin",

      selectedAdmin: notice.selectedAdmin
        ? {
            id: notice.selectedAdmin._id,
            name: notice.selectedAdmin.name,
            email: notice.selectedAdmin.email,
            phone: notice.selectedAdmin.phone,
            profilePhoto: notice.selectedAdmin.profilePhoto,
            state: notice.selectedAdmin.state,
            district: notice.selectedAdmin.district,
            subDistrict: notice.selectedAdmin.subDistrict,
            panchayat: notice.selectedAdmin.panchayat,
            status: notice.selectedAdmin.status,
          }
        : null,
    };

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get super admin notice error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notice",
      error: error.message,
    });
  }
};
// DELETE NOTICE
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notice ID is required",
      });
    }

    const notice = await SuperAdminNotice.findById(id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    await SuperAdminNotice.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete super admin notice error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notice",
      error: error.message,
    });
  }
};

module.exports = {
  createNotice,
  getAllNotices,
  getNoticeById,
  deleteNotice,
};