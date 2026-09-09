const jwt = require("jsonwebtoken");
const SuperAdmin = require("../models/SuperAdmin");

const superAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin access required",
      });
    }

    const superAdmin = await SuperAdmin.findById(decoded.id).select(
      "-password"
    );

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    if (superAdmin.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Super Admin account is inactive",
      });
    }

    req.superAdmin = superAdmin;

    next();
  } catch (error) {
    console.error("Super Admin Auth Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = superAdminAuth;