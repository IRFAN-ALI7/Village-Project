const Scheme = require("../../models/Scheme");
const Admin = require("../../models/Admin");
const Activity = require("../../models/Activity");
const expressError = require("../../utils/expressError");
const cloudinary = require("../../config/cloudinary");


// ADMIN PANCHAYAT FILTER
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
                    panchayatCode: {
                        $exists: false
                    },
                    panchayat: admin.panchayat
                }
            ]
        };
    }
    return {
        panchayat: admin.panchayat
    };
};



// CREATE SCHEME, SCHEME BELONGS TO LOGGED-IN ADMIN'S PANCHAYAT
const addScheme = async (req, res) => {

    const admin = await Admin.findById(req.userId)
        .select("panchayat panchayatCode");

    if (!admin) {
        throw new expressError(
            404,
            "Admin not found"
        );
    }


    const {
        name,
        category,
        status,
        officialLink,
        startDate,
        endDate,
        description,
        eligibility,
        documents
    } = req.body;

    if (!name || !name.trim()) {
        throw new expressError(
            400,
            "Scheme name is required"
        );
    }


    const scheme = await Scheme.create({
        name: name.trim(),
        category,
        status: status || "active",
        officialLink,
        startDate,
        endDate,
        description,
        eligibility,
        documents,
        image: req.file
            ? req.file.path
            : "",

            imagePublicId: req.file
    ? req.file.filename
    : "",

        // OWNERSHIP
        createdBy: admin._id,
        panchayat: admin.panchayat,
        panchayatCode:
            admin.panchayatCode || null
    });


    // PANCHAYAT-SPECIFIC NOTIFICATION
    await Activity.create({
        audience: "all",
        createdBy: "admin",
        type: "NEW_SCHEME",
        title: scheme.name,
        description:
            scheme.description ||
            "A new scheme has been published.",

        route: "/schemes",
        isNotification: true,
        isRead: false,
        priority: "medium",
        status: "completed",
        panchayat:
            admin.panchayat || "",
        panchayatCode:
            admin.panchayatCode || null
    });


    res.status(201).json({
        success: true,
        message: "Scheme added successfully!",
        scheme
    });
};


//  CREATE SCHEME ,ONLY ADMIN'S PANCHAYAT
const getAllSchemes = async (req, res) => {

    const admin = await Admin.findById(req.userId)
        .select("panchayat panchayatCode");

    if (!admin) {
        throw new expressError(
            404,
            "Admin not found"
        );
    }


    const filter =
        getAdminPanchayatFilter(admin);

    const schemes = await Scheme.find(filter)
        .sort({
            createdAt: -1
        });

    res.status(200).json({
        success: true,
        data: schemes
    });
};

// ONLY ADMIN'S PANCHAYAT
const updateScheme = async (req, res) => {
    const { id } = req.params;

    const admin = await Admin.findById(req.userId)
        .select("panchayat panchayatCode");

    if (!admin) {
        throw new expressError(
            404,
            "Admin not found"
        );
    }


    const filter = {
        _id: id,
        ...getAdminPanchayatFilter(admin)

    };

    const existingScheme =
        await Scheme.findOne(filter);

    if (!existingScheme) {
        throw new expressError(
            403,
            "You are not authorized to manage this scheme."
        );
    }


    const {
        name,
        category,
        status,
        officialLink,
        startDate,
        endDate,
        description,
        eligibility,
        documents
    } = req.body;


    // UPDATE ONLY PROVIDED FIELDS

    if (name !== undefined) {
        existingScheme.name =
            name.trim();
    }

    if (category !== undefined) {
        existingScheme.category =
            category;
    }

    if (status !== undefined) {
        existingScheme.status =
            status;
    }

    if (officialLink !== undefined) {
        existingScheme.officialLink =
            officialLink;
    }

    if (startDate !== undefined) {
        existingScheme.startDate =
            startDate;
    }

    if (endDate !== undefined) {
        existingScheme.endDate =
            endDate;
    }

    if (description !== undefined) {
        existingScheme.description =
            description;
    }

    if (eligibility !== undefined) {
        existingScheme.eligibility =
            eligibility;
    }

    if (documents !== undefined) {
        existingScheme.documents =
            documents;
    }

    // UPDATE IMAGE ONLY IF NEW IMAGE EXISTS
if (req.file) {
    // Delete old image from Cloudinary
    if (existingScheme.imagePublicId) {
        await cloudinary.uploader.destroy(
            existingScheme.imagePublicId
        );
    }

    // Save new image details
    existingScheme.image =
        req.file.path;

    existingScheme.imagePublicId =
        req.file.filename;
}

    // OWNERSHIP CANNOT BE CHANGED
    existingScheme.panchayat =
        admin.panchayat;

    existingScheme.panchayatCode =
        admin.panchayatCode || null;


    if (!existingScheme.createdBy) {

        existingScheme.createdBy =
            admin._id;
    }


    await existingScheme.save();

    res.status(200).json({
        success: true,
        message:
            "Scheme updated successfully!",
        scheme: existingScheme

    });
};



//  DELETE SCHEME ,ONLY ADMIN'S PANCHAYAT
const deleteScheme = async (req, res) => {

    const { id } = req.params;
    const admin = await Admin.findById(req.userId)
        .select("panchayat panchayatCode");

    if (!admin) {
        throw new expressError(
            404,
            "Admin not found"
        );
    }


    const filter = {
        _id: id,
        ...getAdminPanchayatFilter(admin)
    };

    const scheme =
        await Scheme.findOne(filter);

    if (!scheme) {
        throw new expressError(
            403,
            "You are not authorized to delete this scheme."
        );
    }

    // Delete scheme image from Cloudinary
if (scheme.imagePublicId) {
    await cloudinary.uploader.destroy(
        scheme.imagePublicId
    );
}
    await Scheme.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message:
            "Scheme deleted successfully!"
    });
};

// EXPORTS
module.exports = {
    addScheme,
    getAllSchemes,
    updateScheme,
    deleteScheme
};