const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
}, {timestamps: true});

adminSchema.pre("save", async function(){
    if(!this.isModified("password")){
        return;
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
});


const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;