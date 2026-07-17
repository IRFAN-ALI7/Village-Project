const express = require("express");
const {adminValidate} = require("../middlewares/Validation");
const wrapAsync = require("../utils/wrapAsync");
const { 
    registerAdmin,
    loginAdmin,
    getAllUsers,
    getAllComplaints,
    getRecentComplaints,
    updateStatus,
    deleteUser,
    updateUserByAdmin } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middlewares/protect");
const router = express.Router();

router.post("/register", adminValidate, wrapAsync(registerAdmin));
router.post("/login", wrapAsync(loginAdmin));
router.get("/users", protect, adminOnly, wrapAsync(getAllUsers));
router.get("/complaints", protect, adminOnly, wrapAsync(getAllComplaints));
router.get("/recent-complaints", protect, adminOnly, wrapAsync(getRecentComplaints));
router.put("/status-update/:id", protect, adminOnly, wrapAsync(updateStatus));
router.put("/users/:id", protect, adminOnly, wrapAsync(updateUserByAdmin));
router.delete("/users/:id", protect, adminOnly, wrapAsync(deleteUser));

module.exports = router;