const Scheme = require("../models/Scheme");
const Activity = require("../models/Activity");

const addScheme = async(req, res) => {
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

     const newScheme = await Scheme.create({
        name,
        category,
        status,
        officialLink,
        image: req.file ? req.file.path : null,
        startDate,
        endDate,
        description,
        eligibility,
        documents
     });
    
     await Activity.create({
    audience: "all",
    createdBy: "admin",
    type: "NEW_SCHEME",
    title: "New Government Scheme",
    description: `${newScheme.name} has been added.`,
    route: "/schemes",
    isNotification: true,
    isRead: false,
    priority: "medium",
    status: "completed",
});
    res.status(200).json({
        message: "Scheme added successfully",
        scheme: newScheme
    });
};

const getAllSchemes = async(req, res) => {
    const schemes = await Scheme.find().sort({createdAt: -1});
    res.status(200).json({
        data: schemes,
    });
}

const updateScheme = async(req, res) => {
    const schemeId = req.params.id;
    const scheme = await Scheme.findById(schemeId);

    if (!scheme) {
        return res.status(404).json({
            message: "Scheme not found"
        });
    }

    const updatedData = {
        name: req.body.name ,
        category: req.body.category,
        status: req.body.status,
        officialLink: req.body.officialLink,
        startDate: req.body.startDate, 
        endDate: req.body.endDate,
        description: req.body.description,
        eligibility: req.body.eligibility,
        documents: req.body.documents
    };
    if(req.file) {
        updatedData.image = req.file.path;
    }

    const updatedScheme = await Scheme.findByIdAndUpdate(
        schemeId,
         updatedData,
          { new: true }
        );

    res.status(200).json({
        message: "Scheme updated successfully",
        scheme: updatedScheme
    });
};

const deleteScheme = async(req, res) => {
    const schemeId = req.params.id;
    const scheme = await Scheme.findById(schemeId);
    if(!scheme) {
        return res.status(404).json({
            message: "Scheme not found"
        });
    }

    await Scheme.findByIdAndDelete(schemeId);

    res.status(200).json({
        message: "Scheme deleted successfully"
    });
};

module.exports = {
    addScheme,
    getAllSchemes,
    updateScheme,
    deleteScheme
};
