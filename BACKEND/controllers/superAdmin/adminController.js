const Admin = require("../../models/Admin");
const sendEmail = require("../../utils/sendEmail");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const cloudinary = require("../../config/cloudinary");

const State = require("../../models/locations/State");
const District = require("../../models/locations/District");
const SubDistrict = require("../../models/locations/SubDistrict");
const Panchayat = require("../../models/locations/Panchayat");
const PanchayatVillage = require("../../models/locations/PanchayatVillage");
const Scheme = require("../../models/Scheme");
const Notice = require("../../models/Notice");

// EMAIL VERIFICATION CONFIG
const EMAIL_OTP_EXPIRY_MINUTES = 10;
// Admin is created only after the email is verified.
const createEmailVerifications = new Map();


// HELPERS
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const getOtpExpiry = () => {
  return new Date(
    Date.now() + EMAIL_OTP_EXPIRY_MINUTES * 60 * 1000
  );
};

// EMAIL OTP TEMPLATE
const buildVerificationEmail = ({
  otp,
  email,
  purpose = "create",
}) => {
  const title =
    purpose === "edit"
      ? "Confirm Your New Email Address"
      : "Verify Your Email Address";

  const description =
    purpose === "edit"
      ? "A request was made to change the email address of your Digital Village Project administrator account."
      : "A request was made to verify this email address for a Digital Village Project administrator account.";

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    >

    <title>${title}</title>

    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
        }

        .wrapper {
            width: 100%;
            padding: 35px 15px;
            box-sizing: border-box;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }

        .header {
            background: linear-gradient(
                135deg,
                #4f46e5,
                #4338ca
            );
            color: #ffffff;
            text-align: center;
            padding: 32px 25px;
        }

        .logo {
            width: 54px;
            height: 54px;
            margin: 0 auto 14px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.16);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 25px;
            font-weight: bold;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            line-height: 1.3;
        }

        .header p {
            margin: 8px 0 0;
            font-size: 14px;
            opacity: 0.9;
        }

        .content {
            padding: 35px 30px;
        }

        .content h2 {
            margin: 0 0 12px;
            color: #111827;
            font-size: 22px;
        }

        .content p {
            font-size: 15px;
            line-height: 1.7;
            color: #4b5563;
        }

        .email-box {
            margin: 22px 0;
            padding: 13px 16px;
            background: #f5f7ff;
            border: 1px solid #e0e7ff;
            border-radius: 9px;
            text-align: center;
            color: #4338ca;
            font-size: 14px;
            word-break: break-word;
        }

        .otp-box {
            margin: 28px 0;
            padding: 24px 20px;
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            text-align: center;
        }

        .otp-label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 10px;
        }

        .otp {
            display: inline-block;
            font-size: 34px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #4338ca;
            padding-left: 8px;
        }

        .expiry {
            margin-top: 12px;
            font-size: 13px;
            color: #6b7280;
        }

        .security-box {
            margin-top: 22px;
            padding: 15px 17px;
            background: #fff7ed;
            border-left: 4px solid #f97316;
            border-radius: 7px;
            color: #7c2d12;
            font-size: 13px;
            line-height: 1.6;
        }

        .footer {
            padding: 22px 30px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
            line-height: 1.6;
            text-align: center;
        }

        .footer strong {
            color: #374151;
        }

        @media only screen and (max-width: 600px) {
            .wrapper {
                padding: 15px 10px;
            }

            .header {
                padding: 27px 18px;
            }

            .header h1 {
                font-size: 21px;
            }

            .content {
                padding: 28px 20px;
            }

            .otp {
                font-size: 29px;
                letter-spacing: 6px;
            }

            .footer {
                padding: 20px;
            }
        }
    </style>
</head>

<body>

<div class="wrapper">

    <div class="container">

        <!-- HEADER -->

        <div class="header">

            <div class="logo">
                DV
            </div>

            <h1>
                Digital Village Project
            </h1>

            <p>
                Jharkhand
            </p>

        </div>


        <!-- CONTENT -->

        <div class="content">

            <h2>
                ${title}
            </h2>

            <p>
                ${description}
            </p>

            <p>
                Please use the following one-time verification code
                to continue.
            </p>


            <div class="email-box">
                Verifying:
                <strong>${email}</strong>
            </div>


            <!-- OTP -->

            <div class="otp-box">

                <div class="otp-label">
                    YOUR 6-DIGIT VERIFICATION CODE
                </div>

                <div class="otp">
                    ${otp}
                </div>

                <div class="expiry">
                    This code will expire in
                    <strong>${EMAIL_OTP_EXPIRY_MINUTES} minutes</strong>.
                </div>

            </div>


            <div class="security-box">

                <strong>Security Notice:</strong><br>

                Never share this verification code with anyone.
                The Digital Village Project team will never ask you
                to share your OTP by phone, message, or email.

            </div>


            <p style="margin-top: 25px;">

                If you did not request this verification,
                you can safely ignore this email.

            </p>


            <p style="margin-top: 25px;">

                Regards,<br>

                <strong>
                    Digital Village Project, Jharkhand
                </strong>

                <br>

                Super Admin

            </p>

        </div>


        <!-- FOOTER -->

        <div class="footer">

            This is an automated email from the
            <strong>
                Digital Village Project, Jharkhand
            </strong>
            system.

            <br>

            Please do not reply directly to this email.

        </div>

    </div>

</div>

</body>
</html>
`;
};

// SEND CREATE ADMIN EMAIL OTP
const sendCreateAdminEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Basic email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Existing Admin check
    const existingEmail = await Admin.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = getOtpExpiry();

    createEmailVerifications.set(normalizedEmail, {
      otpHash,
      expiresAt,
    });

    await sendEmail({
      to: normalizedEmail,

      subject:
        "Verify Your Email - Digital Village Project, Jharkhand",

      html: buildVerificationEmail({
        otp,
        email: normalizedEmail,
        purpose: "create",
      }),
    });

    return res.status(200).json({
      success: true,
      message:
        "A 6-digit verification code has been sent to your email address",
    });
  } catch (error) {
    console.error(
      "Send Create Admin Email OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to send email verification code",
    });
  }
};


// VERIFY CREATE ADMIN EMAIL OTP
const verifyCreateAdminEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!otp || !/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit OTP",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const verification =
      createEmailVerifications.get(normalizedEmail);

    if (!verification) {
      return res.status(400).json({
        success: false,
        message:
          "No active verification found. Please request a new OTP",
      });
    }

    if (
      new Date(verification.expiresAt).getTime() <
      Date.now()
    ) {
      createEmailVerifications.delete(normalizedEmail);

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new verification code",
      });
    }

    const otpMatched = await bcrypt.compare(
      String(otp),
      verification.otpHash
    );

    if (!otpMatched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP. Please try again",
      });
    }

    // Remove OTP after successful verification
    createEmailVerifications.delete(normalizedEmail);

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing in environment variables"
      );

      return res.status(500).json({
        success: false,
        message: "Email verification configuration error",
      });
    }

    // Short-lived verification token
    const verificationToken = jwt.sign(
      {
        purpose: "create-admin-email-verification",
        email: normalizedEmail,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      emailVerified: true,
      verificationToken,
    });
  } catch (error) {
    console.error(
      "Verify Create Admin Email OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify email",
    });
  }
};


// CREATE ADMIN
const createAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      stateCode,
      districtCode,
      subDistrictCode,
      panchayatCode,
      password,
      emailVerificationToken,
    } = req.body;

    // Basic validation
    if (
      !name ||
      !email ||
      !phone ||
      !stateCode ||
      !districtCode ||
      !subDistrictCode ||
      !panchayatCode ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // EMAIL VERIFICATION
    if (!emailVerificationToken) {
      return res.status(400).json({
        success: false,
        message:
          "Please verify the email address before creating the Admin",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          "Email verification configuration error",
      });
    }

    let verificationPayload;

    try {
      verificationPayload = jwt.verify(
        emailVerificationToken,
        process.env.JWT_SECRET
      );
    } catch (tokenError) {
      return res.status(400).json({
        success: false,
        message:
          "Email verification has expired. Please verify the email again",
      });
    }

    if (
      verificationPayload.purpose !==
        "create-admin-email-verification" ||
      verificationPayload.email !== normalizedEmail
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email verification is invalid. Please verify the email again",
      });
    }

    const parsedStateCode = Number(stateCode);
    const parsedDistrictCode = Number(districtCode);
    const parsedSubDistrictCode =
      Number(subDistrictCode);
    const parsedPanchayatCode =
      Number(panchayatCode);

    if (
      Number.isNaN(parsedStateCode) ||
      Number.isNaN(parsedDistrictCode) ||
      Number.isNaN(parsedSubDistrictCode) ||
      Number.isNaN(parsedPanchayatCode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid location codes",
      });
    }

    // 1. Validate STATE
    const state = await State.findOne({
      stateCode: parsedStateCode,
    }).lean();

    if (!state) {
      return res.status(400).json({
        success: false,
        message: "Invalid State",
      });
    }

    // 2. Validate DISTRICT belongs to STATE
    const district = await District.findOne({
      districtCode: parsedDistrictCode,
      stateCode: parsedStateCode,
    }).lean();

    if (!district) {
      return res.status(400).json({
        success: false,
        message:
          "Selected District does not belong to selected State",
      });
    }

    // 3. Validate SUB-DISTRICT belongs to DISTRICT
    const subDistrict = await SubDistrict.findOne({
      subDistrictCode: parsedSubDistrictCode,
      districtCode: parsedDistrictCode,
      stateCode: parsedStateCode,
    }).lean();

    if (!subDistrict) {
      return res.status(400).json({
        success: false,
        message:
          "Selected Sub-District does not belong to selected District",
      });
    }

    
    // 4. Validate PANCHAYAT exists in STATE
    const panchayat = await Panchayat.findOne({
      panchayatCode: parsedPanchayatCode,
      stateCode: parsedStateCode,
    }).lean();

    if (!panchayat) {
      return res.status(400).json({
        success: false,
        message: "Invalid Panchayat",
      });
    }

    // 5. PANCHAYAT → SUB-DISTRICT mapping
    const panchayatMapping =
      await PanchayatVillage.findOne({
        panchayatCode: parsedPanchayatCode,
        subDistrictCode: parsedSubDistrictCode,
      }).lean();

    if (!panchayatMapping) {
      return res.status(400).json({
        success: false,
        message:
          "Selected Panchayat does not belong to selected Sub-District",
      });
    }

    // 6. Verify Panchayat → Village mapping
    const villageMapping =
      await PanchayatVillage.findOne({
        panchayatCode: parsedPanchayatCode,
        subDistrictCode: parsedSubDistrictCode,
      }).lean();

    if (!villageMapping) {
      return res.status(400).json({
        success: false,
        message: "Invalid Panchayat mapping",
      });
    }

    // 7. Duplicate EMAIL
    const existingEmail = await Admin.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Admin with this email already exists",
      });
    }

    // 8. Duplicate PHONE
    const existingPhone = await Admin.findOne({
      phone: phone.trim(),
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message:
          "Admin with this phone number already exists",
      });
    }

    // 9. Only ONE ACTIVE ADMIN per PANCHAYAT
    const existingPanchayatAdmin =
      await Admin.findOne({
        panchayatCode: parsedPanchayatCode,
        status: "active",
      });

    if (existingPanchayatAdmin) {
      return res.status(400).json({
        success: false,
        message:
          "This Panchayat already has an active Admin",
      });
    }

    // 10. Profile Photo
    const profilePhoto = req.file
      ? req.file.path
      : "";

      const profilePhotoPublicId = req.file
      ? req.file.filename
      : "";

    // 11. Create Admin
    const admin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),

      password,

      profilePhoto,
      profilePhotoPublicId,

      state: state.stateName,
      stateCode: parsedStateCode,

      district: district.districtName,
      districtCode: parsedDistrictCode,

      subDistrict: subDistrict.subDistrictName,
      subDistrictCode: parsedSubDistrictCode,

      panchayat: panchayat.panchayatName,
      panchayatCode: parsedPanchayatCode,

      role: "admin",
      status: "active",

      // Email has already been verified before creation
      emailVerified: true,
    });

    // SEND ADMIN CREATION EMAIL
    try {
      await sendEmail({
        to: admin.email,

        subject:
          "Digital Village Project - Admin Account Created",

        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    >

    <title>Admin Account Created</title>

    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f3f4f6;
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
        }

        .wrapper {
            padding: 35px 15px;
        }

        .container {
            max-width: 650px;
            margin: auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(0,0,0,.08);
        }

        .header {
            background: linear-gradient(
                135deg,
                #4f46e5,
                #4338ca
            );
            color: #ffffff;
            text-align: center;
            padding: 32px 25px;
        }

        .header h1 {
            margin: 0;
            font-size: 25px;
        }

        .header p {
            margin: 8px 0 0;
            font-size: 14px;
            opacity: .9;
        }

        .content {
            padding: 32px;
        }

        .content h2 {
            margin-top: 0;
            color: #111827;
            font-size: 22px;
        }

        .content p {
            font-size: 15px;
            line-height: 1.7;
            color: #4b5563;
        }

        .success {
            margin: 22px 0;
            padding: 16px 18px;
            background: #ecfdf5;
            border-left: 4px solid #10b981;
            border-radius: 8px;
            color: #065f46;
            line-height: 1.6;
        }

        .location {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
        }

        .location td {
            border: 1px solid #e5e7eb;
            padding: 13px 15px;
            font-size: 14px;
        }

        .label {
            width: 35%;
            background: #f9fafb;
            font-weight: bold;
            color: #374151;
        }

        .value {
            color: #111827;
            font-weight: 500;
        }

        .login {
            margin-top: 24px;
            padding: 17px;
            background: #eef2ff;
            border: 1px solid #e0e7ff;
            border-radius: 9px;
            line-height: 1.7;
            color: #3730a3;
        }

        .footer {
            padding: 22px 30px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
            line-height: 1.6;
            text-align: center;
        }
    </style>
</head>

<body>

<div class="wrapper">

<div class="container">

    <div class="header">

        <h1>
            Digital Village Project
        </h1>

        <p>
            Jharkhand
        </p>

    </div>


    <div class="content">

        <h2>
            Admin Account Created Successfully
        </h2>

        <p>
            Dear <strong>${admin.name}</strong>,
        </p>

        <p>
            Your administrator account has been successfully
            created for the
            <strong>Digital Village Project, Jharkhand</strong>.
        </p>


        <div class="success">

            <strong>
                ✓ Your email address has been verified.
            </strong>

            <br>

            Your Admin account is now active and ready to use.

        </div>


        <p>
            You have been assigned responsibility for the
            following Panchayat:
        </p>


        <table class="location">

            <tr>
                <td class="label">State</td>
                <td class="value">${admin.state}</td>
            </tr>

            <tr>
                <td class="label">District</td>
                <td class="value">${admin.district}</td>
            </tr>

            <tr>
                <td class="label">Sub-District</td>
                <td class="value">${admin.subDistrict}</td>
            </tr>

            <tr>
                <td class="label">Panchayat</td>
                <td class="value">
                    <strong>${admin.panchayat}</strong>
                </td>
            </tr>

        </table>


        <div class="login">

            You can now access the
            <strong>
                Digital Village Project Admin Panel
            </strong>
            using your registered email/phone and password.

        </div>


        <p>
            Please keep your login credentials secure.
            Never share your password with anyone.
        </p>


        <p>
            If you believe this account was created incorrectly,
            please contact the Digital Village Project Super Admin.
        </p>


        <p style="margin-top: 28px;">

            Regards,<br>

            <strong>
                Digital Village Project, Jharkhand
            </strong>

            <br>

            Super Admin

        </p>

    </div>


    <div class="footer">

        This is an automated email from the
        <strong>
            Digital Village Project, Jharkhand
        </strong>
        system.

        <br>

        Please do not reply directly to this email.

    </div>

</div>

</div>

</body>
</html>
        `,
      });

      console.log(
        `Admin creation email sent to: ${admin.email}`
      );
    } catch (emailError) {
      console.error(
        "Admin created but email sending failed:",
        emailError.message
      );
    }


    // SUCCESS
    return res.status(201).json({
      success: true,
      message: "Admin created successfully",

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
        subDistrictCode:
          admin.subDistrictCode,

        panchayat: admin.panchayat,
        panchayatCode:
          admin.panchayatCode,

        role: admin.role,
        status: admin.status,
      },
    });
  } catch (error) {
    console.error("Create Admin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Admin",
      error: error.message,
    });
  }
};


// SEND EDIT ADMIN EMAIL OTP
const sendEditAdminEmailOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Same email does not require verification
    if (normalizedEmail === admin.email) {
      return res.status(200).json({
        success: true,
        message:
          "This is already the Admin's current email address",
        emailVerified: admin.emailVerified === true,
      });
    }

    const emailExists = await Admin.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message:
          "Another Admin already uses this email",
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = getOtpExpiry();

    admin.pendingEmail = normalizedEmail;
    admin.emailChangeOtpHash = otpHash;
    admin.emailChangeOtpExpiresAt =
      expiresAt;

    await admin.save();

    await sendEmail({
      to: normalizedEmail,

      subject:
        "Verify Your New Email - Digital Village Project",

      html: buildVerificationEmail({
        otp,
        email: normalizedEmail,
        purpose: "edit",
      }),
    });

    return res.status(200).json({
      success: true,
      message:
        "A 6-digit verification code has been sent to the new email address",
    });
  } catch (error) {
    console.error(
      "Send Edit Admin Email OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send email verification code",
    });
  }
};


// VERIFY EDIT ADMIN EMAIL OTP
const verifyEditAdminEmailOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, otp } = req.body;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!otp || !/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit OTP",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (
      !admin.pendingEmail ||
      admin.pendingEmail !== normalizedEmail
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This email verification request is no longer valid",
      });
    }

    if (
      !admin.emailChangeOtpHash ||
      !admin.emailChangeOtpExpiresAt
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No active OTP found. Please request a new OTP",
      });
    }

    if (
      new Date(
        admin.emailChangeOtpExpiresAt
      ).getTime() < Date.now()
    ) {
      admin.emailChangeOtpHash = null;
      admin.emailChangeOtpExpiresAt = null;

      await admin.save();

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new verification code",
      });
    }

    const otpMatched = await bcrypt.compare(
      String(otp),
      admin.emailChangeOtpHash
    );

    if (!otpMatched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP. Please try again",
      });
    }

    
    // Mark the new email as verified. The actual email is changed only during PUT update.
    admin.emailVerified = true;

    admin.emailChangeOtpHash = null;
    admin.emailChangeOtpExpiresAt = null;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "New email verified successfully",
      emailVerified: true,
      verifiedEmail: normalizedEmail,
    });
  } catch (error) {
    console.error(
      "Verify Edit Admin Email OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify email",
    });
  }
};


// GET ALL ADMINS
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.error(
      "Get All Admins Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admins",
      error: error.message,
    });
  }
};
 

// GET ADMIN BY ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id)
      .select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error(
      "Get Admin By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin",
      error: error.message,
    });
  }
};


// UPDATE ADMIN
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const {
      name,
      email,
      phone,
      stateCode,
      districtCode,
      subDistrictCode,
      panchayatCode,
      password,
      status,
    } = req.body;

    // Basic fields
    if (name !== undefined) {
      admin.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail =
        email.trim().toLowerCase();

      
      // EMAIL HAS NOT CHANGED
      if (normalizedEmail !== admin.email) {
        const emailExists = await Admin.findOne({
          email: normalizedEmail,
          _id: { $ne: id },
        });

        if (emailExists) {
          return res.status(400).json({
            success: false,
            message:
              "Another Admin already uses this email",
          });
        }

        // NEW EMAIL MUST BE VERIFIED
        if (
          admin.pendingEmail !== normalizedEmail ||
          admin.emailVerified !== true
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Please verify the new email address before saving",
          });
        }

        admin.email = normalizedEmail;

        // Clear pending email after successful change
        admin.pendingEmail = null;
        admin.emailVerified = true;
      }
    }

    if (phone !== undefined) {
      const normalizedPhone = phone.trim();

      const phoneExists = await Admin.findOne({
        phone: normalizedPhone,
        _id: { $ne: id },
      });

      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message:
            "Another Admin already uses this phone number",
        });
      }

      admin.phone = normalizedPhone;
    }

    // Location update
    if (
      stateCode !== undefined ||
      districtCode !== undefined ||
      subDistrictCode !== undefined ||
      panchayatCode !== undefined
    ) {
      const parsedStateCode = Number(
        stateCode !== undefined
          ? stateCode
          : admin.stateCode
      );

      const parsedDistrictCode = Number(
        districtCode !== undefined
          ? districtCode
          : admin.districtCode
      );

      const parsedSubDistrictCode = Number(
        subDistrictCode !== undefined
          ? subDistrictCode
          : admin.subDistrictCode
      );

      const parsedPanchayatCode = Number(
        panchayatCode !== undefined
          ? panchayatCode
          : admin.panchayatCode
      );

      // State
      const state = await State.findOne({
        stateCode: parsedStateCode,
      }).lean();

      if (!state) {
        return res.status(400).json({
          success: false,
          message: "Invalid State",
        });
      }

      // District → State
      const district = await District.findOne({
        districtCode: parsedDistrictCode,
        stateCode: parsedStateCode,
      }).lean();

      if (!district) {
        return res.status(400).json({
          success: false,
          message:
            "Selected District does not belong to selected State",
        });
      }

      // SubDistrict → District
      const subDistrict =
        await SubDistrict.findOne({
          subDistrictCode:
            parsedSubDistrictCode,
          districtCode:
            parsedDistrictCode,
          stateCode:
            parsedStateCode,
        }).lean();

      if (!subDistrict) {
        return res.status(400).json({
          success: false,
          message:
            "Selected Sub-District does not belong to selected District",
        });
      }

      // Panchayat
      const panchayat =
        await Panchayat.findOne({
          panchayatCode:
            parsedPanchayatCode,
          stateCode:
            parsedStateCode,
        }).lean();

      if (!panchayat) {
        return res.status(400).json({
          success: false,
          message: "Invalid Panchayat",
        });
      }

      // Panchayat → SubDistrict mapping
      const mapping =
        await PanchayatVillage.findOne({
          panchayatCode:
            parsedPanchayatCode,
          subDistrictCode:
            parsedSubDistrictCode,
        }).lean();

      if (!mapping) {
        return res.status(400).json({
          success: false,
          message:
            "Selected Panchayat does not belong to selected Sub-District",
        });
      }

      // Update location information
      admin.state = state.stateName;
      admin.stateCode = parsedStateCode;

      admin.district =
        district.districtName;
      admin.districtCode =
        parsedDistrictCode;

      admin.subDistrict =
        subDistrict.subDistrictName;
      admin.subDistrictCode =
        parsedSubDistrictCode;

      admin.panchayat =
        panchayat.panchayatName;
      admin.panchayatCode =
        parsedPanchayatCode;
    }

    // Password
    if (
      password !== undefined &&
      password.trim() !== ""
    ) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 8 characters",
        });
      }

      admin.password = password;
    }

    // Status
    if (status !== undefined) {
      if (
        !["active", "inactive"].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      admin.status = status;
    }

    // Profile Photo
     if (req.file) {
  // Delete old profile photo from Cloudinary
  if (admin.profilePhotoPublicId) {
    await cloudinary.uploader.destroy(
      admin.profilePhotoPublicId
    );
  }

  // Save new profile photo details
  admin.profilePhoto = req.file.path;
  admin.profilePhotoPublicId =
    req.file.filename;
       }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        profilePhoto:
          admin.profilePhoto,

        state: admin.state,
        stateCode:
          admin.stateCode,

        district:
          admin.district,
        districtCode:
          admin.districtCode,

        subDistrict:
          admin.subDistrict,
        subDistrictCode:
          admin.subDistrictCode,

        panchayat:
          admin.panchayat,
        panchayatCode:
          admin.panchayatCode,

        role: admin.role,
        status: admin.status,
      },
    });
  } catch (error) {
    console.error(
      "Update Admin Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update Admin",
      error: error.message,
    });
  }
};
 

// DELETE ADMIN
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Delete notices created by this admin
    await Notice.deleteMany({
      createdBy: admin._id,
    });

  
    // Delete schemes created by this admin
    await Scheme.deleteMany({
      createdBy: admin._id,
    });

    // Delete admin profile photo from Cloudinary
if (admin.profilePhotoPublicId) {
  await cloudinary.uploader.destroy(
    admin.profilePhotoPublicId
  );
}

    // Delete admin account
    await Admin.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete admin",
      error: error.message,
    });
  }
};


// TOGGLE ADMIN STATUS
const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.status =
      admin.status === "active"
        ? "inactive"
        : "active";

    await admin.save();

    return res.status(200).json({
      success: true,
      message: `Admin ${
        admin.status === "active"
          ? "activated"
          : "deactivated"
      } successfully`,
      status: admin.status,
    });
  } catch (error) {
    console.error(
      "Toggle Admin Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to change Admin status",
      error: error.message,
    });
  }
};

// EXPORTS
module.exports = {
  createAdmin,

  sendCreateAdminEmailOtp,
  verifyCreateAdminEmailOtp,

  sendEditAdminEmailOtp,
  verifyEditAdminEmailOtp,

  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
};