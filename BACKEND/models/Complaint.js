const { required, number } = require("joi");
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    complaintId: {
        type: String
    },
    complaintType: {
        type:String,
        required: true,
    },
    category: {
        type: String,
    },
    otherComplaint: {
        type: String
    },
    priority:{
        type: String,
        enum:["low", "medium", "high", "urgent"],
        default: "medium",
    },
    description: {
        type: String,
        required:true,
    },
    wardNo: {
        type: Number,
    },
    landmark: {
        type:String,
    },
    photos:[
        {
            type: String,
        }
    ],

    photoPublicIds: [
    {
        type: String,
    }
],

    status: {
        type:String,
        enum:["pending", "in-progress", "resolved", "rejected"],
        default: "pending",
    },
    statusReason: {
        type: String,
    },
    inProgressAt:{
        type: Date,
    },
    resolvedAt:{
        type: Date,
    },
    rejectedAt:{
        type: Date,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }

},{timestamps: true});


const Complaint = mongoose.model("Complaint", complaintSchema);
module.exports = Complaint;