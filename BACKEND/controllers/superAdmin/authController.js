const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const SuperAdmin = require("../../models/SuperAdmin");
const sendEmail = require("../../utils/sendEmail");

const OTP_EXPIRY_MINUTES = 10;
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp.toString().trim())
    .digest("hex");
};

const sendOtpEmail = async ({
  email,
  name = "Super Admin",
  otp,
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
      <h2 style="color: #1f2937;">Digital Village Project, Jharkhand</h2>

      <p>Hello ${name},</p>

      <p>
        We received a request to reset your Super Admin password.
        Please use the OTP below to continue.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <div style="
          display: inline-block;
          padding: 15px 25px;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 30px;
          font-weight: bold;
          letter-spacing: 8px;
        ">
          ${otp}
        </div>
      </div>

      <p>
        This OTP is valid for <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
      </p>

      <p>
        For security reasons, never share this OTP with anyone.
      </p>

      <p>
        If you did not request a password reset, please ignore this email.
      </p>

      <p>
        Regards,<br />
        <strong>Digital Village Project, Jharkhand</strong>
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Your OTP - Digital Village Project, Jharkhand",
    html,
  });
};

const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const superAdmin = await SuperAdmin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (superAdmin.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Super Admin account is inactive",
      });
    }

    const isPasswordMatch = await superAdmin.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: superAdmin._id,
        role: "superadmin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    superAdmin.lastLogin = new Date();
    await superAdmin.save();

    return res.status(200).json({
      success: true,
      message: "Super Admin login successful",
      token,
      superAdmin: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        phone: superAdmin.phone,
        profileImage: superAdmin.profileImage,
        status: superAdmin.status,
      },
    });
  } catch (error) {
    console.error("Super Admin Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const superAdmin = await SuperAdmin.findOne({
      email,
    });

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    if (
      superAdmin.emailOtpPurpose === "forgot-password" &&
      superAdmin.emailOtpLastSentAt &&
      Date.now() - superAdmin.emailOtpLastSentAt.getTime() <
        OTP_RESEND_COOLDOWN_MS
    ) {
      const remainingSeconds = Math.ceil(
        (
          OTP_RESEND_COOLDOWN_MS -
          (Date.now() - superAdmin.emailOtpLastSentAt.getTime())
        ) / 1000
      );

      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
      });
    }

    const otp = generateOtp();

    superAdmin.emailOtp = hashOtp(otp);
    superAdmin.emailOtpExpiresAt = new Date(
      Date.now() + OTP_EXPIRY_MS
    );
    superAdmin.emailOtpPurpose = "forgot-password";
    superAdmin.emailOtpAttempts = 0;
    superAdmin.emailOtpLastSentAt = new Date();

    await superAdmin.save();

    try {
      await sendOtpEmail({
        email: superAdmin.email,
        name: superAdmin.name,
        otp,
      });
    } catch (error) {
      superAdmin.emailOtp = null;
      superAdmin.emailOtpExpiresAt = null;
      superAdmin.emailOtpPurpose = null;
      superAdmin.emailOtpAttempts = 0;
      superAdmin.emailOtpLastSentAt = null;

      await superAdmin.save();

      return res.status(500).json({
        success: false,
        message: "Unable to send OTP email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully.",
    });
  } catch (error) {
    console.error("Super Admin Forgot Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Verify Forgot Password OTP
const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.toString().trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be 6 digits",
      });
    }

    const superAdmin = await SuperAdmin.findOne({
      email,
      emailOtpPurpose: "forgot-password",
    });

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Password reset request not found.",
      });
    }

    if (
      !superAdmin.emailOtpExpiresAt ||
      superAdmin.emailOtpExpiresAt.getTime() < Date.now()
    ) {
      superAdmin.emailOtp = null;
      superAdmin.emailOtpExpiresAt = null;
      superAdmin.emailOtpPurpose = null;
      superAdmin.emailOtpAttempts = 0;

      await superAdmin.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (superAdmin.emailOtpAttempts >= MAX_OTP_ATTEMPTS) {
      superAdmin.emailOtp = null;
      superAdmin.emailOtpExpiresAt = null;
      superAdmin.emailOtpPurpose = null;
      superAdmin.emailOtpAttempts = 0;

      await superAdmin.save();

      return res.status(429).json({
        success: false,
        message:
          "Maximum OTP attempts exceeded. Please request a new OTP.",
      });
    }

    const hashedOtp = hashOtp(otp);

    if (hashedOtp !== superAdmin.emailOtp) {
      superAdmin.emailOtpAttempts += 1;

      await superAdmin.save();

      const remainingAttempts =
        MAX_OTP_ATTEMPTS - superAdmin.emailOtpAttempts;

      if (remainingAttempts <= 0) {
        superAdmin.emailOtp = null;
        superAdmin.emailOtpExpiresAt = null;
        superAdmin.emailOtpPurpose = null;
        superAdmin.emailOtpAttempts = 0;

        await superAdmin.save();

        return res.status(429).json({
          success: false,
          message:
            "Maximum OTP attempts exceeded. Please request a new OTP.",
        });
      }

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
      });
    }

    superAdmin.emailOtp = null;
    superAdmin.emailOtpExpiresAt = null;
    superAdmin.emailOtpPurpose = null;
    superAdmin.emailOtpAttempts = 0;
    superAdmin.emailOtpLastSentAt = null;

    await superAdmin.save();

    const resetToken = jwt.sign(
      {
        id: superAdmin._id,
        purpose: "superadmin-password-reset",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      resetToken,
    });
  } catch (error) {
    console.error(
      "Super Admin Verify Forgot Password OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const {
      resetToken,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Confirm password is required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }

    if (
      decoded.purpose !==
      "superadmin-password-reset"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid password reset token",
      });
    }

    const superAdmin = await SuperAdmin.findById(decoded.id);

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    superAdmin.password = newPassword;

    await superAdmin.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    console.error(
      "Super Admin Reset Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  loginSuperAdmin,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
};