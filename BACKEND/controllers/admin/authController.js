const Admin = require("../../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");
const cloudinary = require("../../config/cloudinary");


// COMMON OTP HELPERS
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp.toString().trim())
    .digest("hex");
};

// Escape HTML values before putting database values into email HTML
const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};


// PROFESSIONAL OTP EMAIL TEMPLATE
const buildOtpEmail = ({
  admin,
  otp,
  title,
  message,
  purpose,
}) => {
  const adminName = escapeHtml(admin.name);
  const panchayat = escapeHtml(admin.panchayat || "Assigned Panchayat");
  const district = escapeHtml(admin.district || "Jharkhand");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f3f6f9;
  font-family:Arial,Helvetica,sans-serif;
  color:#1f2937;
">

  <div style="
    width:100%;
    padding:35px 15px;
    box-sizing:border-box;
  ">

    <div style="
      max-width:620px;
      margin:0 auto;
      background:#ffffff;
      border-radius:18px;
      overflow:hidden;
      box-shadow:0 8px 30px rgba(0,0,0,0.08);
    ">

      <!-- HEADER -->
      <div style="
        background:linear-gradient(135deg,#059669,#2563eb);
        padding:28px 25px;
        text-align:center;
        color:#ffffff;
      ">

        <div style="
          font-size:27px;
          font-weight:700;
          letter-spacing:0.3px;
        ">
          Digital Village
        </div>

        <div style="
          margin-top:6px;
          font-size:14px;
          opacity:0.95;
        ">
          Project, Jharkhand
        </div>

      </div>

      <!-- CONTENT -->
      <div style="padding:35px 32px;">

        <div style="
          font-size:22px;
          font-weight:700;
          color:#111827;
          margin-bottom:8px;
        ">
          ${escapeHtml(title)}
        </div>

        <div style="
          font-size:14px;
          color:#6b7280;
          margin-bottom:25px;
        ">
          Secure verification for your Admin account
        </div>

        <p style="
          margin:0 0 10px;
          font-size:16px;
          color:#111827;
        ">
          Hello <strong>${adminName}</strong>,
        </p>

        <p style="
          margin:0 0 22px;
          font-size:15px;
          line-height:1.7;
          color:#4b5563;
        ">
          ${message}
        </p>

        <!-- ADMIN INFO -->
        <div style="
          background:#f8fafc;
          border:1px solid #e5e7eb;
          border-radius:12px;
          padding:16px 18px;
          margin-bottom:25px;
        ">

          <div style="
            font-size:13px;
            color:#6b7280;
            margin-bottom:5px;
          ">
            Admin Account
          </div>

          <div style="
            font-size:15px;
            font-weight:700;
            color:#111827;
          ">
            ${adminName}
          </div>

          <div style="
            margin-top:7px;
            font-size:13px;
            color:#6b7280;
          ">
            Panchayat: <strong style="color:#374151;">
              ${panchayat}
            </strong>
          </div>

          <div style="
            margin-top:4px;
            font-size:13px;
            color:#6b7280;
          ">
            District: <strong style="color:#374151;">
              ${district}
            </strong>
          </div>

        </div>

        <!-- OTP BOX -->
        <div style="
          text-align:center;
          background:#eff6ff;
          border:1px solid #bfdbfe;
          border-radius:14px;
          padding:24px 15px;
          margin-bottom:24px;
        ">

          <div style="
            font-size:12px;
            text-transform:uppercase;
            letter-spacing:2px;
            color:#64748b;
            margin-bottom:10px;
          ">
            Verification OTP
          </div>

          <div style="
            font-size:36px;
            line-height:1;
            font-weight:800;
            letter-spacing:9px;
            color:#1d4ed8;
            padding-left:9px;
          ">
            ${otp}
          </div>

          <div style="
            margin-top:13px;
            font-size:13px;
            color:#64748b;
          ">
            Valid for <strong>10 minutes</strong>
          </div>

        </div>

        <!-- SECURITY NOTE -->
        <div style="
          background:#fff7ed;
          border-left:4px solid #f97316;
          padding:13px 15px;
          border-radius:8px;
          margin-bottom:25px;
        ">

          <div style="
            font-size:13px;
            line-height:1.6;
            color:#7c2d12;
          ">
            <strong>Security notice:</strong>
            Never share this OTP with anyone. Digital Village Project
            officials will never ask you to disclose your OTP.
          </div>

        </div>

        <p style="
          margin:0;
          font-size:14px;
          line-height:1.6;
          color:#6b7280;
        ">
          If you did not request this action, you can safely ignore this
          email. Your account will remain secure.
        </p>

      </div>

      <!-- FOOTER -->
      <div style="
        background:#f8fafc;
        border-top:1px solid #e5e7eb;
        padding:20px 25px;
        text-align:center;
      ">

        <div style="
          font-size:13px;
          font-weight:700;
          color:#374151;
        ">
          Digital Village Project, Jharkhand
        </div>

        <div style="
          margin-top:6px;
          font-size:12px;
          color:#9ca3af;
        ">
          This is an automated security email. Please do not reply.
        </div>

      </div>

    </div>

  </div>

</body>
</html>
  `;
};

// CREATE JWT TOKEN
const createAdminToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      role: "admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};


// ADMIN LOGIN - EMAIL OR PHONE + PASSWORD
const loginAdmin = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or phone and password are required",
      });
    }

    const admin = await Admin.findOne(
      email
        ? { email: email.toLowerCase().trim() }
        : { phone: phone.trim() }
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    if (admin.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your administrator account is currently inactive. Please contact the Super Admin for assistance.",
      });
    }

    const isPasswordMatch = await admin.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = createAdminToken(admin);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        profilePhoto: admin.profilePhoto,

        state: admin.state,
        stateCode: admin.stateCode,

        district: admin.district,
        districtCode: admin.districtCode,

        subDistrict: admin.subDistrict,
        subDistrictCode: admin.subDistrictCode,

        panchayat: admin.panchayat,
        panchayatCode: admin.panchayatCode,

        role: admin.role,
        status: admin.status,
        emailVerified: admin.emailVerified,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



//  REQUEST LOGIN OTP, EMAIL + OTP LOGIN
const requestLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({
      email: cleanEmail,
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "No Admin account found with this email",
      });
    }

    if (admin.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your administrator account is currently inactive. Please contact the Super Admin for assistance.",
      });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    admin.loginOtpHash = otpHash;
    admin.loginOtpExpiresAt = otpExpiresAt;

    await admin.save();

    await sendEmail({
      to: cleanEmail,
      subject: "Digital Village Admin - Login Verification OTP",
      html: buildOtpEmail({
        admin,
        otp,
        title: "Login Verification",
        message:
          "We received a request to sign in to your Digital Village Admin account using email OTP. Use the verification code below to securely continue.",
        purpose: "login",
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Login OTP sent successfully to your email address",
    });
  } catch (error) {
    console.error("Request Login OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send login OTP",
    });
  }
};


// LOGIN WITH OTP
const loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({
      email: cleanEmail,
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    if (admin.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your administrator account is currently inactive. Please contact the Super Admin for assistance.",
      });
    }

    if (!admin.loginOtpHash || !admin.loginOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired",
      });
    }

    if (new Date() > admin.loginOtpExpiresAt) {
      admin.loginOtpHash = null;
      admin.loginOtpExpiresAt = null;

      await admin.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    const otpHash = hashOtp(otp);

    if (otpHash !== admin.loginOtpHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP successful
    admin.loginOtpHash = null;
    admin.loginOtpExpiresAt = null;
    admin.emailVerified = true;
    admin.lastLogin = new Date();

    await admin.save();

    const token = createAdminToken(admin);

    return res.status(200).json({
      success: true,
      message: "OTP verified. Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        profilePhoto: admin.profilePhoto,

        state: admin.state,
        stateCode: admin.stateCode,

        district: admin.district,
        districtCode: admin.districtCode,

        subDistrict: admin.subDistrict,
        subDistrictCode: admin.subDistrictCode,

        panchayat: admin.panchayat,
        panchayatCode: admin.panchayatCode,

        role: admin.role,
        status: admin.status,
        emailVerified: admin.emailVerified,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Login With OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify login OTP",
    });
  }
};


// GET ADMIN PROFILE
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin profile fetched successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        profilePhoto: admin.profilePhoto,

        state: admin.state,
        stateCode: admin.stateCode,

        district: admin.district,
        districtCode: admin.districtCode,

        subDistrict: admin.subDistrict,
        subDistrictCode: admin.subDistrictCode,

        panchayat: admin.panchayat,
        panchayatCode: admin.panchayatCode,

        role: admin.role,
        status: admin.status,
        emailVerified: admin.emailVerified,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Get Admin Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// UPDATE ADMIN PROFILE
const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const { email, phone } = req.body;

    // NAME CANNOT BE CHANGED
    if (req.body.name !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be changed",
      });
    }
    
    //  EMAIL CHANGE ,OTP verification required.
    if (email !== undefined) {
      const cleanEmail = email.toLowerCase().trim();

      if (!cleanEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      if (cleanEmail !== admin.email) {
        return res.status(400).json({
          success: false,
          message:
            "Email cannot be changed directly. Please use email verification.",
        });
      }
    }

    // UPDATE PHONE
    if (phone !== undefined) {
      const cleanPhone = phone.trim();

      if (!cleanPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number is required",
        });
      }

      const existingPhone = await Admin.findOne({
        phone: cleanPhone,
        _id: { $ne: admin._id },
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone number is already registered",
        });
      }

      admin.phone = cleanPhone;
    }

   // UPDATE PROFILE PHOTO
if (req.file) {
  if (admin.profilePhotoPublicId) {
    await cloudinary.uploader.destroy(
      admin.profilePhotoPublicId
    );
  }

  admin.profilePhoto = req.file.path;
  admin.profilePhotoPublicId = req.file.filename;
}

    // LOCATION / ROLE / STATUS CANNOT BE CHANGED
    await admin.save();
    const updatedAdmin = await Admin.findById(admin._id).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        phone: updatedAdmin.phone,
        profilePhoto: updatedAdmin.profilePhoto,

        state: updatedAdmin.state,
        stateCode: updatedAdmin.stateCode,

        district: updatedAdmin.district,
        districtCode: updatedAdmin.districtCode,

        subDistrict: updatedAdmin.subDistrict,
        subDistrictCode: updatedAdmin.subDistrictCode,

        panchayat: updatedAdmin.panchayat,
        panchayatCode: updatedAdmin.panchayatCode,

        role: updatedAdmin.role,
        status: updatedAdmin.status,
        emailVerified: updatedAdmin.emailVerified,
        createdAt: updatedAdmin.createdAt,
        lastLogin: updatedAdmin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Update Admin Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//  REQUEST EMAIL CHANGE ,SEND OTP TO NEW EMAIL
const requestEmailChange = async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "New email is required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "New email is required",
      });
    }

    if (cleanEmail === admin.email) {
      return res.status(400).json({
        success: false,
        message: "New email is same as current email",
      });
    }

    const existingEmail = await Admin.findOne({
      email: cleanEmail,
      _id: { $ne: admin._id },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    admin.pendingEmail = cleanEmail;
    admin.emailChangeOtpHash = otpHash;
    admin.emailChangeOtpExpiresAt = otpExpiresAt;

    await admin.save();

    await sendEmail({
      to: cleanEmail,
      subject: "Digital Village Admin - Email Verification OTP",
      html: buildOtpEmail({
        admin,
        otp,
        title: "Verify New Email Address",
        message:
          "A request was made to change the email address associated with your Digital Village Admin account. Enter this OTP in your Settings to verify your new email address.",
        purpose: "email-change",
      }),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your new email address",
    });
  } catch (error) {
    console.error("Request Email Change Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send email verification OTP",
    });
  }
};

// VERIFY EMAIL CHANGE OTP
const verifyEmailChange = async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    if (!admin.pendingEmail) {
      return res.status(400).json({
        success: false,
        message: "No email change request found",
      });
    }

    if (!admin.emailChangeOtpHash || !admin.emailChangeOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired",
      });
    }

    if (new Date() > admin.emailChangeOtpExpiresAt) {
      admin.pendingEmail = null;
      admin.emailChangeOtpHash = null;
      admin.emailChangeOtpExpiresAt = null;

      await admin.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    const otpHash = hashOtp(otp);

    if (otpHash !== admin.emailChangeOtpHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const existingEmail = await Admin.findOne({
      email: admin.pendingEmail,
      _id: { $ne: admin._id },
    });

    if (existingEmail) {
      admin.pendingEmail = null;
      admin.emailChangeOtpHash = null;
      admin.emailChangeOtpExpiresAt = null;

      await admin.save();

      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    admin.email = admin.pendingEmail;
    admin.emailVerified = true;

    admin.pendingEmail = null;
    admin.emailChangeOtpHash = null;
    admin.emailChangeOtpExpiresAt = null;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Email address verified and updated successfully",
      email: admin.email,
    });
  } catch (error) {
    console.error("Verify Email Change Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify email",
    });
  }
};

// FORGOT PASSWORD
// SEND OTP TO REGISTERED EMAIL
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({
      email: cleanEmail,
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "No Admin account found with this email",
      });
    }

    if (admin.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your Admin account is inactive",
      });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    admin.forgotPasswordOtpHash = otpHash;
    admin.forgotPasswordOtpExpiresAt = otpExpiresAt;

    await admin.save();

    await sendEmail({
      to: cleanEmail,
      subject: "Digital Village Admin - Password Reset OTP",
      html: buildOtpEmail({
        admin,
        otp,
        title: "Password Reset Verification",
        message:
          "We received a request to reset the password of your Digital Village Admin account. Verify this OTP to continue with setting a new password.",
        purpose: "forgot-password",
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully to your email address",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send password reset OTP",
    });
  }
};

// VERIFY FORGOT PASSWORD OTP
// RETURNS SHORT-LIVED RESET TOKEN
const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({
      email: cleanEmail,
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    if (!admin.forgotPasswordOtpHash || !admin.forgotPasswordOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired",
      });
    }

    if (new Date() > admin.forgotPasswordOtpExpiresAt) {
      admin.forgotPasswordOtpHash = null;
      admin.forgotPasswordOtpExpiresAt = null;

      await admin.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    const otpHash = hashOtp(otp);

    if (otpHash !== admin.forgotPasswordOtpHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP verified successfully.
    // Clear OTP so it cannot be reused.
    admin.forgotPasswordOtpHash = null;
    admin.forgotPasswordOtpExpiresAt = null;

    await admin.save();

    // Short-lived token only for password reset
    const resetToken = jwt.sign(
      {
        id: admin._id,
        purpose: "admin-password-reset",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Verify Forgot Password OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify password reset OTP",
    });
  }
};

// RESET PASSWORD
const resetAdminPassword = async (req, res) => {
  try {
    const {
      resetToken,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Reset token, new password and confirm password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Password reset session has expired. Please start again",
      });
    }

    if (
      !decoded ||
      decoded.purpose !== "admin-password-reset"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset token",
      });
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your Admin account is inactive",
      });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      admin.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Admin model ke pre-save hook ke through password hash hoga
    admin.password = newPassword;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("Reset Admin Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

// ==========================================
// CHANGE ADMIN PASSWORD
// ==========================================

const changeAdminPassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password, new password and confirm password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    const admin = await Admin.findById(req.userId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isCurrentPasswordValid = await admin.comparePassword(
      currentPassword
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      admin.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Admin model ke pre-save hook ke through password hash hoga
    admin.password = newPassword;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Admin Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  loginAdmin,
  requestLoginOtp,
  loginWithOtp,

  getAdminProfile,
  updateAdminProfile,

  requestEmailChange,
  verifyEmailChange,

  forgotPassword,
  verifyForgotPasswordOtp,
  resetAdminPassword,

  changeAdminPassword,
};