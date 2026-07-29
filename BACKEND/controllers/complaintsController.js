const Complaint = require("../models/Complaint");
const expressError = require("../utils/expressError");
const Activity = require("../models/Activity");
const User = require("../models/User");

module.exports.createComplaint = async(req,res)=> {
    const {
        complaintType,
        otherComplaint,
        priority,
        description,
        wardNo,
        landmark } = req.body;

        const type = complaintType.toLowerCase();

        const categoryMap = {

            //Infrastructure
            "street-light": "Infrastructure",
            "electricity": "Infrastructure",
            "road-damage": "Infrastructure",

            //Basic Amenities
            "water-supply": "Basic Amenities",
            "drainage": "Basic Amenities",

            //Sanitation
            "garbage": "Sanitation",
            "public-toilet": "Sanitation",

            //government,
            "government-service": "Government",
            "ration-shop": "Government",
            "pension": "Government",
            "birth-death-cert": "Government",
            "land-records": "Government",

            //Health /Education
            "health-center": "Health",
            "school-education": "Education",

            //Environment /safety
            "tree-cutting": "Environment",
            "noise-pollution": "Environment",
            "construction": "Environment",
            "animal-issue": "Environment",
            "illegal construction": "Evironment",
            "public-safety": "Safety",

            //Agriculture
            "agriculture": "Agriculture",
        };
        const category = categoryMap[type] || "Other";

            const randomNumber = Math.floor(100000 + Math.random()* 900000);
            const complaintId = "CMP" + randomNumber;

            const photoUrls = req.files ? 
            req.files.map(file =>file.path) : [];


            const complaint = new Complaint({
                complaintId,
                complaintType,
                category,
                otherComplaint,
                priority,
                description,
                wardNo,
                landmark,
                photos: photoUrls,
                userId: req.userId
            });

            await complaint.save();
            const user = await User.findById(req.userId);
           

               // User Activity
                   await Activity.create({
                user: req.userId,
                   audience: "user",
                createdBy: "user",
                 type: "COMPLAINT_SUBMITTED",
                     title: "Complaint Submitted",
                  description: `Your complaint (${complaintId}) has been submitted successfully.`,
              route: "/my-complaints",
                    isNotification: true,
                      isRead: false,
                priority: priority || "normal",
                status: "pending",
                  });

                // Admin Notification
                  await Activity.create({
                   audience: "admin",
                createdBy: "user",
                   type: "COMPLAINT_SUBMITTED",
                 title: "New Complaint Received",
                  description: `${user.name} submitted a complaint.`,
                  route: "/admin/complaints",
                isNotification: true,
                  isRead: false,
                   priority: priority || "normal",
                   status: "pending",
               });

            res.json({
                message: "Complaint submitted successfully",
                complaintId
            });
};

module.exports.getUserComplaints = async(req,res)=> {
    const userId = req.userId;
    const complaints = await Complaint.find
    ({userId: userId}).sort({createdAt: -1});
    res.json(complaints);
    
}

module.exports.deleteComplaint = async(req, res)=> {
    const complaintId = req.params.complaintId;
    const deleted = await Complaint.findOneAndDelete({complaintId: complaintId});
    if(!deleted){
        throw new expressError(404, "Complaint not found");
    }
     res.status(200).json({
        message: "Deleted successfully"
     });
}

 