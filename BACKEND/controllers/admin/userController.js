const User = require("../../models/User");
const Admin = require("../../models/Admin");
const Complaint = require("../../models/Complaint");
const Certificate = require("../../models/Certificate");
const Activity = require("../../models/Activity");
const expressError = require("../../utils/expressError");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");
const cloudinary = require("../../config/cloudinary");

// EMAIL OTP CONFIGURATION
const OTP_EXPIRY_MINUTES = 10;
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

// OTP HELPERS
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp.toString().trim())
    .digest("hex");
};

const escapeHtml = (value = "") => {
  return value
    .toString()
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "")
    .replace(/'/g, "'");
};

// SEND EMAIL OTP

const sendOtpEmail = async ({
  email,
  name,
  otp,
  purpose = "email-change",
}) => {
  const safeName = escapeHtml(name || "User");

  let purposeTitle = "Email Verification";
  let purposeMessage =
    "We received a request to verify your email address.";

  if (purpose === "forgot-password") {
    purposeTitle = "Password Reset";
    purposeMessage =
      "We received a request to reset your account password.";
  } else if (purpose === "email-change") {
    purposeTitle = "Email Change Verification";
    purposeMessage =
      "A request was made to change the email address associated with your Digital Village account.";
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${purposeTitle}</title>
</head>

<body style="margin:0; padding:0; background:#f3f6f9; font-family:Arial, Helvetica, sans-serif;">

  <div style="width:100%; padding:35px 15px; box-sizing:border-box;">

    <div style="
      max-width:600px;
      margin:0 auto;
      background:#ffffff;
      border-radius:14px;
      overflow:hidden;
      box-shadow:0 5px 25px rgba(0,0,0,0.08);
    ">

      <!-- Header -->
      <div style="
        background:linear-gradient(135deg, #166534, #15803d);
        padding:28px 25px;
        text-align:center;
      ">

        <div style="
          display:inline-block;
          background:rgba(255,255,255,0.15);
          padding:10px 18px;
          border-radius:30px;
          margin-bottom:12px;
        ">
          <span style="
            color:#ffffff;
            font-size:14px;
            font-weight:bold;
            letter-spacing:0.5px;
          ">
            DIGITAL VILLAGE PROJECT
          </span>
        </div>

        <h1 style="
          margin:5px 0 0;
          color:#ffffff;
          font-size:24px;
          font-weight:700;
        ">
          Jharkhand
        </h1>

      </div>

      <!-- Content -->
      <div style="padding:35px 30px;">

        <p style="
          margin:0 0 12px;
          color:#333333;
          font-size:17px;
        ">
          Hello <strong>${safeName}</strong>,
        </p>

        <h2 style="
          margin:0 0 15px;
          color:#166534;
          font-size:21px;
        ">
          ${purposeTitle}
        </h2>

        <p style="
          margin:0 0 25px;
          color:#555555;
          font-size:15px;
          line-height:1.7;
        ">
          ${purposeMessage}
        </p>

        <!-- OTP Box -->
        <div style="
          background:#f0fdf4;
          border:1px solid #bbf7d0;
          border-radius:12px;
          padding:25px 15px;
          text-align:center;
          margin:25px 0;
        ">

          <p style="
            margin:0 0 10px;
            color:#4b5563;
            font-size:13px;
            font-weight:600;
            text-transform:uppercase;
            letter-spacing:1px;
          ">
            Your Verification Code
          </p>

          <div style="
            color:#166534;
            font-size:34px;
            font-weight:700;
            letter-spacing:8px;
          ">
            ${otp}
          </div>

        </div>

        <div style="
          background:#fff7ed;
          border-left:4px solid #f97316;
          padding:13px 15px;
          border-radius:6px;
          margin:20px 0;
        ">
          <p style="
            margin:0;
            color:#7c2d12;
            font-size:14px;
            line-height:1.6;
          ">
            This OTP is valid for
            <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
          </p>
        </div>

        <p style="
          margin:20px 0 8px;
          color:#555555;
          font-size:14px;
          line-height:1.7;
        ">
          For your security, please do not share this OTP with anyone.
          Our team will never ask you to share your verification code.
        </p>

        <p style="
          margin:18px 0 0;
          color:#555555;
          font-size:14px;
          line-height:1.7;
        ">
          If you did not request this action, you can safely ignore this
          email.
        </p>

      </div>

      <!-- Footer -->
      <div style="
        background:#f8fafc;
        border-top:1px solid #e5e7eb;
        padding:22px 25px;
        text-align:center;
      ">

        <p style="
          margin:0 0 7px;
          color:#166534;
          font-size:14px;
          font-weight:700;
        ">
          Digital Village Project, Jharkhand
        </p>

        <p style="
          margin:0;
          color:#9ca3af;
          font-size:12px;
          line-height:1.6;
        ">
          This is an automated email. Please do not reply to this message.
        </p>

      </div>

    </div>

  </div>

</body>
</html>
`;

  await sendEmail({
    to: email,
    subject: `${purposeTitle} - Digital Village Project, Jharkhand`,
    html,
  });
};

// GET ALL USERS OF LOGGED-IN ADMIN'S PANCHAYAT
const getAllUsers = async (req, res) => {
  const admin = await Admin.findById(req.userId).select(
    "panchayat panchayatCode"
  );

  if (!admin) {
    throw new expressError(404, "Admin not found");
  }

  const panchayatFilter = admin.panchayatCode
    ? {
        $or: [
          { panchayatCode: admin.panchayatCode },
          { panchayat: admin.panchayat },
        ],
      }
    : {
        panchayat: admin.panchayat,
      };

  const users = await User.find(panchayatFilter)
    .sort({ createdAt: -1 })
    .select("-password");

  res.status(200).json(users);
};

// REQUEST EMAIL CHANGE OTP
// ONLY ADMIN OF USER'S PANCHAYAT CAN REQUEST
const requestEmailChangeByAdmin = async (req, res) => {
  const { id } = req.params;

  const newEmail = req.body.email?.trim().toLowerCase();

  if (!newEmail) {
    throw new expressError(400, "New email is required");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    throw new expressError(
      400,
      "Please enter a valid email address."
    );
  }

  const admin = await Admin.findById(req.userId).select(
    "panchayat panchayatCode"
  );

  if (!admin) {
    throw new expressError(404, "Admin not found");
  }

  const panchayatFilter = admin.panchayatCode
    ? {
        $or: [
          { panchayatCode: admin.panchayatCode },
          { panchayat: admin.panchayat },
        ],
      }
    : {
        panchayat: admin.panchayat,
      };

  const user = await User.findOne({
    _id: id,
    ...panchayatFilter,
  });

  if (!user) {
    throw new expressError(
      403,
      "You are not authorized to manage this user."
    );
  }

  if (newEmail === user.email) {
    throw new expressError(
      400,
      "This is already the user's current email."
    );
  }

  const existingUser = await User.findOne({
    email: newEmail,
    _id: {
      $ne: user._id,
    },
  });

  if (existingUser) {
    throw new expressError(
      400,
      "This email is already registered with another account."
    );
  }

  if (
    user.emailOtpPurpose === "email-change" &&
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
    user.pendingEmail = null;
    user.pendingEmailVerified = false;

    await user.save();

    throw new expressError(
      500,
      "Unable to send OTP email. Please try again."
    );
  }

  res.status(200).json({
    success: true,
    message:
      "A verification OTP has been sent to the new email address.",
  });
};

// VERIFY EMAIL CHANGE OTP BY ADMIN
const verifyEmailChangeByAdmin = async (req, res) => {
  const { id } = req.params;

  const otp = req.body.otp?.toString().trim();

  if (!otp) {
    throw new expressError(400, "OTP is required");
  }

  if (!/^[0-9]{6}$/.test(otp)) {
    throw new expressError(400, "OTP must be 6 digits");
  }

  const admin = await Admin.findById(req.userId).select(
    "panchayat panchayatCode"
  );

  if (!admin) {
    throw new expressError(404, "Admin not found");
  }

  const panchayatFilter = admin.panchayatCode
    ? {
        $or: [
          { panchayatCode: admin.panchayatCode },
          { panchayat: admin.panchayat },
        ],
      }
    : {
        panchayat: admin.panchayat,
      };

  const user = await User.findOne({
    _id: id,
    ...panchayatFilter,
  });

  if (!user) {
    throw new expressError(
      403,
      "You are not authorized to manage this user."
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

  if (
    !user.emailOtpExpiresAt ||
    user.emailOtpExpiresAt.getTime() < Date.now()
  ) {
    user.emailOtp = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpPurpose = null;
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = null;
    user.pendingEmail = null;
    user.pendingEmailVerified = false;

    await user.save();

    throw new expressError(
      400,
      "OTP has expired. Please request a new OTP."
    );
  }

  if (user.emailOtpAttempts >= MAX_OTP_ATTEMPTS) {
    user.emailOtp = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpPurpose = null;
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = null;
    user.pendingEmail = null;
    user.pendingEmailVerified = false;

    await user.save();

    throw new expressError(
      429,
      "Maximum OTP attempts exceeded. Please request a new OTP."
    );
  }

  const hashedOtp = hashOtp(otp);

  if (hashedOtp !== user.emailOtp) {
    user.emailOtpAttempts += 1;

    const remainingAttempts =
      MAX_OTP_ATTEMPTS - user.emailOtpAttempts;

    if (remainingAttempts <= 0) {
      user.emailOtp = null;
      user.emailOtpExpiresAt = null;
      user.emailOtpPurpose = null;
      user.emailOtpAttempts = 0;
      user.emailOtpLastSentAt = null;
      user.pendingEmail = null;
      user.pendingEmailVerified = false;

      await user.save();

      throw new expressError(
        429,
        "Maximum OTP attempts exceeded. Please request a new OTP."
      );
    }

    await user.save();

    throw new expressError(
      400,
      `Invalid OTP. ${remainingAttempts} attempts remaining.`
    );
  }

  const existingUser = await User.findOne({
    email: user.pendingEmail,
    _id: {
      $ne: user._id,
    },
  });

  if (existingUser) {
    user.emailOtp = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpPurpose = null;
    user.emailOtpAttempts = 0;
    user.emailOtpLastSentAt = null;
    user.pendingEmail = null;
    user.pendingEmailVerified = false;

    await user.save();

    throw new expressError(
      400,
      "This email has already been registered by another user."
    );
  }

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
    message: "Email changed successfully.",
    email: user.email,
  });
};

// UPDATE USER
// ONLY USER OF ADMIN'S PANCHAYAT CAN BE UPDATED
const updateUserByAdmin = async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findById(req.userId).select(
    "panchayat panchayatCode"
  );

  if (!admin) {
    throw new expressError(404, "Admin not found");
  }

  const panchayatFilter = admin.panchayatCode
    ? {
        $or: [
          { panchayatCode: admin.panchayatCode },
          { panchayat: admin.panchayat },
        ],
      }
    : {
        panchayat: admin.panchayat,
      };

  const existingUser = await User.findOne({
    _id: id,
    ...panchayatFilter,
  });

  if (!existingUser) {
    throw new expressError(
      403,
      "You are not authorized to manage this user."
    );
  }

  // PROTECTED LOCATION FIELDS
  delete req.body.state;
  delete req.body.stateCode;

  delete req.body.district;
  delete req.body.districtCode;

  delete req.body.subDistrict;
  delete req.body.subDistrictCode;

  delete req.body.panchayat;
  delete req.body.panchayatCode;

  // EMAIL CAN ONLY BE CHANGED AFTER OTP VERIFICATION
  if (
    req.body.email !== undefined &&
    req.body.email.trim().toLowerCase() !== existingUser.email
  ) {
    throw new expressError(
      400,
      "Please verify the new email address with OTP before saving."
    );
  }

  req.body.email = existingUser.email;

  // PROTECTED USER FIELDS
  delete req.body.password;
  delete req.body.emailVerified;

  delete req.body.emailOtp;
  delete req.body.emailOtpExpiresAt;
  delete req.body.emailOtpPurpose;
  delete req.body.emailOtpAttempts;
  delete req.body.emailOtpLastSentAt;

  delete req.body.pendingEmail;
  delete req.body.pendingEmailVerified;

  delete req.body.registrationStatus;

  // NOTE:
  // status is intentionally NOT deleted here.
  // Admin is allowed to change user status between
  // "active" and "inactive".

  // KEEP ORIGINAL LOCATION
  const updateData = {
    ...req.body,

    state: existingUser.state,
    stateCode: existingUser.stateCode,

    district: existingUser.district,
    districtCode: existingUser.districtCode,

    subDistrict: existingUser.subDistrict,
    subDistrictCode: existingUser.subDistrictCode,

    panchayat: existingUser.panchayat,
    panchayatCode: existingUser.panchayatCode,
  };

  const updateUser = await User.findByIdAndUpdate(
    id,
    updateData,
    {
      returnDocument: "after",
      runValidators: true,
    }
  ).select("-password");

  if (!updateUser) {
    throw new expressError(404, "User not found");
  }

  // USER NOTIFICATION
  await Activity.create({
    user: updateUser._id,
    audience: "user",
    createdBy: "admin",
    type: "PROFILE_UPDATED",
    title: "Profile Updated",
    description:
      "Your profile has been updated by the administrator.",
    route: "/profile",
    isNotification: true,
    isRead: false,
    priority: "medium",
    status: "completed",
  });

  res.status(200).json({
    message: "User updated successfully!",
    user: updateUser,
  });
};

// ONLY USER OF ADMIN'S PANCHAYAT CAN BE DELETED
const deleteUser = async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findById(req.userId).select(
    "panchayat panchayatCode"
  );

  if (!admin) {
    throw new expressError(404, "Admin not found");
  }

  const panchayatFilter = admin.panchayatCode
    ? {
        $or: [
          { panchayatCode: admin.panchayatCode },
          { panchayat: admin.panchayat },
        ],
      }
    : {
        panchayat: admin.panchayat,
      };

  // Check whether target user belongs to this Admin's Panchayat
  const user = await User.findOne({
    _id: id,
    ...panchayatFilter,
  });

  if (!user) {
    throw new expressError(
      403,
      "You are not authorized to delete this user."
    );
  }

  // DELETE USER'S COMPLAINTS
  await Complaint.deleteMany({
    userId: id,
  });

  // DELETE USER'S CERTIFICATES
  await Certificate.deleteMany({
    userId: id,
  });

  // DELETE USER'S PROFILE IMAGE FROM CLOUDINARY
  if (user.profileImagePublicId) {
    await cloudinary.uploader.destroy(
      user.profileImagePublicId
    );
  }

  // DELETE USER ACCOUNT
  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message:
      "User account, complaints, certificates, and profile image have been deleted successfully.",
  });
};

// EXPORTS
module.exports = {
  getAllUsers,
  updateUserByAdmin,
  requestEmailChangeByAdmin,
  verifyEmailChangeByAdmin,
  deleteUser,
};