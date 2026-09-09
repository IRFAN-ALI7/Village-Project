const User = require("../../models/User");
const expressError = require("../../utils/expressError");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");
const cloudinary = require("../../config/cloudinary");

const Activity = require("../../models/Activity");
const Certificate = require("../../models/Certificate");

const District = require("../../models/locations/District");
const SubDistrict = require("../../models/locations/SubDistrict");
const Panchayat = require("../../models/locations/Panchayat");
const Village = require("../../models/locations/Village");
const PanchayatVillage = require("../../models/locations/PanchayatVillage");
const Complaint = require("../../models/Complaint");


// OTP CONFIGURATION
const OTP_EXPIRY_MINUTES = 10;
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;


// Generate 6 digit OTP
const generateOtp = () => {
    return crypto
        .randomInt(100000, 1000000)
        .toString();
};


// Hash OTP using SHA-256
const hashOtp = (otp) => {
    return crypto
        .createHash("sha256")
        .update(otp.toString().trim())
        .digest("hex");
};


// Escape HTML
const escapeHtml = (value = "") => {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};


// OTP EMAIL
const sendOtpEmail = async ({
    email,
    name = "User",
    otp,
    purpose,
}) => {

    let purposeText = "email verification";

    if (purpose === "forgot-password") {
        purposeText = "password reset";
    }

    if (purpose === "email-change") {
        purposeText = "email change verification";
    }

    const safeName = escapeHtml(name);
    const safeOtp = escapeHtml(otp);

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0" />

    <title>Digital Village Project</title>
</head>

<body
    style="
        margin:0;
        padding:0;
        background:#f4f7fb;
        font-family:Arial,Helvetica,sans-serif;
        color:#1f2937;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="padding:30px 15px;"
>
<tr>
<td align="center">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
        max-width:600px;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 4px 18px rgba(0,0,0,0.08);
    "
>

<!-- HEADER -->

<tr>
<td
    style="
        background:#166534;
        padding:28px 25px;
        text-align:center;
        color:#ffffff;
    "
>

<h1
    style="
        margin:0;
        font-size:24px;
    "
>
    Digital Village Project
</h1>

<p
    style="
        margin:8px 0 0;
        font-size:14px;
        opacity:0.9;
    "
>
    Jharkhand
</p>

</td>
</tr>


<!-- BODY -->

<tr>
<td
    style="
        padding:35px 30px;
    "
>

<p
    style="
        margin:0 0 15px;
        font-size:16px;
    "
>
    Hello <strong>${safeName}</strong>,
</p>

<p
    style="
        margin:0 0 20px;
        line-height:1.6;
        font-size:15px;
    "
>
    Your OTP for ${purposeText} is:
</p>


<!-- OTP -->

<div
    style="
        text-align:center;
        margin:25px 0;
    "
>

<div
    style="
        display:inline-block;
        padding:15px 30px;
        background:#f0fdf4;
        border:2px dashed #16a34a;
        border-radius:10px;
        font-size:32px;
        font-weight:bold;
        letter-spacing:8px;
        color:#166534;
    "
>
    ${safeOtp}
</div>

</div>


<p
    style="
        text-align:center;
        margin:0 0 25px;
        font-size:14px;
        color:#6b7280;
    "
>
    This OTP is valid for
    <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
</p>


<div
    style="
        background:#fff7ed;
        border-left:4px solid #f97316;
        padding:15px;
        margin:20px 0;
        border-radius:5px;
    "
>

<p
    style="
        margin:0;
        font-size:13px;
        line-height:1.6;
        color:#7c2d12;
    "
>
    <strong>Security Notice:</strong>
    Never share this OTP with anyone.
    The Digital Village Project team will never ask
    you to share your OTP or password.
</p>

</div>


<p
    style="
        margin:25px 0 0;
        line-height:1.6;
        font-size:14px;
        color:#6b7280;
    "
>
    If you did not request this OTP, you can safely ignore
    this email.
</p>

</td>
</tr>


<!-- FOOTER -->

<tr>
<td
    style="
        background:#f9fafb;
        padding:20px 25px;
        text-align:center;
        border-top:1px solid #e5e7eb;
    "
>

<p
    style="
        margin:0;
        font-size:12px;
        color:#6b7280;
    "
>
    Digital Village Project, Jharkhand
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

    await sendEmail({
        to: email,
        subject: "Your OTP - Digital Village Project, Jharkhand",
        html,
    });
};


// ACCOUNT CREATED EMAIL
const sendAccountCreatedEmail = async (user) => {

    const safeName = escapeHtml(user.name);
    const safeEmail = escapeHtml(user.email);
    const safePanchayat = escapeHtml(user.panchayat);
    const safeVillage = escapeHtml(user.village);
    const safeSubDistrict = escapeHtml(user.subDistrict);
    const safeDistrict = escapeHtml(user.district);
    const safeState = escapeHtml(user.state);

    const html = `
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8" />
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0" />

    <title>Account Created</title>
</head>

<body
    style="
        margin:0;
        padding:0;
        background:#f4f7fb;
        font-family:Arial,Helvetica,sans-serif;
        color:#1f2937;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="padding:30px 15px;"
>

<tr>
<td align="center">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
        max-width:600px;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 4px 18px rgba(0,0,0,0.08);
    "
>

<!-- HEADER -->

<tr>
<td
    style="
        background:#166534;
        padding:28px 25px;
        text-align:center;
        color:#ffffff;
    "
>

<h1
    style="
        margin:0;
        font-size:24px;
    "
>
    Digital Village Project
</h1>

<p
    style="
        margin:8px 0 0;
        font-size:14px;
    "
>
    Jharkhand
</p>

</td>
</tr>


<!-- BODY -->

<tr>
<td style="padding:35px 30px;">

<h2
    style="
        margin:0 0 15px;
        color:#166534;
    "
>
    Account Created Successfully
</h2>


<p
    style="
        font-size:15px;
        line-height:1.6;
        margin:0 0 20px;
    "
>
    Hello <strong>${safeName}</strong>,
</p>


<p
    style="
        font-size:15px;
        line-height:1.6;
        margin:0 0 25px;
    "
>
    Your Digital Village Project account has been
    created successfully.
</p>


<!-- ACCOUNT DETAILS -->

<table
    width="100%"
    cellpadding="8"
    cellspacing="0"
    style="
        border-collapse:collapse;
        font-size:14px;
    "
>

<tr>
<td
    style="
        font-weight:bold;
        border-bottom:1px solid #e5e7eb;
    "
>
    Email
</td>

<td
    style="
        border-bottom:1px solid #e5e7eb;
    "
>
    ${safeEmail}
</td>
</tr>


<tr>
<td
    style="
        font-weight:bold;
        border-bottom:1px solid #e5e7eb;
    "
>
    Panchayat
</td>

<td
    style="
        border-bottom:1px solid #e5e7eb;
    "
>
    ${safePanchayat}
</td>
</tr>


<tr>
<td
    style="
        font-weight:bold;
        border-bottom:1px solid #e5e7eb;
    "
>
    Village
</td>

<td
    style="
        border-bottom:1px solid #e5e7eb;
    "
>
    ${safeVillage}
</td>
</tr>


<tr>
<td
    style="
        font-weight:bold;
        border-bottom:1px solid #e5e7eb;
    "
>
    Sub-District / Block
</td>

<td
    style="
        border-bottom:1px solid #e5e7eb;
    "
>
    ${safeSubDistrict}
</td>
</tr>


<tr>
<td
    style="
        font-weight:bold;
        border-bottom:1px solid #e5e7eb;
    "
>
    District
</td>

<td
    style="
        border-bottom:1px solid #e5e7eb;
    "
>
    ${safeDistrict}
</td>
</tr>


<tr>
<td
    style="
        font-weight:bold;
    "
>
    State
</td>

<td>
    ${safeState}
</td>
</tr>

</table>


<p
    style="
        margin:25px 0 0;
        font-size:14px;
        line-height:1.6;
        color:#6b7280;
    "
>
    You can now log in using your registered mobile number
    and password.
</p>

</td>
</tr>


<!-- FOOTER -->

<tr>
<td
    style="
        background:#f9fafb;
        padding:20px;
        text-align:center;
        border-top:1px solid #e5e7eb;
    "
>

<p
    style="
        margin:0;
        font-size:12px;
        color:#6b7280;
    "
>
    Digital Village Project, Jharkhand
</p>

</td>
</tr>

</table>

</td>
</tr>

</table>

</body>
</html>
`;

    await sendEmail({
        to: user.email,
        subject: "Account Created - Digital Village Project, Jharkhand",
        html,
    });
};


// USER REGISTRATION - REQUEST OTP
const requestRegistrationOtp = async (req, res) => {

    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
        throw new expressError(
            400,
            "Email is required"
        );
    }

    // Check existing user
    let user = await User.findOne({
        email,
    });

  
    // Already registered
    if (user && user.registrationStatus === "completed") {
        throw new expressError(
            400,
            "This email already registered!"
        );
    }

    // Existing pending registration
    if (user && user.registrationStatus === "pending") {

        // Resend cooldown
        if (
            user.emailOtpLastSentAt &&
            Date.now() - user.emailOtpLastSentAt.getTime() <
                OTP_RESEND_COOLDOWN_MS
        ) {
            const remainingSeconds = Math.ceil(
                (
                    OTP_RESEND_COOLDOWN_MS -
                    (Date.now() - user.emailOtpLastSentAt.getTime())
                ) / 1000
            );

            throw new expressError(
                429,
                `Please wait ${remainingSeconds} seconds before requesting another OTP.`
            );
        }

    } else {

        // Create pending User
        user = new User({
            email,
            emailVerified: false,

            registrationStatus: "pending",

            status: "inactive",
        });
    }

    // Generate OTP
    const otp = generateOtp();

    user.emailOtp = hashOtp(otp);

    user.emailOtpExpiresAt = new Date(
        Date.now() + OTP_EXPIRY_MS
    );

    user.emailOtpPurpose = "registration";

    user.emailOtpAttempts = 0;

    user.emailOtpLastSentAt = new Date();

    user.emailVerified = false;

    await user.save({
        validateBeforeSave: false,
    });

    // Send Email
    try {

        await sendOtpEmail({
            email,
            name: user.name || "User",
            otp,
            purpose: "registration",
        });

    } catch (error) {

        // Remove OTP if email failed
        user.emailOtp = null;
        user.emailOtpExpiresAt = null;
        user.emailOtpPurpose = null;
        user.emailOtpAttempts = 0;
        user.emailOtpLastSentAt = null;

        await user.save({
            validateBeforeSave: false,
        });

        throw new expressError(
            500,
            "Unable to send OTP email. Please try again."
        );
    }

    res.status(200).json({
        success: true,
        message:
            "OTP sent successfully to your email.",
    });
};


// USER REGISTRATION - VERIFY OTP
const verifyRegistrationOtp = async (req, res) => {

    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.toString().trim();

    if (!email) {
        throw new expressError(
            400,
            "Email is required"
        );
    }

    if (!otp) {
        throw new expressError(
            400,
            "OTP is required"
        );
    }

    if (!/^[0-9]{6}$/.test(otp)) {
        throw new expressError(
            400,
            "OTP must be 6 digits"
        );
    }

    const user = await User.findOne({
        email,
        registrationStatus: "pending",
        emailOtpPurpose: "registration",
    });

    if (!user) {
        throw new expressError(
            404,
            "Registration request not found. Please request a new OTP."
        );
    }

    // OTP expiry
    if (
        !user.emailOtpExpiresAt ||
        user.emailOtpExpiresAt.getTime() < Date.now()
    ) {

        user.emailOtp = null;
        user.emailOtpExpiresAt = null;
        user.emailOtpPurpose = null;
        user.emailOtpAttempts = 0;

        await user.save({
            validateBeforeSave: false,
        });

        throw new expressError(
            400,
            "OTP has expired. Please request a new OTP."
        );
    }

    // Max attempts
    if (user.emailOtpAttempts >= MAX_OTP_ATTEMPTS) {

        user.emailOtp = null;
        user.emailOtpExpiresAt = null;
        user.emailOtpPurpose = null;
        user.emailOtpAttempts = 0;

        await user.save({
            validateBeforeSave: false,
        });

        throw new expressError(
            429,
            "Maximum OTP attempts exceeded. Please request a new OTP."
        );
    }

    // Compare OTP
    const hashedOtp = hashOtp(otp);

    if (hashedOtp !== user.emailOtp) {

        user.emailOtpAttempts += 1;

        await user.save({
            validateBeforeSave: false,
        });

        const remainingAttempts =
            MAX_OTP_ATTEMPTS - user.emailOtpAttempts;

        if (remainingAttempts <= 0) {

            user.emailOtp = null;
            user.emailOtpExpiresAt = null;
            user.emailOtpPurpose = null;
            user.emailOtpAttempts = 0;

            await user.save({
                validateBeforeSave: false,
            });

            throw new expressError(
                429,
                "Maximum OTP attempts exceeded. Please request a new OTP."
            );
        }

        throw new expressError(
            400,
            `Invalid OTP. ${remainingAttempts} attempts remaining.`
        );
    }

    // OTP verified
    user.emailVerified = true;

    user.emailOtp = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpPurpose = null;
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = null;

    await user.save({
        validateBeforeSave: false,
    });

    res.status(200).json({
        success: true,
        message: "Email verified successfully.",
        emailVerified: true,
    });
};


// USER REGISTRATION - RESEND OTP
const resendRegistrationOtp = async (req, res) => {

    // Reuse requestRegistrationOtp
    return requestRegistrationOtp(req, res);
};


// USER REGISTRATION - CREATE ACCOUNT
const registerUser = async (req, res) => {

    const {
        mobile,
        email,
        state,
        district,
        subDistrict,
        panchayat,
        village,
    } = req.body;

    // Basic validation
    if (!mobile) {
        throw new expressError(
            400,
            "Mobile number is required"
        );
    }

    if (!email) {
        throw new expressError(
            400,
            "Email is required"
        );
    }

    if (
        !state ||
        !district ||
        !subDistrict ||
        !panchayat ||
        !village
    ) {
        throw new expressError(
            400,
            "Complete location details are required"
        );
    }


    // Convert location values
    const stateCode = Number(state);
    const districtCode = Number(district);
    const subDistrictCode = Number(subDistrict);
    const panchayatCode = Number(panchayat);
    const villageCode = Number(village);

    if (
        !Number.isInteger(stateCode) ||
        !Number.isInteger(districtCode) ||
        !Number.isInteger(subDistrictCode) ||
        !Number.isInteger(panchayatCode) ||
        !Number.isInteger(villageCode)
    ) {
        throw new expressError(
            400,
            "Invalid location information"
        );
    }

    // Verify District
    const districtData = await District.findOne({
        stateCode,
        districtCode,
    }).lean();

    if (!districtData) {
        throw new expressError(
            400,
            "Invalid district selected"
        );
    }

    // Verify Sub-District
    const subDistrictData = await SubDistrict.findOne({
        stateCode,
        districtCode,
        subDistrictCode,
    }).lean();

    if (!subDistrictData) {
        throw new expressError(
            400,
            "Invalid sub-district selected"
        );
    }

    // Verify Panchayat
    const panchayatData = await Panchayat.findOne({
        stateCode,
        panchayatCode,
    }).lean();

    if (!panchayatData) {
        throw new expressError(
            400,
            "Invalid panchayat selected"
        );
    }

    // Verify Village
    const villageData = await Village.findOne({
        stateCode,
        districtCode,
        subDistrictCode,
        villageCode,
    }).lean();

    if (!villageData) {
        throw new expressError(
            400,
            "Invalid village selected"
        );
    }

    // Verify Village -> Panchayat
    const villageMapping = await PanchayatVillage.findOne({
        subDistrictCode,
        panchayatCode,
        villageCode,
    }).lean();

    if (!villageMapping) {
        throw new expressError(
            400,
            "Selected village does not belong to the selected panchayat"
        );
    }

    // Normalize email
    const normalizedEmail =
        email.trim().toLowerCase();

  
    // Find pending registration
    const user = await User.findOne({
        email: normalizedEmail,
    });

    if (!user) {
        throw new expressError(
            400,
            "Please verify your email before creating your account."
        );
    }


    // Email verification check
    if (!user.emailVerified) {
        throw new expressError(
            400,
            "Please verify your email to create your account."
        );
    }

    // Registration status
    if (user.registrationStatus === "completed") {
        throw new expressError(
            400,
            "This email already registered!"
        );
    }

    // Check mobile
    const existingMobileUser = await User.findOne({
        mobile,
        _id: {
            $ne: user._id,
        },
    });

    if (existingMobileUser) {
        throw new expressError(
            400,
            "Mobile already registered!"
        );
    }

    // Fill User
    user.name = req.body.name;

    user.mobile = mobile;

    user.address = req.body.address;

    // State
    user.state = "Jharkhand";
    user.stateCode = stateCode;

    // District
    user.district = districtData.districtName;
    user.districtCode = districtCode;

    // Sub-District
    user.subDistrict =
        subDistrictData.subDistrictName;

    user.subDistrictCode =
        subDistrictCode;

    // Panchayat
    user.panchayat =
        panchayatData.panchayatName;

    user.panchayatCode =
        panchayatCode;

    // Village
    user.village =
        villageData.villageName;

    user.villageCode =
        villageCode;

    // Other details
    user.pincode = req.body.pincode;
    user.postOffice = req.body.postOffice;
    user.policeStation = req.body.policeStation;

    // Password
    user.password = req.body.password;

    // Registration completed
    user.registrationStatus = "completed";

    user.status = "active";

    // Profile image
    if (req.file) {
        user.profileImage = req.file.path;
        user.profileImagePublicId = req.file.filename;
    }

    await user.save();

    // User Activity
    await Activity.create({
        user: user._id,

        panchayat: user.panchayat,
        panchayatCode: user.panchayatCode,

        audience: "user",
        createdBy: "user",

        type: "REGISTERED",

        title: "Registration Successful",

        description:
            "Your account has been created successfully.",

        route: "/dashboard",

        isNotification: true,
        isRead: false,

        priority: "low",
        status: "completed",
    });

    // Admin Activity
    await Activity.create({
        user: user._id,

        panchayat: user.panchayat,
        panchayatCode: user.panchayatCode,

        audience: "admin",
        createdBy: "user",

        type: "REGISTERED",

        title: "New User Registered",

        description:
            `${user.name} has registered successfully.`,

        route: "/admin/users",

        isNotification: true,
        isRead: false,

        priority: "low",
        status: "completed",
    });

    // Account Created Email
    try {

        await sendAccountCreatedEmail(user);
    } catch (error) {
        console.error(
            "Account created email failed:",
            error
        );
    }

    // JWT
    const token = jwt.sign(
        {
            id: user._id,
            role: "user",
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );

    // Response
    res.status(201).json({
        success: true,
        message:
            "User registered successfully!",
        token,
    });
};

// USER LOGIN
const loginUser = async (req, res) => {

    const {
        mobile,
        password,
    } = req.body;

    const user = await User.findOne({
        mobile,
    });

    if (!user) {
        throw new expressError(
            404,
            "invalid phone number!"
        );
    }

    // Pending account protection
    if (
        user.registrationStatus !== "completed" ||
        user.status !== "active"
    ) {
        throw new expressError(
            403,
            "Your account is inactive. Please contact your Panchayat administrator."
        );
    }

    // Password
    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        throw new expressError(
            404,
            "wrong password!"
        );
    }

    // Activity
    await Activity.create({
        user: user._id,

        panchayat: user.panchayat,
        panchayatCode: user.panchayatCode,

        audience: "user",
        createdBy: "user",

        type: "LOGIN",

        title: "Login Successful",

        description:
            "You logged into your account.",

        route: "/dashboard",

        isNotification: false,
        isRead: true,

        priority: "low",
        status: "completed",
    });

 
    // JWT
    const token = jwt.sign(
        {
            id: user._id,
            role: "user",
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );

    res.json({
        success: true,
        message: "Login successful",
        token,
    });
};


// GET PROFILE
const getProfile = async (req, res) => {

    const user = await User.findById(req.userId)
        .select("-password -emailOtp");

    if (!user) {
        throw new expressError(
            404,
            "User not found"
        );
    }

    res.status(200).json({
        success: true,
        data: user,
    });
};


// GET CURRENT USER
const getCurrUser = async (req, res) => {

    const user = await User.findById(req.userId)
        .select("-password -emailOtp");

    if (!user) {
        throw new expressError(
            404,
            "User not found"
        );
    }

    res.json(user);
};


// UPDATE USER
const updateUsers = async (req, res) => {

    const user = await User.findById(
        req.userId
    );

    if (!user) {
        throw new expressError(
            404,
            "User not found"
        );
    }


    // Profile image
   if (req.file) {
    // Delete old image from Cloudinary
    if (user.profileImagePublicId) {
        await cloudinary.uploader.destroy(
            user.profileImagePublicId
        );
    }

    // Save new image details
    req.body.profileImage = req.file.path;
    req.body.profileImagePublicId = req.file.filename;
}

    
    // LOCATION FIELDS MUST NEVER BE EDITABLE
    delete req.body.state;
    delete req.body.stateCode;

    delete req.body.district;
    delete req.body.districtCode;

    delete req.body.subDistrict;
    delete req.body.subDistrictCode;

    delete req.body.panchayat;
    delete req.body.panchayatCode;

    delete req.body.village;
    delete req.body.villageCode;

    // EMAIL CHANGE PROTECTION
    if (
        req.body.email !== undefined
    ) {

        const newEmail =
            req.body.email
                ?.trim()
                .toLowerCase();

        if (!newEmail) {
            throw new expressError(
                400,
                "Email is required"
            );
        }

        // Email unchanged
        if (newEmail === user.email) {

            delete req.body.email;

        } else {

            // Email must be changed through
            // request-email-change endpoint.

            delete req.body.email;

            throw new expressError(
                400,
                "Please verify the new email before changing your email."
            );
        }
    }

    // Password must not be changed here
    delete req.body.password;

    // Protected fields
    delete req.body.emailVerified;
    delete req.body.emailOtp;
    delete req.body.emailOtpExpiresAt;
    delete req.body.emailOtpPurpose;
    delete req.body.emailOtpAttempts;
    delete req.body.emailOtpLastSentAt;

    delete req.body.pendingEmail;
    delete req.body.pendingEmailVerified;

    delete req.body.registrationStatus;
    delete req.body.status;

    // Update fields manually
    Object.keys(req.body).forEach((key) => {
        user[key] = req.body[key];
    });

    await user.save();

    // Activity
    await Activity.create({
        user: req.userId,

        panchayat: user.panchayat,
        panchayatCode: user.panchayatCode,

        audience: "user",
        createdBy: "user",

        type: "PROFILE_UPDATED",

        title: "Profile Updated",

        description:
            "Your profile information has been updated.",

        route: "/profile",

        isNotification: false,
        isRead: true,

        priority: "low",
        status: "completed",
    });

    res.json(
        await User.findById(user._id)
            .select("-password -emailOtp")
    );
};


// REQUEST EMAIL CHANGE
const requestEmailChange = async (req, res) => {

    const newEmail =
        req.body.email
            ?.trim()
            .toLowerCase();

    if (!newEmail) {
        throw new expressError(
            400,
            "New email is required"
        );
    }

    const user = await User.findById(
        req.userId
    );

    if (!user) {
        throw new expressError(
            404,
            "User not found"
        );
    }

    // Same email
    if (newEmail === user.email) {
        throw new expressError(
            400,
            "This is already your current email."
        );
    }

    // Check email uniqueness
    const existingUser = await User.findOne({
        email: newEmail,
        _id: {
            $ne: user._id,
        },
    });

    if (existingUser) {
        throw new expressError(
            400,
            "This email already registered!"
        );
    }

   
    // Resend cooldown
    if (
        user.emailOtpPurpose === "email-change" &&
        user.emailOtpLastSentAt &&
        Date.now() - user.emailOtpLastSentAt.getTime() <
            OTP_RESEND_COOLDOWN_MS
    ) {

        const remainingSeconds = Math.ceil(
            (
                OTP_RESEND_COOLDOWN_MS -
                (
                    Date.now() -
                    user.emailOtpLastSentAt.getTime()
                )
            ) / 1000
        );

        throw new expressError(
            429,
            `Please wait ${remainingSeconds} seconds before requesting another OTP.`
        );
    }


    // Generate OTP
    const otp = generateOtp();
    user.pendingEmail = newEmail;
    user.pendingEmailVerified = false;
    user.emailOtp = hashOtp(otp);
    user.emailOtpExpiresAt = new Date(
        Date.now() + OTP_EXPIRY_MS
    );
    user.emailOtpPurpose = "email-change";
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = new Date();
    await user.save();

    // Send OTP
    try {

        await sendOtpEmail({
            email: newEmail,
            name: user.name,
            otp,
            purpose: "email-change",
        });

    } catch (error) {

        user.emailOtp = null;
        user.emailOtpExpiresAt = null;
        user.emailOtpPurpose = null;
        user.emailOtpAttempts = 0;
        user.emailOtpLastSentAt = null;

        await user.save();

        throw new expressError(
            500,
            "Unable to send OTP email. Please try again."
        );
    }

    res.status(200).json({
        success: true,
        message:
            "OTP sent to your new email address.",
    });
};


// VERIFY EMAIL CHANGE
const verifyEmailChange = async (req, res) => {

    const otp = req.body.otp
        ?.toString()
        .trim();

    if (!otp) {
        throw new expressError(
            400,
            "OTP is required"
        );
    }

    if (!/^[0-9]{6}$/.test(otp)) {
        throw new expressError(
            400,
            "OTP must be 6 digits"
        );
    }

    const user = await User.findById(
        req.userId
    );

    if (!user) {
        throw new expressError(
            404,
            "User not found"
        );
    }

    if (
        !user.pendingEmail ||
        user.emailOtpPurpose !== "email-change"
    ) {
        throw new expressError(
            400,
            "No email change request found."
        );
    }

    // Expiry
    if (
        !user.emailOtpExpiresAt ||
        user.emailOtpExpiresAt.getTime() < Date.now()
    ) {

        user.emailOtp = null;
        user.emailOtpExpiresAt = null;
        user.emailOtpPurpose = null;
        user.emailOtpAttempts = 0;

        await user.save();

        throw new expressError(
            400,
            "OTP has expired. Please request a new OTP."
        );
    }

    // Attempts
    if (
        user.emailOtpAttempts >= MAX_OTP_ATTEMPTS
    ) {

        user.emailOtp = null;
        user.emailOtpExpiresAt = null;
        user.emailOtpPurpose = null;
        user.emailOtpAttempts = 0;

        await user.save();

        throw new expressError(
            429,
            "Maximum OTP attempts exceeded. Please request a new OTP."
        );
    }


    // Compare
    const hashedOtp = hashOtp(otp);

    if (hashedOtp !== user.emailOtp) {

        user.emailOtpAttempts += 1;

        await user.save();

        const remainingAttempts =
            MAX_OTP_ATTEMPTS -
            user.emailOtpAttempts;

        if (remainingAttempts <= 0) {

            user.emailOtp = null;
            user.emailOtpExpiresAt = null;
            user.emailOtpPurpose = null;
            user.emailOtpAttempts = 0;

            await user.save();

            throw new expressError(
                429,
                "Maximum OTP attempts exceeded. Please request a new OTP."
            );
        }

        throw new expressError(
            400,
            `Invalid OTP. ${remainingAttempts} attempts remaining.`
        );
    }


    // Check race / duplicate email
    const existingUser = await User.findOne({
        email: user.pendingEmail,
        _id: {
            $ne: user._id,
        },
    });

    if (existingUser) {
        throw new expressError(
            400,
            "This email has already been registered by another user."
        );
    }


    // Change actual email
    user.email = user.pendingEmail;
    user.emailVerified = true;
    user.pendingEmail = null;
    user.pendingEmailVerified = false;
    user.emailOtp = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpPurpose = null;
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = null;

    await user.save();

    res.status(200).json({
        success: true,
        message:
            "Email changed successfully.",
        email: user.email,
    });
};


// DELETE USER
const deleteUsers = async (req, res) => {

    const user = await User.findById(
        req.userId
    );

    if (!user) {
        throw new expressError(
            404,
            "User not found"
        );
    }

  
    // Admin notification
    await Activity.create({
        audience: "admin",
        createdBy: "user",

        user: user._id,

        panchayat: user.panchayat,
        panchayatCode: user.panchayatCode,

        type: "ACCOUNT_DELETED",

        title: "User Account Deleted",

        description:
            `${user.name} has permanently deleted the account.`,

        route: "/admin/users",

        isNotification: true,
        isRead: false,

        priority: "high",
        status: "completed",
    });

    
    // Delete user's complaints
    await Complaint.deleteMany({
        userId: req.userId,
    });


    // Delete user's certificates
    await Certificate.deleteMany({
        userId: req.userId,
    });

    // Delete user's profile image from Cloudinary
      if (user.profileImagePublicId) {
       await cloudinary.uploader.destroy(
        user.profileImagePublicId
      );
   }


    // Delete user account
    await User.findByIdAndDelete(
        req.userId
    );

    res.json({
        success: true,
        message:
            "Account deleted successfully!",
    });
};


// CHANGE PASSWORD
const changePassword = async (req, res) => {

    const {
        currentPassword,
        newPassword,
    } = req.body;

    if (!currentPassword) {
        throw new expressError(
            400,
            "Current password is required"
        );
    }

    if (!newPassword) {
        throw new expressError(
            400,
            "New password is required"
        );
    }

    if (newPassword.length < 6) {
        throw new expressError(
            400,
            "Password must be at least 6 characters"
        );
    }

    const user = await User.findById(
        req.userId
    );

    if (!user) {
        throw new expressError(
            404,
            "User not found"
        );
    }

    const isMatch = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isMatch) {
        throw new expressError(
            400,
            "Current password is wrong"
        );
    }

    user.password = newPassword;

    await user.save();

    // Activity
    await Activity.create({
        user: user._id,

        panchayat: user.panchayat,
        panchayatCode: user.panchayatCode,

        audience: "user",
        createdBy: "user",

        type: "PASSWORD_CHANGED",

        title: "Password Changed",

        description:
            "Your account password has been changed.",

        route: "/profile",

        isNotification: true,
        isRead: false,

        priority: "high",
        status: "completed",
    });

    res.status(200).json({
        success: true,
        message:
            "Password changed successfully!",
    });
};


// FORGOT PASSWORD - REQUEST OTP
const forgotPassword = async (req, res) => {

    const email =
        req.body.email
            ?.trim()
            .toLowerCase();

    if (!email) {
        throw new expressError(
            400,
            "Email is required"
        );
    }

    const user = await User.findOne({
        email,
        registrationStatus: "completed",
    });

    if (!user) {
        throw new expressError(
            404,
            "User not found"
        );
    }

    
    // Resend cooldown
    if (
        user.emailOtpPurpose === "forgot-password" &&
        user.emailOtpLastSentAt &&
        Date.now() - user.emailOtpLastSentAt.getTime() <
            OTP_RESEND_COOLDOWN_MS
    ) {

        const remainingSeconds = Math.ceil(
            (
                OTP_RESEND_COOLDOWN_MS -
                (
                    Date.now() -
                    user.emailOtpLastSentAt.getTime()
                )
            ) / 1000
        );

        throw new expressError(
            429,
            `Please wait ${remainingSeconds} seconds before requesting another OTP.`
        );
    }

 
    // Generate OTP
    const otp = generateOtp();
    user.emailOtp = hashOtp(otp);

    user.emailOtpExpiresAt = new Date(
        Date.now() + OTP_EXPIRY_MS
    );

    user.emailOtpPurpose = "forgot-password";
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = new Date();
    await user.save();


    // Send email
    try {

        await sendOtpEmail({
            email: user.email,
            name: user.name,
            otp,
            purpose: "forgot-password",
        });

    } catch (error) {

        user.emailOtp = null;
        user.emailOtpExpiresAt = null;
        user.emailOtpPurpose = null;
        user.emailOtpAttempts = 0;
        user.emailOtpLastSentAt = null;

        await user.save();

        throw new expressError(
            500,
            "Unable to send OTP email. Please try again."
        );
    }

    res.status(200).json({
        success: true,
        message:
            "Password reset OTP sent successfully.",
    });
};


// FORGOT PASSWORD - VERIFY OTP
const verifyForgotPasswordOtp = async (req, res) => {

    const email =
        req.body.email
            ?.trim()
            .toLowerCase();

    const otp = req.body.otp
        ?.toString()
        .trim();

    if (!email) {
        throw new expressError(
            400,
            "Email is required"
        );
    }

    if (!otp) {
        throw new expressError(
            400,
            "OTP is required"
        );
    }

    if (!/^[0-9]{6}$/.test(otp)) {
        throw new expressError(
            400,
            "OTP must be 6 digits"
        );
    }

    const user = await User.findOne({
        email,
        registrationStatus: "completed",
        emailOtpPurpose: "forgot-password",
    });

    if (!user) {
        throw new expressError(
            404,
            "Password reset request not found."
        );
    }


    // Expiry
    if (
        !user.emailOtpExpiresAt ||
        user.emailOtpExpiresAt.getTime() < Date.now()
    ) {

        user.emailOtp = null;
        user.emailOtpExpiresAt = null;
        user.emailOtpPurpose = null;
        user.emailOtpAttempts = 0;

        await user.save();

        throw new expressError(
            400,
            "OTP has expired. Please request a new OTP."
        );
    }

    // Attempts
    if (
        user.emailOtpAttempts >= MAX_OTP_ATTEMPTS
    ) {

        user.emailOtp = null;
        user.emailOtpExpiresAt = null;
        user.emailOtpPurpose = null;
        user.emailOtpAttempts = 0;

        await user.save();

        throw new expressError(
            429,
            "Maximum OTP attempts exceeded. Please request a new OTP."
        );
    }

    
    // Compare OTP
    const hashedOtp = hashOtp(otp);

    if (hashedOtp !== user.emailOtp) {

        user.emailOtpAttempts += 1;

        await user.save();

        const remainingAttempts =
            MAX_OTP_ATTEMPTS -
            user.emailOtpAttempts;

        if (remainingAttempts <= 0) {

            user.emailOtp = null;
            user.emailOtpExpiresAt = null;
            user.emailOtpPurpose = null;
            user.emailOtpAttempts = 0;

            await user.save();

            throw new expressError(
                429,
                "Maximum OTP attempts exceeded. Please request a new OTP."
            );
        }

        throw new expressError(
            400,
            `Invalid OTP. ${remainingAttempts} attempts remaining.`
        );
    }

    // Clear OTP
    user.emailOtp = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpPurpose = null;
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = null;

    await user.save();


    // Generate short-lived reset token
    const resetToken = jwt.sign(
        {
            id: user._id,
            purpose: "user-password-reset",
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "10m",
        }
    );

    res.status(200).json({
        success: true,
        message:
            "OTP verified successfully.",
        resetToken,
    });
};


// FORGOT PASSWORD - RESET PASSWORD
const resetPassword = async (req, res) => {

    const {
        resetToken,
        newPassword,
        confirmPassword,
    } = req.body;

    if (!resetToken) {
        throw new expressError(
            400,
            "Password reset token is required"
        );
    }

    if (!newPassword) {
        throw new expressError(
            400,
            "New password is required"
        );
    }

    if (!confirmPassword) {
        throw new expressError(
            400,
            "Confirm password is required"
        );
    }

    if (newPassword.length < 6) {
        throw new expressError(
            400,
            "Password must be at least 6 characters"
        );
    }

    if (newPassword !== confirmPassword) {
        throw new expressError(
            400,
            "Passwords do not match"
        );
    }

    // Verify reset token
    // ----------------------------------------------------------
    let decoded;

    try {

        decoded = jwt.verify(
            resetToken,
            process.env.JWT_SECRET
        );

    } catch (error) {

        throw new expressError(
            401,
            "Invalid or expired password reset token"
        );
    }

    if (
        decoded.purpose !==
        "user-password-reset"
    ) {
        throw new expressError(
            401,
            "Invalid password reset token"
        );
    }

    
    // Find user
    // ----------------------------------------------------------
    const user = await User.findById(
        decoded.id
    );

    if (!user) {
        throw new expressError(
            404,
            "User not found"
        );
    }

    
    // Set new password
    user.password = newPassword;

    await user.save();

    // Activity
    await Activity.create({
        user: user._id,
        panchayat: user.panchayat,
        panchayatCode: user.panchayatCode,
        audience: "user",
        createdBy: "user",
        type: "PASSWORD_CHANGED",
        title: "Password Reset Successfully",
        description:
            "Your account password has been reset successfully.",
        route: "/profile",
        isNotification: true,
        isRead: false,
        priority: "high",
        status: "completed",
    });

    res.status(200).json({
        success: true,
        message:
            "Password reset successfully!",
    });
};

// EXPORTS
module.exports = {
    registerUser,

    requestRegistrationOtp,
    verifyRegistrationOtp,
    resendRegistrationOtp,

    loginUser,
    getProfile,
    getCurrUser,
    updateUsers,

    requestEmailChange,
    verifyEmailChange,

    deleteUsers,
    changePassword,

    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword,
};