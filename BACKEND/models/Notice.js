const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    category: {
        type: String,
        enum: ["urgent", "meeting", "scheme", "service", "general"]
    },
    date: {
        type: Date,
    },
    time: {
        type: String,
    },
    location: {
        type: String,
    },
    validUpto: {
        type: Date,
    },
    description: {
        type: String,
    },
    fullDetails: {
        type: String,
    },
      isPinned: {
        type: Boolean,
        default: false
    },
}, {timestamps: true});

const Notice = mongoose.model("Notice", noticeSchema);
module.exports = Notice;