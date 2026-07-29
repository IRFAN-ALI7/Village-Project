
const expressError = require("../utils/expressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Activity = require("../models/Activity");

  const registerUser = async(req,res)=> {
    const mobile = req.body.mobile;
    const email = req.body.email;
    const user = new User(req.body);
    const existEmail = await User.findOne({email});

    const existingUser = await User.findOne({mobile});
    console.log(existingUser);
    if(existingUser){
        throw new expressError(400, "Mobile already registered!");
    }
    if(existEmail){
      throw new expressError(400, "This email already registered!");
    }
    
       await user.save();

       // User Activity
         await Activity.create({
       user: user._id,
        audience: "user",
       createdBy: "user",
       type: "REGISTERED",
      title: "Registration Successful",
       description: "Your account has been created successfully.",
        route: "/dashboard",
       isNotification: true,
        isRead: false,
       priority: "low",
        status: "completed",
      });

// Admin Notification
await Activity.create({
  audience: "admin",
  createdBy: "user",
  type: "REGISTERED",
  title: "New User Registered",
  description: `${user.name} has registered successfully.`,
  route: "/admin/users",
  isNotification: true,
  isRead: false,
  priority: "low",
  status: "completed",
});

    const token = jwt.sign(
    {
      id:user._id,
      role: "user",
    },
    process.env.JWT_SECRET,
    {expiresIn:"1d"}
  );

     res.json({
        message: "User registered successfully!",
         token: token
     });
}

 const loginUser = async(req,res)=> {
    const {mobile, password} = req.body;
    const user = await User.findOne({mobile});

    if(!user){
        throw new expressError(404,  "invalid phone number!");
    }

  const isMatch = await bcrypt.compare(password,user.password);
  if(!isMatch){
          throw new expressError(404,"wrong password!");
  }

  await Activity.create({
  user: user._id,
  audience: "user",
  createdBy: "user",
  type: "LOGIN",
  title: "Login Successful",
  description: "You logged into your account.",
  route: "/dashboard",
  isNotification: false,
  isRead: true,
  priority: "low",
  status: "completed",
});

  const token = jwt.sign(
    {
      id:user._id,
      role: "user",
    },
    process.env.JWT_SECRET,
    {expiresIn:"1d"}
  );

    res.json({
        message: "Login successfull", token
    });
    }

    const getProfile = async(req,res)=> {
        const user = await User.findById(req.userId).select("-password");
        res.json(user);
    };


    const getCurrUser = async(req,res)=> {
        const user = await User.findById(req.userId);
        res.json(user);
    };

   const updateUsers = async(req,res,next)=> {
           const updateUser = await
            User.findByIdAndUpdate
            (req.userId,
              req.body,
               {new: true, runValidators: true}
           );

           await Activity.create({
            user: req.userId,
         audience: "user",
        createdBy: "user",
        type: "PROFILE_UPDATED",
        title: "Profile Updated",
         description: "Your profile information has been updated.",
           route: "/profile",
           isNotification: false,
            isRead: true,
          priority: "low",
         status: "completed",
      });
           res.json(updateUser);
    };

  const deleteUsers = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new expressError(404, "User not found");
  }
  // Admin Notification
  await Activity.create({
    audience: "admin",
    createdBy: "user",
    type: "ACCOUNT_DELETED",
    title: "User Account Deleted",
    description: `${user.name} has permanently deleted the account.`,
    route: "/admin/users",
    isNotification: true,
    isRead: false,
    priority: "high",
    status: "completed",
  });

  // Delete user's complaints
  await Complaint.deleteMany({ userId: req.userId });

  // Delete user account
  await User.findByIdAndDelete(req.userId);

  res.json({
    message: "Account deleted successfully!",
  });
};

    const changePassword = async(req,res)=> {
        const {currentPassword, newPassword} = req.body;
        const user = await User.findById(req.userId);
    
        const isMatch = await
        bcrypt.compare(currentPassword,
            user.password);
    
            if(!isMatch){
                throw new expressError(400, "Current password is wrong");
            }
    
            user.password = newPassword;
            await user.save();
            await Activity.create({
              user: user._id,
             audience: "user",
           createdBy: "user",
            type: "PASSWORD_CHANGED",
            title: "Password Changed",
          description: "Your account password has been changed.",
             route: "/profile",
               isNotification: true,
                isRead: false,
              priority: "high",
            status: "completed",
             });
            res.status(200).json({message: "Password changed successfully!"});
    }

   const forgotPassword = async(req,res)=> {
    const {mobile, newPassword} = req.body;
    const user = await User.findOne({mobile});
    if(!user){
      throw new expressError(404, "use not found");
    }
    user.password = newPassword;
    await user.save();

    await Activity.create({
  user: user._id,
  audience: "user",
  createdBy: "user",
  type: "PASSWORD_CHANGED",
  title: "Password Reset Successfully",
  description: "Your account password has been reset successfully.",
  route: "/profile",
  isNotification: true,
  isRead: false,
  priority: "high",
  status: "completed",
});
    res.status(200).json({
      message: "Password Changed successfully"
    });
   }


    module.exports = {
        registerUser,
        loginUser,
        getProfile,
        getCurrUser,
        updateUsers,
        deleteUsers,
        changePassword,
        forgotPassword,
    }
