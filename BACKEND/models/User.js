const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { string } = require("joi");
const userSchema = new mongoose.Schema({
    name: String,
    mobile: {
        type: String,
        unique: true
    },
    email:{
        type: String,
        unique: true,
    },
    address: {
        type: String,
    },
    village: String,
    wardNo: Number,
    postOffice: String,
    policeStation: String,
    district: String,
    state: String,
    pincode: Number,
    password: String,
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, {timestamps: true});

userSchema.pre("save", async function(){

    if(!this.isModified("password")){
        return;
    }
    const hashedPassword = await bcrypt.hash(this.password,10);
    this.password = hashedPassword;
});

const User = mongoose.model("User", userSchema);
module.exports= User;