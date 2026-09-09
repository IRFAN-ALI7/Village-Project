const Notice = require("../../models/Notice");
const Admin = require("../../models/Admin");
const Activity = require("../../models/Activity");
const expressError = require("../../utils/expressError");
const SuperAdminNotice = require("../../models/SuperAdminNotice");

// ----------------------------------------------------
// COMMON PANCHAYAT FILTER
// ----------------------------------------------------
const getAdminPanchayatFilter = (admin) => {
    if (admin.panchayatCode) {
        return {
            $or: [
                {
                    panchayatCode: admin.panchayatCode
                },
                {
                    panchayatCode: null,
                    panchayat: admin.panchayat
                },
                {
                    panchayatCode: { $exists: false },
                    panchayat: admin.panchayat
                }
            ]
        };
    }

    return {
        panchayat: admin.panchayat
    };
};


// CREATE NOTICE , NOTICE WILL BELONG TO LOGGED-IN ADMIN'S PANCHAYAT
const createNotice = async (req, res) => {
    const admin = await Admin.findById(req.userId).select(
        "panchayat panchayatCode"
    );

    if (!admin) {
        throw new expressError(404, "Admin not found");
    }

    const data = { ...req.body };

    // If frontend sends date but no validUpto,
    // keep 7-day default behavior.
    if (!data.validUpto && data.date) {
        const noticeDate = new Date(data.date);

        if (!Number.isNaN(noticeDate.getTime())) {
            noticeDate.setDate(noticeDate.getDate() + 7);
            data.validUpto = noticeDate.toISOString().split("T")[0];
        }
    }

    // Never trust ownership information from frontend.
    delete data.createdBy;
    delete data.panchayat;
    delete data.panchayatCode;

    const notice = await Notice.create({
        ...data,

        createdBy: admin._id,
        panchayat: admin.panchayat,
        panchayatCode: admin.panchayatCode || null
    });

    // Create notification for users of this Panchayat.
    await Activity.create({
        audience: "all",
        createdBy: "admin",
        type: "NEW_NOTICE",
        title: notice.title,
        description:
            notice.description || "A new notice has been published.",
        route: "/notices",
        isNotification: true,
        isRead: false,
        priority:
            notice.category === "urgent"
                ? "urgent"
                : "medium",
        status: "completed",

        panchayat: admin.panchayat || "",
        panchayatCode: admin.panchayatCode || null
    });

    res.status(201).json({
        success: true,
        message: "Notice created successfully!",
        notice
    });
};


//  GET ALL NOTICES ,ONLY LOGGED-IN ADMIN'S PANCHAYAT
const getAllNotices = async (req, res) => {
    const admin = await Admin.findById(req.userId).select(
        "panchayat panchayatCode"
    );

    if (!admin) {
        throw new expressError(404, "Admin not found");
    }

    const filter = getAdminPanchayatFilter(admin);

    const notices = await Notice.find(filter).sort({
        isPinned: -1,
        createdAt: -1
    });

    res.status(200).json({
        success: true,
        data: notices
    });
};

const getOfficialNotices = async (req, res) => {
    const admin = await Admin.findById(req.userId).select(
        "_id name email phone profilePhoto state district subDistrict panchayat panchayatCode status"
    );

    if (!admin) {
        throw new expressError(404, "Admin not found");
    }

    const today = new Date();

    const filter = {
        validUpto: { $gte: today },
        $or: [
            {
                audience: "all"
            },
            {
                audience: "specific",
                selectedAdmin: admin._id
            }
        ]
    };

    const notices = await SuperAdminNotice.find(filter)
        .populate({
            path: "createdBy",
            select: "name email profilePhoto"
        })
        .sort({
            isPinned: -1,
            createdAt: -1
        });

    res.status(200).json({
        success: true,
        count: notices.length,
        data: notices
    });
};


// UPDATE NOTICE , ONLY NOTICE OF ADMIN'S PANCHAYAT
const updateNotice = async (req, res) => {
    const { id } = req.params;

    const admin = await Admin.findById(req.userId).select(
        "panchayat panchayatCode"
    );

    if (!admin) {
        throw new expressError(404, "Admin not found");
    }

    const filter = {
        _id: id,
        ...getAdminPanchayatFilter(admin)
    };

    const existingNotice = await Notice.findOne(filter);

    if (!existingNotice) {
        throw new expressError(
            403,
            "You are not authorized to manage this notice."
        );
    }

    const data = { ...req.body };

    // Ownership cannot be changed by Admin.
    delete data.createdBy;
    delete data.panchayat;
    delete data.panchayatCode;

    const updatedNotice = await Notice.findByIdAndUpdate(
        id,
        data,
        {
            returnDocument: "after",
            runValidators: true
        }
    );

    if (!updatedNotice) {
        throw new expressError(404, "Notice not found");
    }

    res.status(200).json({
        success: true,
        message: "Notice updated successfully!",
        notice: updatedNotice
    });
};


//  DELETE NOTICE ,ONLY NOTICE OF ADMIN'S PANCHAYAT
const deleteNotice = async (req, res) => {
    const { id } = req.params;

    const admin = await Admin.findById(req.userId).select(
        "panchayat panchayatCode"
    );

    if (!admin) {
        throw new expressError(404, "Admin not found");
    }

    const filter = {
        _id: id,
        ...getAdminPanchayatFilter(admin)
    };

    const notice = await Notice.findOne(filter);

    if (!notice) {
        throw new expressError(
            403,
            "You are not authorized to delete this notice."
        );
    }

    await Notice.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: "Notice deleted successfully!"
    });
};

module.exports = {
    createNotice,
    getAllNotices,
    getOfficialNotices,
    updateNotice,
    deleteNotice
};