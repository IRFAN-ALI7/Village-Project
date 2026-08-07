const Joi = require("joi");

const userSchema = Joi.object({
    name: Joi.string().required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
    email: Joi.string().email(),
    address: Joi.string().required(),
    panchayat: Joi.string().required(),
    village: Joi.string().required(),
    wardNo: Joi.number().required(),
    postOffice: Joi.string().required(),
    policeStation: Joi.string().required(),
    district: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.number().min(100000).max(999999).required(),
    password: Joi.string().min(4).required(),
    status: Joi.string().valid("active", "inactive"),

    profileImage: Joi.string().optional().allow(""),
});

const userValidate = (req,res,next)=> {
   const {error} = userSchema.validate(req.body);
   if(error){
    return res.status(400).json({
        message: error.details[0].message
    });
   }
   next();
}

const adminSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    password: Joi.string().min(4).required()
});

const adminValidate = (req,res,next)=> {
    const {error} = adminSchema.validate(req.body);
    if(error){
        res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}

const noticeSchema = Joi.object({
    title: Joi.string().required(),
    category: Joi.string().valid("urgent", "meeting", "scheme", "services", "general").required(),
    date: Joi.date().optional().allow(null),
    time: Joi.string().optional().allow(""),
    location: Joi.string().optional().allow(""),
    description: Joi.string().required(),
    fullDetails: Joi.string().required(),
    isPinned: Joi.boolean().optional(),
});
const noticeValidate = (req,res, next)=> {
    const {error} = noticeSchema.validate(req.body);
    if(error){
        res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}

const schemeSchema = Joi.object({
    name: Joi.string().required(),
    category: Joi.string().valid('Housing', 'Agriculture', 'Health','Education', 'Social Welfare', 'Employment', 'Women Empowerment', 'Environment').required(),
    status: Joi.string().valid('active', 'inactive').required(),
    officialLink: Joi.string().uri().required(),
    image: Joi.string().optional().allow(""),
    startDate: Joi.date().optional().allow(null),
    endDate: Joi.date().optional().allow(null),
    description: Joi.string().required(),
    eligibility: Joi.string().required(),   
    documents: Joi.string().optional().allow(""),
});

const schemeValidate = (req, res, next) => {
    const { error } = schemeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
};

module.exports = {
    userValidate,
    adminValidate,
    noticeValidate,
    schemeValidate,
};