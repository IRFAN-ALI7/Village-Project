const Notice = require("../models/Notice");
const Activity = require("../models/Activity");


const createNotice = async(req,res)=> {
   const data = req.body;
   let validUpto;
    if(data.date) {
        validUpto = data.date;
    } else{
        const today = new Date();
        today.setDate(today.getDate() + 7);
        validUpto = today;
    }

    const notice = new Notice({
        ...data,
        validUpto,
        createdBy: req.userId
    });
    await notice.save();
    await Activity.create({
    audience: "all",
    createdBy: "admin",
    type: "NEW_NOTICE",
    title: "New Notice Published",
    description: `${notice.title} has been published.`,
    route: "/notices",
    isNotification: true,
    isRead: false,
    priority: "urgent",
    status: "completed",
});
    res.status(201).json({
        message: "Notice created successfully",
    });
}

const getAllNotices = async (req,res)=> {
    const notices = await Notice.find().sort({createdAt: -1});
    res.status(200).json({
        notices
    });
}

const updateNotice = async(req, res)=> {
    const {id} = req.params;
    const updatedNotice = await Notice.findByIdAndUpdate(
        id,
        req.body,
        {new: true}
    );
    res.status(200).json({
        message: "Notice Updated",
        notice: updatedNotice
    });
}

const deleteNotice = async(req,res)=> {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if(!notice){
        throw new expressError(404, "Notice not found");
    }
    res.status(200).json({
        message: "Notice deleted successfully"
    });
}

module.exports = {
    createNotice,
    getAllNotices,
    updateNotice,
    deleteNotice,
}