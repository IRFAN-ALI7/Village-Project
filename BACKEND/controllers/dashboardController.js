const Complaint = require("../models/Complaint");
const Scheme = require("../models/Scheme");
const Notice = require("../models/Notice");
const User = require("../models/User");

const getDashboard = async (req, res) => {
  const totalComplaints = await Complaint.countDocuments({
  userId: req.userId,
});

  const resolvedComplaints = await Complaint.countDocuments({
  userId: req.userId,
  status: "resolved",
});

  const myComplaints = await Complaint.countDocuments({
    userId: req.userId,
  });

  const activeSchemes = await Scheme.countDocuments({
    status: "active",
  });

  const totalNotices = await Notice.countDocuments();

  const registeredUsers = await User.countDocuments();

  res.status(200).json({
    totalComplaints,
    resolvedComplaints,
    myComplaints,
    activeSchemes,
    totalNotices,
    registeredUsers,
  });
};

module.exports = {
  getDashboard,
};