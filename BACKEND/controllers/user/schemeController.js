const Scheme = require("../../models/Scheme");
const User = require("../../models/User");
const expressError = require("../../utils/expressError");


// GET USER'S PANCHAYAT SCHEMES
const getUserSchemes = async (req, res) => {

    const user = await User.findById(req.userId)
        .select("panchayat panchayatCode");

    if (!user) {
        throw new expressError(404, "User not found");
    }

    // User ke Panchayat ke schemes hi fetch honge
    let panchayatFilter;


    if (user.panchayatCode) {

        panchayatFilter = {
            $or: [
                {
                    panchayatCode: user.panchayatCode
                },
                {
                    panchayatCode: null,
                    panchayat: user.panchayat
                },
                {
                    panchayatCode: {
                        $exists: false
                    },
                    panchayat: user.panchayat
                }
            ]
        };

    } else {

        panchayatFilter = {
            panchayat: user.panchayat
        };
    }


    // Sirf active schemes User ko dikhengi
    const schemes = await Scheme.find({
        status: "active",
        ...panchayatFilter
    })
        .sort({
            createdAt: -1
        });


    res.status(200).json({
        success: true,
        data: schemes
    });
};


module.exports = {
    getUserSchemes
};