const Notice = require("../../models/Notice");
const User = require("../../models/User");
const expressError = require("../../utils/expressError");

const getUserNotices = async (req, res) => {
    const user = await User.findById(req.userId)
        .select("panchayat panchayatCode");

    if (!user) {
        throw new expressError(404, "User not found");
    }

    if (!user.panchayat) {
        return res.status(200).json({
            success: true,
            data: []
        });
    }

    let panchayatFilter;

    if (user.panchayatCode) {
        panchayatFilter = {
            $or: [
                { panchayatCode: user.panchayatCode },
                {
                    panchayatCode: null,
                    panchayat: user.panchayat
                },
                {
                    panchayatCode: { $exists: false },
                    panchayat: user.panchayat
                }
            ]
        };
    } else {
        panchayatFilter = {
            panchayat: user.panchayat
        };
    }

    const notices = await Notice.find(panchayatFilter)
        .sort({
            isPinned: -1,
            createdAt: -1
        });

    res.status(200).json({
        success: true,
        data: notices
    });
};

module.exports = {
    getUserNotices
};