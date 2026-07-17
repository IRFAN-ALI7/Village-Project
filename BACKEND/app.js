require('dotenv').config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const userRoutes = require("./routes/userRoutes");
const noticeRoutes = require("./routes/noticeRoute");
const certificateRoutes = require("./routes/certificateRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const cors = require("cors");
const port = process.env.PORT;
connectDB();
app.use(express.json());

// user Router
app.use(cors());

app.use("/admin", adminRoutes);
app.use("/",complaintRoutes);
app.use("/user" ,userRoutes);
app.use("/api", noticeRoutes);
app.use("/", certificateRoutes);
app.use("/schemes",schemeRoutes);
app.use("/dashboard", dashboardRoutes);

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