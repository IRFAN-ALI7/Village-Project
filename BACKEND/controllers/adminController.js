const Admin = require("../models/Admin");
const User = require("../models/User");
const expressError = require("../utils/expressError");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Complaint = require("../models/Complaint");
const Activity = require("../models/Activity");


  const registerAdmin = async(req,res)=> {
    const phone = req.body.mobile;
    const email = req.body.email;
    const admin = new Admin(req.body);
    const existEmail = await Admin.findOne({email});

    const existingAdmin = await Admin.findOne({phone});
    console.log(existingAdmin);
    if(existingAdmin){
        throw new expressError(400, "Mobile already registered!");
    }
    if(existEmail){
      throw new expressError(400, "This email already registered!");
    }
    
       await admin.save();

    const token = jwt.sign(
    {
      id: admin._id,
      role: "admin",
    },
    process.env.JWT_SECRET,
    {expiresIn:"1d"}
  );

     res.json({
        message: "User registered successfully!",
         token: token
     });
}

 const loginAdmin = async(req,res)=> {
    const {phone, password} = req.body;
    const admin = await Admin.findOne({phone});

    if(!admin){
        throw new expressError(404,  "invalid phone number!");
    }

  const isMatch = await bcrypt.compare(password,admin.password);
  if(!isMatch){
          throw new expressError(404,"wrong password!");
  }

  const token = jwt.sign(
    {
      id: admin._id,
      role: "admin",
    },
    process.env.JWT_SECRET,
    {expiresIn:"1d"}
  );

    res.json({
        message: "Login successfull",
         token,
         name: admin.name,

    });
    }

    // get users 
    const getAllUsers = async(req, res)=> {
      const users = await User.find().sort({createdAt: -1}).select("-password");
      res.status(200).json(users);
    }

    //get Complaints
    const getAllComplaints = async(req,res)=> {
      const complaints = await Complaint.find().populate("userId","name mobile email").sort({createdAt: -1});
      res.status(200).json(complaints);
    }

    //get recent-complaints
    const getRecentComplaints = async(req,res)=> {
      const recentComplaints = await Complaint.find()
      .populate("userId", "name")
      .sort({createdAt: -1})
      .limit(5);
      const total = await Complaint.countDocuments();
      res.status(200).json({
        recentComplaints,
         total});
    }

    //Update Complaint Status
    const updateStatus = async(req,res) => {
      const {id} = req.params;
      const {status, reasons} = req.body;

    const complaint = await Complaint.findById(id);
    if(!complaint){
      throw new expressError(404, "Complaint not found");
    }

    complaint.status = status;
    complaint.statusReason = reasons;

    if(status === "in-progress"){
      complaint.inProgressAt = new Date();
    }
    if(status === "resolved"){
      complaint.resolvedAt = new Date();
    }
    if(status === "rejected"){
      complaint.rejectedAt = new Date();
    }
    await complaint.save();
    if (status === "in-progress") {
  await Activity.create({
    user: complaint.userId,
    audience: "user",
    createdBy: "admin",
    type: "COMPLAINT_IN_PROGRESS",
    title: "Complaint In Progress",
    description: "Your complaint is being processed.",
    route: "/my-complaints",
    isNotification: true,
    isRead: false,
    priority: "normal",
    status: "pending",
  });
}

if (status === "resolved") {
  await Activity.create({
    user: complaint.userId,
    audience: "user",
    createdBy: "admin",
    type: "COMPLAINT_RESOLVED",
    title: "Complaint Resolved",
    description: "Your complaint has been resolved successfully.",
    route: "/my-complaints",
    isNotification: true,
    isRead: false,
    priority: "high",
    status: "completed",
  });
}

if (status === "rejected") {
  await Activity.create({
    user: complaint.userId,
    audience: "user",
    createdBy: "admin",
    type: "COMPLAINT_REJECTED",
    title: "Complaint Rejected",
    description: `Your complaint has been rejected. Reason: ${reasons}`,
    route: "/my-complaints",
    isNotification: true,
    isRead: false,
    priority: "high",
    status: "rejected",
  });
}
    
    res.status(200).json({
       message: "Status updated successfully"
    });
    }

    const deleteUser = async(req,res)=> {
      await Complaint.deleteMany({userId: req.params.id});
        await User.findByIdAndDelete(req.params.id);
      res.status(200).json(
        {message: "User deleted successfully!"}
      );
    };

    const updateUserByAdmin = async(req,res)=> {
      const {id} = req.params;
      const updateUser = await User.findByIdAndUpdate(id, req.body, {new: true, runValidators: true});
      if(!updateUser){
        throw new expressError(404, "User not found");
      }
          await Activity.create({
          user: updateUser._id,
            audience: "user",
         createdBy: "admin",
          type: "PROFILE_UPDATED",
             title: "Profile Updated",
             description: "Your profile has been updated by the administrator.",
          route: "/profile",
           isNotification: true,
          isRead: false,
          priority: "normal",
         status: "completed",
      });
      res.status(200).json({
        message: 'User updated successfully!',
        user: updateUser,
      });
    };

    module.exports = {
        registerAdmin,
        loginAdmin,
        getAllUsers,
        getAllComplaints,
        getRecentComplaints,
        updateStatus,
        deleteUser,
        updateUserByAdmin,
    }