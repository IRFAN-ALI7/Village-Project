const Activity = require("../models/Activity");
const User = require("../models/User");
const Admin = require("../models/Admin");
const expressError = require("../utils/expressError");


// PANCHAYAT FILTER HELPER
const getPanchayatFilter = (person) => {

    if (person.panchayatCode) {
        return {
            $or: [
                { panchayatCode: person.panchayatCode },
                {
                    panchayatCode: null,
                    panchayat: person.panchayat
                }
            ]
        };
    }

    return {
        panchayat: person.panchayat
    };
};


// GET USER ACTIVITIES / NOTIFICATIONS
const getUserActivities = async (req, res) => {
    const user = await User.findById(req.userId)
        .select("panchayat panchayatCode");

    if (!user) {
        throw new expressError(
            404,
            "User not found"
        );
    }

    const panchayatFilter =
        getPanchayatFilter(user);

    const activities = await Activity.find({
        isNotification: true,
        $or: [

            // Direct notification for this user
            {
                user: req.userId,
                audience: "user"
            },

            // Panchayat-wide notification
            {
                audience: "all",
                ...panchayatFilter
            },

            // Global notification
            {
                audience: "all",
                panchayat: "",
                panchayatCode: null
            }
        ]
    }).sort({ createdAt: -1 });


    const unreadCount = await Activity.countDocuments({
        isNotification: true,
        isRead: false,

        $or: [

            // Direct notification for this user
            {
                user: req.userId,
                audience: "user"
            },

            // Panchayat-wide notification
            {
                audience: "all",
                ...panchayatFilter
            },

            // Global notification
            {
                audience: "all",
                panchayat: "",
                panchayatCode: null
            }
        ]

    });

    res.status(200).json({
        success: true,
        activities,
        unreadCount
    });
};



// GET ADMIN ACTIVITIES / NOTIFICATIONS
const getAdminActivities = async (req, res) => {
    const admin = await Admin.findById(req.userId)
        .select("panchayat panchayatCode");
    if (!admin) {
        throw new expressError(
            404,
            "Admin not found"
        );
    }

    const panchayatFilter =
        getPanchayatFilter(admin);

    const activities = await Activity.find({
        audience: "admin",
        isNotification: true,
        ...panchayatFilter
    }).sort({ createdAt: -1 });


    const unreadCount = await Activity.countDocuments({
        audience: "admin",
        isNotification: true,
        isRead: false,
        ...panchayatFilter

    });

    res.status(200).json({
        success: true,
        activities,
        unreadCount
    });
};



// GET AUTHORIZED USER ACTIVITY
const getAuthorizedUserActivity = async (
    req,
    activityId
) => {
    const user = await User.findById(req.userId)
        .select("panchayat panchayatCode");

    if (!user) {
        throw new expressError(
            404,
            "User not found"
        );
    }
    const panchayatFilter =
        getPanchayatFilter(user);


    const activity = await Activity.findOne({
        _id: activityId,
        isNotification: true,
        $or: [

            // Direct user notification
            {
                user: req.userId,
                audience: "user"
            },

            // Panchayat notification
            {
                audience: "all",
                ...panchayatFilter
            },

            // Global notification
            {
                audience: "all",
                panchayat: "",
                panchayatCode: null
            }
        ]

    });
    return activity;
};


// GET AUTHORIZED ADMIN ACTIVITY
const getAuthorizedAdminActivity = async (
    req,
    activityId
) => {
    const admin = await Admin.findById(req.userId)
        .select("panchayat panchayatCode");
    if (!admin) {
        throw new expressError(
            404,
            "Admin not found"
        );
    }

    const panchayatFilter =
        getPanchayatFilter(admin);

    const activity = await Activity.findOne({
        _id: activityId,
        audience: "admin",
        isNotification: true,
        ...panchayatFilter
    });

    return activity;
};


// MARK SINGLE NOTIFICATION AS READ
const markAsRead = async (req, res) => {
    const { id } = req.params;
    let activity;

    if (req.role === "admin") {
        activity =
            await getAuthorizedAdminActivity(
                req,
                id
            );

    } else {
        activity =
            await getAuthorizedUserActivity(
                req,
                id
            );
    }


    if (!activity) {
        throw new expressError(
            403,
            "You are not authorized to update this notification."
        );
    }


    activity.isRead = true;
    await activity.save();

    res.status(200).json({
        success: true,
        message:
            "Notification marked as read",
        activity
    });
};


// MARK ALL NOTIFICATIONS AS READ
const markAllAsRead = async (req, res) => {
    let filter;

    // ADMIN
    if (req.role === "admin") {
        const admin =
            await Admin.findById(req.userId)
                .select(
                    "panchayat panchayatCode"
                );


        if (!admin) {
            throw new expressError(
                404,
                "Admin not found"
            );
        }

        const panchayatFilter =
            getPanchayatFilter(admin);

        filter = {
            audience: "admin",
            isNotification: true,
            isRead: false,
            ...panchayatFilter

        };
    }

    // USER
    else {
        const user =
            await User.findById(req.userId)
                .select(
                    "panchayat panchayatCode"
                );

        if (!user) {
            throw new expressError(
                404,
                "User not found"
            );
        }

        const panchayatFilter =
            getPanchayatFilter(user);

        filter = {
            isNotification: true,
            isRead: false,
            $or: [

                // Direct notification for this user
                {
                    user: req.userId,
                    audience: "user"
                },

                // Panchayat-wide notification
                {
                    audience: "all",
                    ...panchayatFilter
                },

                // Global notification
                {
                    audience: "all",
                    panchayat: "",
                    panchayatCode: null
                }
            ]
        };
    }

    await Activity.updateMany(
        filter,

        {
            $set: {
                isRead: true
            }
        }
    );

    res.status(200).json({
        success: true,
        message:
            "All notifications marked as read"
    });
};


// DELETE SINGLE NOTIFICATION
const deleteActivity = async (req, res) => {
    const { id } = req.params;
    let activity;
    if (req.role === "admin") {
        activity =
            await getAuthorizedAdminActivity(
                req,
                id
            );

    } else {
        activity =
            await getAuthorizedUserActivity(
                req,
                id
            );
    }


    if (!activity) {
        throw new expressError(
            403,
            "You are not authorized to delete this notification."
        );
    }

    await Activity.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message:
            "Notification deleted successfully"
    });
};


// DELETE ALL NOTIFICATIONS
const deleteAllActivities = async (req, res) => {
    let filter;


    // ADMIN
    if (req.role === "admin") {
        const admin =
            await Admin.findById(req.userId)
                .select(
                    "panchayat panchayatCode"
                );

        if (!admin) {
            throw new expressError(
                404,
                "Admin not found"
            );
        }


        const panchayatFilter =
            getPanchayatFilter(admin);

        filter = {
            audience: "admin",
            isNotification: true,
            ...panchayatFilter
        };
    }


    // USER
    else {
        const user =
            await User.findById(req.userId)
                .select(
                    "panchayat panchayatCode"
                );


        if (!user) {
            throw new expressError(
                404,
                "User not found"
            );
        }
        const panchayatFilter =
            getPanchayatFilter(user);

        filter = {
            isNotification: true,
            $or: [

                // Direct notification for this user
                {
                    user: req.userId,
                    audience: "user"
                },

                // Panchayat-wide notification
                {
                    audience: "all",
                    ...panchayatFilter
                },

                // Global notification
                {
                    audience: "all",
                    panchayat: "",
                    panchayatCode: null
                }
            ]
        };
    }
    await Activity.deleteMany(filter);

    res.status(200).json({
        success: true,
        message:
            "All notifications deleted successfully"
    });
};


// EXPORTS
module.exports = {
    getUserActivities,
    getAdminActivities,
    markAsRead,
    markAllAsRead,
    deleteActivity,
    deleteAllActivities

};