const SuperAdmin = require("../../models/SuperAdmin");
const cloudinary = require("../../config/cloudinary");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");

const EMAIL_OTP_EXPIRY_MINUTES = 10;
const EMAIL_OTP_EXPIRY_MS =
  EMAIL_OTP_EXPIRY_MINUTES * 60 * 1000;
const EMAIL_OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_EMAIL_OTP_ATTEMPTS = 5;

const generateEmailOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashEmailOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp.toString().trim())
    .digest("hex");
};

const sendEmailChangeOtpEmail = async ({
  email,
  name,
  otp,
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
      <h2 style="color: #1f2937;">
        Digital Village Project, Jharkhand
      </h2>

      <p>Hello ${name},</p>

      <p>
        We received a request to change the email address
        associated with your Super Admin account.
      </p>

      <p>
        Please use the OTP below to verify your new email address.
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
        This OTP is valid for
        <strong>${EMAIL_OTP_EXPIRY_MINUTES} minutes</strong>.
      </p>

      <p>
        For security reasons, never share this OTP with anyone.
      </p>

      <p>
        If you did not request an email change, please ignore
        this email and keep your account secure.
      </p>

      <p>
        Regards,<br />
        <strong>Digital Village Project, Jharkhand</strong>
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject:
      "Verify Your New Email - Digital Village Project, Jharkhand",
    html,
  });
};

// Get Super Admin Profile
const getSuperAdminProfile = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findById(
      req.superAdmin._id
    ).select("-password");

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      superAdmin: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        phone: superAdmin.phone,
        profileImage: superAdmin.profileImage,
        status: superAdmin.status,
        lastLogin: superAdmin.lastLogin,
        createdAt: superAdmin.createdAt,
        updatedAt: superAdmin.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Get Super Admin Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update Super Admin Profile
const updateSuperAdminProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email and phone are required",
      });
    }

    const superAdmin = await SuperAdmin.findById(
      req.superAdmin._id
    );

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    // Check duplicate email
    const existingEmail = await SuperAdmin.findOne({
      email: normalizedEmail,
      _id: { $ne: superAdmin._id },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email is already in use",
      });
    }

    // Check duplicate phone
    const existingPhone = await SuperAdmin.findOne({
      phone: normalizedPhone,
      _id: { $ne: superAdmin._id },
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number is already in use",
      });
    }

    // Update basic information
    superAdmin.name = name.trim();
    superAdmin.phone = normalizedPhone;

    // Email Change
    if (normalizedEmail !== superAdmin.email) {
      return res.status(400).json({
        success: false,
        message:
          "Email change requires verification. Please request an OTP first.",
        emailChangeRequired: true,
      });
    }

    // Update profile image if a new image was uploaded
    if (req.file) {
      // Delete old profile image from Cloudinary
      if (superAdmin.profileImagePublicId) {
        await cloudinary.uploader.destroy(
          superAdmin.profileImagePublicId
        );
      }

      // Save new profile image details
      superAdmin.profileImage = req.file.path;
      superAdmin.profileImagePublicId =
        req.file.filename;
    }

    await superAdmin.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      superAdmin: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        phone: superAdmin.phone,
        profileImage: superAdmin.profileImage,
        status: superAdmin.status,
        lastLogin: superAdmin.lastLogin,
        createdAt: superAdmin.createdAt,
        updatedAt: superAdmin.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Update Super Admin Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Request Super Admin Email Change OTP
const requestSuperAdminEmailChange = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const superAdmin = await SuperAdmin.findById(
      req.superAdmin._id
    );

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    if (email === superAdmin.email) {
      return res.status(400).json({
        success: false,
        message: "This is already your current email",
      });
    }

    const existingEmail = await SuperAdmin.findOne({
      email,
      _id: { $ne: superAdmin._id },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email is already in use",
      });
    }

    if (
      superAdmin.emailOtpPurpose === "email-change" &&
      superAdmin.emailOtpLastSentAt &&
      Date.now() -
        superAdmin.emailOtpLastSentAt.getTime() <
        EMAIL_OTP_RESEND_COOLDOWN_MS
    ) {
      const remainingSeconds = Math.ceil(
        (
          EMAIL_OTP_RESEND_COOLDOWN_MS -
          (Date.now() -
            superAdmin.emailOtpLastSentAt.getTime())
        ) / 1000
      );

      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
      });
    }

    const otp = generateEmailOtp();

    superAdmin.emailOtp = hashEmailOtp(otp);
    superAdmin.emailOtpExpiresAt = new Date(
      Date.now() + EMAIL_OTP_EXPIRY_MS
    );
    superAdmin.emailOtpPurpose = "email-change";
    superAdmin.emailOtpAttempts = 0;
    superAdmin.emailOtpLastSentAt = new Date();

    await superAdmin.save();

    try {
      await sendEmailChangeOtpEmail({
        email,
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
        message:
          "Unable to send OTP email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verification OTP sent successfully.",
    });
  } catch (error) {
    console.error(
      "Super Admin Email Change OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Verify Super Admin Email Change OTP
const verifySuperAdminEmailChange = async (req, res) => {
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

    const superAdmin = await SuperAdmin.findById(
      req.superAdmin._id
    );

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    if (superAdmin.emailOtpPurpose !== "email-change") {
      return res.status(400).json({
        success: false,
        message:
          "Email verification request not found.",
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
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    if (
      superAdmin.emailOtpAttempts >=
      MAX_EMAIL_OTP_ATTEMPTS
    ) {
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

    const hashedOtp = hashEmailOtp(otp);

    if (hashedOtp !== superAdmin.emailOtp) {
      superAdmin.emailOtpAttempts += 1;

      await superAdmin.save();

      const remainingAttempts =
        MAX_EMAIL_OTP_ATTEMPTS -
        superAdmin.emailOtpAttempts;

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

    // Change email only after successful OTP verification
    const existingEmail = await SuperAdmin.findOne({
      email,
      _id: { $ne: superAdmin._id },
    });

    if (existingEmail) {
      superAdmin.emailOtp = null;
      superAdmin.emailOtpExpiresAt = null;
      superAdmin.emailOtpPurpose = null;
      superAdmin.emailOtpAttempts = 0;
      superAdmin.emailOtpLastSentAt = null;

      await superAdmin.save();

      return res.status(409).json({
        success: false,
        message: "Email is already in use",
      });
    }

    superAdmin.email = email;
    superAdmin.emailOtp = null;
    superAdmin.emailOtpExpiresAt = null;
    superAdmin.emailOtpPurpose = null;
    superAdmin.emailOtpAttempts = 0;
    superAdmin.emailOtpLastSentAt = null;

    await superAdmin.save();

    return res.status(200).json({
      success: true,
      message: "Email changed and verified successfully.",
      emailVerified: true,
      email: superAdmin.email,
    });
  } catch (error) {
    console.error(
      "Super Admin Email Change Verification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Change Super Admin Password
const changeSuperAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Basic validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    // Minimum password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters",
      });
    }

    // New password should differ from current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must differ from current password",
      });
    }

    // Find Super Admin
    const superAdmin = await SuperAdmin.findById(
      req.superAdmin._id
    );

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    // Verify current password
    const isPasswordCorrect =
      await superAdmin.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Assign new password
    // pre("save") middleware in SuperAdmin model
    // will automatically hash this password.
    superAdmin.password = newPassword;

    await superAdmin.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(
      "Change Super Admin Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getSuperAdminProfile,
  updateSuperAdminProfile,
  requestSuperAdminEmailChange,
  verifySuperAdminEmailChange,
  changeSuperAdminPassword,
};