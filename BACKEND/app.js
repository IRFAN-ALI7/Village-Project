require('dotenv').config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");

//admin routes
const adminAuthRoutes = require("./routes/admin/authRoutes");
const adminCertificateRoutes = require("./routes/admin/certificateRoutes");
const adminComplaintRoutes = require("./routes/admin/complaintRoutes");
const adminDashboardRoutes = require("./routes/admin/dashboardRoutes");
const adminNoticeRoutes = require("./routes/admin/noticeRoute");
const adminSchemeRoutes = require("./routes/admin/schemeRoutes");
const adminUserRoutes = require("./routes/admin/userRoutes");

//user routes
const userAuthRoutes = require("./routes/user/authRoutes");
const userCertificateRoutes = require("./routes/user/certificateRoutes");
const userComplaintRoutes = require("./routes/user/complaintRoutes");
const userDashboardRoutes = require("./routes/user/dashboardRoutes");
const userSchemeRoutes = require("./routes/user/schemeRoutes");
const userNoticeRoutes = require("./routes/user/noticeRoutes");

//super-admin
const superAdminAuthRoutes = require("./routes/superAdmin/authRoutes");
const superAdminProfileRoutes = require("./routes/superAdmin/profileRoutes");
const superAdminAdminRoutes = require("./routes/superAdmin/adminRoutes");
const superAdminDashboardRoutes = require("./routes/superAdmin/dashboardRoutes");
const superAdminPanchayatRoutes = require("./routes/superAdmin/panchayatRoutes");
const superAdminNoticeRoutes = require("./routes/superAdmin/noticeRoutes");

const activityRoutes = require("./routes/activityRoute");
const locationRoutes = require("./routes/locationRoutes");

const cors = require("cors");
const port = process.env.PORT;
connectDB();
app.use(express.json());

// user Router
app.use(cors());

//admin
app.use("/admin", adminAuthRoutes);
app.use("/admin", adminCertificateRoutes);
app.use("/admin", adminComplaintRoutes);
app.use("/admin", adminDashboardRoutes);
app.use("/admin", adminNoticeRoutes);
app.use("/admin/schemes", adminSchemeRoutes);
app.use("/admin", adminUserRoutes);

//user
app.use("/user", userAuthRoutes);
app.use("/certificates", userCertificateRoutes);
app.use("/user", userComplaintRoutes);
app.use("/user/dashboard", userDashboardRoutes);
app.use("/user", userSchemeRoutes);
app.use("/user", userNoticeRoutes);

//super-admin
app.use("/super-admin", superAdminAuthRoutes);
app.use("/super-admin/profile", superAdminProfileRoutes);
app.use("/super-admin/admins", superAdminAdminRoutes);
app.use("/super-admin/dashboard",superAdminDashboardRoutes);
app.use("/super-admin/panchayats",superAdminPanchayatRoutes);
app.use("/super-admin/notices", superAdminNoticeRoutes);

app.use("/activity", activityRoutes);
app.use("/api/locations", locationRoutes);


app.use((err,req,res,next)=> {
    console.log(err.message);
    let message = err.message || "Something went wrong!";
    let statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: message,
    });
});

app.listen(port,()=> {
    console.log(`server is running on port ${port}`);
});