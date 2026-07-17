
const expressError = require("../utils/expressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User");
const Complaint = require("../models/Complaint");

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
           res.json(updateUser);
    };

    const deleteUsers = async(req,res,next)=> {
        await Complaint.deleteMany({userId: req.userId});
          await User.findByIdAndDelete(req.userId);
        res.json({message: "Account deleted successfully!"});
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
