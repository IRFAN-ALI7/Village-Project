import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Upload,
  X,
} from "lucide-react";

import SuperAdminLayout from "../../../components/super-admin/layout/SuperAdminLayout";
import API_URL from "../../../config/api";

const STATE_CODE = 20;
const STATE_NAME = "Jharkhand";

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder,
  error,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none px-3 py-2.5 pr-9 border rounded-lg text-sm bg-white outline-none transition-all
            ${
              error
                ? "border-red-400 focus:ring-2 focus:ring-red-200"
                : "border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            }
            ${
              disabled
                ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                : "text-gray-700"
            }
          `}
        >
          <option value="">
            {disabled
              ? "— Select above first —"
              : placeholder || `Select ${label}`}
          </option>

          {options.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CreateAdmin() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ======================================================
  // FORM
  // ======================================================

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",

    stateCode: STATE_CODE,

    districtCode: "",
    districtName: "",

    subDistrictCode: "",
    subDistrictName: "",

    panchayatCode: "",
    panchayatName: "",

    password: "",
    confirmPassword: "",
  });

  // ======================================================
  // EMAIL VERIFICATION
  // ======================================================

  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] =
    useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const [emailVerificationError, setEmailVerificationError] =
    useState("");

  const [emailVerificationMessage, setEmailVerificationMessage] =
    useState("");

  // ======================================================
  // LOCATION DATA
  // ======================================================

  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [panchayats, setPanchayats] = useState([]);

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubDistricts, setLoadingSubDistricts] =
    useState(false);
  const [loadingPanchayats, setLoadingPanchayats] =
    useState(false);

  const [locationError, setLocationError] = useState("");

  // ======================================================
  // OTHER STATES
  // ======================================================

  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ======================================================
  // TOKEN
  // ======================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ======================================================
  // SEND CREATE ADMIN EMAIL OTP
  // ======================================================

  const handleSendEmailOtp = async () => {
    setEmailVerificationError("");
    setEmailVerificationMessage("");

    const email = form.email.trim().toLowerCase();

    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: "Email is required",
      }));

      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Valid email is required",
      }));

      return;
    }

    const token = getToken();

    if (!token) {
      setEmailVerificationError(
        "Super Admin session expired. Please login again."
      );
      return;
    }

    setOtpLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/super-admin/admins/verify-email/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to send verification code"
        );
      }

      setOtpSent(true);
      setOtp("");
      setEmailVerified(false);
      setEmailVerificationToken("");

      setEmailVerificationMessage(
        "A 6-digit verification code has been sent to your email."
      );
    } catch (error) {
      console.error(
        "Send Email OTP Error:",
        error
      );

      setEmailVerificationError(
        error.message ||
          "Unable to send verification code"
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // ======================================================
  // VERIFY CREATE ADMIN EMAIL OTP
  // ======================================================

  const handleVerifyEmailOtp = async () => {
    setEmailVerificationError("");
    setEmailVerificationMessage("");

    const email = form.email.trim().toLowerCase();

    if (!/^\d{6}$/.test(otp)) {
      setEmailVerificationError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setEmailVerificationError(
        "Super Admin session expired. Please login again."
      );
      return;
    }

    setOtpVerifying(true);

    try {
      const response = await fetch(
        `${API_URL}/super-admin/admins/verify-email/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Invalid verification code"
        );
      }

      setEmailVerified(true);
      setEmailVerificationToken(
        data.verificationToken || ""
      );
      setOtp("");
      setEmailVerificationMessage(
        "Email address verified successfully."
      );
      setEmailVerificationError("");
    } catch (error) {
      console.error(
        "Verify Email OTP Error:",
        error
      );

      setEmailVerified(false);
      setEmailVerificationToken("");

      setEmailVerificationError(
        error.message ||
          "Unable to verify email address"
      );
    } finally {
      setOtpVerifying(false);
    }
  };

  // ======================================================
  // LOAD DISTRICTS
  // ======================================================

  useEffect(() => {
    const loadDistricts = async () => {
      setLoadingDistricts(true);
      setLocationError("");

      try {
        const token = getToken();

        const response = await fetch(
          `${API_URL}/api/locations/states/${STATE_CODE}/districts`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load districts"
          );
        }

        setDistricts(data.data || []);
      } catch (error) {
        console.error(
          "Load Districts Error:",
          error
        );

        setLocationError(
          error.message || "Unable to load districts"
        );
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, []);

  // ======================================================
  // LOAD SUB-DISTRICTS
  // ======================================================

  useEffect(() => {
    if (!form.districtCode) {
      setSubDistricts([]);
      return;
    }

    const loadSubDistricts = async () => {
      setLoadingSubDistricts(true);
      setLocationError("");

      try {
        const token = getToken();

        const response = await fetch(
          `${API_URL}/api/locations/districts/${form.districtCode}/subdistricts`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load sub-districts"
          );
        }

        setSubDistricts(data.data || []);
      } catch (error) {
        console.error(
          "Load SubDistricts Error:",
          error
        );

        setLocationError(
          error.message ||
            "Unable to load sub-districts"
        );
      } finally {
        setLoadingSubDistricts(false);
      }
    };

    loadSubDistricts();
  }, [form.districtCode]);

  // ======================================================
  // LOAD PANCHAYATS
  // ======================================================

  useEffect(() => {
    if (!form.subDistrictCode) {
      setPanchayats([]);
      return;
    }

    const loadPanchayats = async () => {
      setLoadingPanchayats(true);
      setLocationError("");

      try {
        const token = getToken();

        const response = await fetch(
          `${API_URL}/api/locations/subdistricts/${form.subDistrictCode}/panchayats`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load panchayats"
          );
        }

        setPanchayats(data.data || []);
      } catch (error) {
        console.error(
          "Load Panchayats Error:",
          error
        );

        setLocationError(
          error.message ||
            "Unable to load panchayats"
        );
      } finally {
        setLoadingPanchayats(false);
      }
    };

    loadPanchayats();
  }, [form.subDistrictCode]);

  // ======================================================
  // LOCATION SELECT
  // ======================================================

  const handleDistrictChange = (code) => {
    const selected = districts.find(
      (item) =>
        String(item.districtCode) === String(code)
    );

    setForm((prev) => ({
      ...prev,

      districtCode: code,
      districtName:
        selected?.districtName || "",

      subDistrictCode: "",
      subDistrictName: "",

      panchayatCode: "",
      panchayatName: "",
    }));

    setErrors((prev) => ({
      ...prev,
      district: "",
      subDistrict: "",
      panchayat: "",
    }));
  };

  const handleSubDistrictChange = (code) => {
    const selected = subDistricts.find(
      (item) =>
        String(item.subDistrictCode) ===
        String(code)
    );

    setForm((prev) => ({
      ...prev,

      subDistrictCode: code,
      subDistrictName:
        selected?.subDistrictName || "",

      panchayatCode: "",
      panchayatName: "",
    }));

    setErrors((prev) => ({
      ...prev,
      subDistrict: "",
      panchayat: "",
    }));
  };

  const handlePanchayatChange = (code) => {
    const selected = panchayats.find(
      (item) =>
        String(item.panchayatCode) ===
        String(code)
    );

    setForm((prev) => ({
      ...prev,

      panchayatCode: code,
      panchayatName:
        selected?.panchayatName || "",
    }));

    setErrors((prev) => ({
      ...prev,
      panchayat: "",
    }));
  };

  // ======================================================
  // PHOTO
  // ======================================================

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setServerError("");

    // Only JPG/JPEG/PNG
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        profilePhoto:
          "Only JPG, JPEG or PNG image is allowed",
      }));

      e.target.value = "";
      return;
    }

    // 2MB
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profilePhoto:
          "Profile photo must be less than 2MB",
      }));

      e.target.value = "";
      return;
    }

    setErrors((prev) => ({
      ...prev,
      profilePhoto: "",
    }));

    setPhotoFile(file);

    const previewUrl = URL.createObjectURL(file);
    setPhotoUrl(previewUrl);
  };

  // ======================================================
  // FORM VALIDATION
  // ======================================================

  const validate = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Name is required";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      e.email = "Valid email is required";
    }

    if (!form.phone.trim()) {
      e.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      e.phone =
        "Phone number must be exactly 10 digits";
    }

    if (!form.districtCode) {
      e.district = "District is required";
    }

    if (!form.subDistrictCode) {
      e.subDistrict =
        "Sub-District is required";
    }

    if (!form.panchayatCode) {
      e.panchayat = "Panchayat is required";
    }

    if (!form.password) {
      e.password = "Password is required";
    } else if (form.password.length < 8) {
      e.password =
        "Password must be at least 8 characters";
    }

    if (!form.confirmPassword) {
      e.confirmPassword =
        "Please confirm your password";
    } else if (
      form.password !== form.confirmPassword
    ) {
      e.confirmPassword =
        "Passwords do not match";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  // ======================================================
  // INPUT CHANGE
  // ======================================================

  const handleInputChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    setServerError("");

    // ==================================================
    // EMAIL CHANGE => RESET VERIFICATION
    // ==================================================

    if (field === "email") {
      setEmailVerified(false);
      setEmailVerificationToken("");
      setOtp("");
      setOtpSent(false);
      setEmailVerificationError("");
      setEmailVerificationMessage("");
    }
  };

  // ======================================================
  // CREATE ADMIN
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    if (!validate()) {
      return;
    }

    // ==================================================
    // EMAIL MUST BE VERIFIED
    // ==================================================

    if (!emailVerified || !emailVerificationToken) {
      setServerError(
        "Please verify the Admin email address before creating the Admin."
      );

      return;
    }

    const token = getToken();

    if (!token) {
      setServerError(
        "Super Admin session expired. Please login again."
      );
      return;
    }

    setLoading(true);

    try {
      // ==================================================
      // IMPORTANT:
      // Photo + all fields => FormData
      // ==================================================

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "email",
        form.email.trim().toLowerCase()
      );

      formData.append(
        "phone",
        form.phone.trim()
      );

      formData.append(
        "stateCode",
        String(form.stateCode)
      );

      formData.append(
        "districtCode",
        String(form.districtCode)
      );

      formData.append(
        "subDistrictCode",
        String(form.subDistrictCode)
      );

      formData.append(
        "panchayatCode",
        String(form.panchayatCode)
      );

      formData.append(
        "password",
        form.password
      );

      // ==================================================
      // EMAIL VERIFICATION TOKEN
      // ==================================================

      formData.append(
        "emailVerificationToken",
        emailVerificationToken
      );

      // Profile photo
      if (photoFile) {
        formData.append(
          "profilePhoto",
          photoFile
        );
      }

      const response = await fetch(
        `${API_URL}/super-admin/admins`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          // DO NOT set Content-Type manually.
          // Browser automatically sets multipart/form-data boundary.
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Admin creation failed"
        );
      }

      console.log(
        "Admin created successfully:",
        data
      );

      setSuccess(true);
    } catch (error) {
      console.error(
        "Create Admin Error:",
        error
      );

      setServerError(
        error.message ||
          "Unable to create admin"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // ERROR COMPONENT
  // ======================================================

  const fieldErr = (key) => {
    if (!errors[key]) return null;

    return (
      <p className="mt-1 text-xs text-red-600">
        {errors[key]}
      </p>
    );
  };

  // ======================================================
  // RESET FORM
  // ======================================================

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",

      stateCode: STATE_CODE,

      districtCode: "",
      districtName: "",

      subDistrictCode: "",
      subDistrictName: "",

      panchayatCode: "",
      panchayatName: "",

      password: "",
      confirmPassword: "",
    });

    setPhotoFile(null);
    setPhotoUrl("");

    setEmailVerified(false);
    setEmailVerificationToken("");
    setOtp("");
    setOtpSent(false);
    setOtpLoading(false);
    setOtpVerifying(false);
    setEmailVerificationError("");
    setEmailVerificationMessage("");

    setErrors({});
    setServerError("");
    setSuccess(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <SuperAdminLayout
      breadcrumbs={[
        {
          label: "Admins",
          path: "/super-admin/admins",
        },
        {
          label: "Create Admin",
        },
      ]}
    >
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
              <h2 className="text-white font-bold">
                Personal Information
              </h2>
            </div>

            <div className="p-5 space-y-4">
              {/* PHOTO */}

              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={handlePhotoChange}
                />

                <div
                  className="relative w-16 h-16 rounded-xl overflow-hidden cursor-pointer group shrink-0 border-2 border-dashed border-indigo-300"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-indigo-400" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Profile Photo
                  </p>

                  <p className="text-xs text-gray-400">
                    JPG or PNG, max 2MB
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="mt-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {photoUrl
                      ? "Change Photo"
                      : "Upload Photo"}
                  </button>

                  {fieldErr("profilePhoto")}
                </div>
              </div>

              {/* NAME / EMAIL / PHONE */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      handleInputChange(
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Enter full name"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />

                  {fieldErr("name")}
                </div>

                {/* ==================================================
                    EMAIL VERIFICATION
                ================================================== */}

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address *
                  </label>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        value={form.email}
                        disabled={emailVerified}
                        onChange={(e) =>
                          handleInputChange(
                            "email",
                            e.target.value
                          )
                        }
                        placeholder="admin@portal.gov.in"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-all
                          ${
                            emailVerified
                              ? "border-green-300 bg-green-50 text-green-700 pr-10"
                              : "border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          }
                        `}
                      />

                      {emailVerified && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                      )}
                    </div>

                    {!emailVerified && (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={
                          otpLoading ||
                          !form.email.trim()
                        }
                        className="shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        {otpLoading
                          ? "Sending..."
                          : otpSent
                          ? "Resend OTP"
                          : "Verify Email"}
                      </button>
                    )}
                  </div>

                  {fieldErr("email")}

                  {/* ==================================================
                      EMAIL VERIFIED
                  ================================================== */}

                  {emailVerified && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />

                      <p className="text-xs font-semibold text-green-700">
                        Email Verified ✓
                      </p>
                    </div>
                  )}

                  {/* ==================================================
                      OTP BOX
                  ================================================== */}

                  {!emailVerified && otpSent && (
                    <div className="mt-3 p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                          <CheckCircle className="h-5 w-5 text-indigo-600" />
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">
                            Enter Verification Code
                          </p>

                          <p className="text-xs text-gray-500 mt-0.5">
                            We have sent a 6-digit OTP to{" "}
                            <span className="font-semibold text-gray-700">
                              {form.email
                                .trim()
                                .toLowerCase()}
                            </span>
                            .
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => {
                            setOtp(
                              e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6)
                            );

                            setEmailVerificationError(
                              ""
                            );
                          }}
                          placeholder="Enter 6-digit OTP"
                          className="flex-1 px-3 py-2.5 border border-indigo-200 bg-white rounded-lg text-sm tracking-[0.25em] font-semibold text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />

                        <button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          disabled={
                            otpVerifying ||
                            otp.length !== 6
                          }
                          className="shrink-0 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          {otpVerifying
                            ? "Verifying..."
                            : "Verify OTP"}
                        </button>
                      </div>

                      <p className="mt-2 text-[11px] text-gray-400">
                        OTP is valid for 10 minutes. Please
                        check your inbox and spam folder.
                      </p>
                    </div>
                  )}

                  {/* ==================================================
                      EMAIL VERIFICATION SUCCESS MESSAGE
                  ================================================== */}

                  {emailVerificationMessage &&
                    !emailVerified && (
                      <p className="mt-2 text-xs text-green-600">
                        {emailVerificationMessage}
                      </p>
                    )}

                  {/* ==================================================
                      EMAIL VERIFICATION ERROR
                  ================================================== */}

                  {emailVerificationError && (
                    <p className="mt-2 text-xs text-red-600">
                      {emailVerificationError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      handleInputChange(
                        "phone",
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />

                  {fieldErr("phone")}
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              PANCHAYAT ASSIGNMENT
          ================================================== */}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
              <h2 className="text-white font-bold">
                Panchayat Assignment
              </h2>

              <p className="text-indigo-200 text-xs mt-0.5">
                Each admin is assigned to exactly one panchayat
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* STATE */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  State
                </label>

                <div className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 font-medium">
                  {STATE_NAME}

                  <span className="text-xs text-gray-400 ml-1">
                    (fixed)
                  </span>
                </div>
              </div>

              {/* LOCATION */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField
                  label="District *"
                  value={form.districtCode}
                  onChange={handleDistrictChange}
                  options={districts.map((item) => ({
                    code: item.districtCode,
                    name: item.districtName,
                  }))}
                  disabled={
                    loadingDistricts ||
                    districts.length === 0
                  }
                  placeholder={
                    loadingDistricts
                      ? "Loading districts..."
                      : "Select District"
                  }
                  error={errors.district}
                />

                <SelectField
                  label="Sub-District *"
                  value={form.subDistrictCode}
                  onChange={handleSubDistrictChange}
                  options={subDistricts.map(
                    (item) => ({
                      code:
                        item.subDistrictCode,
                      name:
                        item.subDistrictName,
                    })
                  )}
                  disabled={
                    !form.districtCode ||
                    loadingSubDistricts
                  }
                  placeholder={
                    loadingSubDistricts
                      ? "Loading..."
                      : "Select Sub-District"
                  }
                  error={errors.subDistrict}
                />

                <SelectField
                  label="Panchayat *"
                  value={form.panchayatCode}
                  onChange={handlePanchayatChange}
                  options={panchayats.map(
                    (item) => ({
                      code:
                        item.panchayatCode,
                      name:
                        item.panchayatName,
                    })
                  )}
                  disabled={
                    !form.subDistrictCode ||
                    loadingPanchayats
                  }
                  placeholder={
                    loadingPanchayats
                      ? "Loading..."
                      : "Select Panchayat"
                  }
                  error={errors.panchayat}
                />
              </div>

              {/* LOCATION API ERROR */}

              {locationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {locationError}
                </div>
              )}
            </div>
          </div>

          {/* ==================================================
              PASSWORD
          ================================================== */}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
              <h2 className="text-white font-bold">
                Set Password
              </h2>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PASSWORD */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Password *
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPw
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={(e) =>
                        handleInputChange(
                          "password",
                          e.target.value
                        )
                      }
                      placeholder="Min 8 characters"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPw(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {fieldErr("password")}
                </div>

                {/* CONFIRM PASSWORD */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Confirm Password *
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showCpw
                          ? "text"
                          : "password"
                      }
                      value={
                        form.confirmPassword
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "confirmPassword",
                          e.target.value
                        )
                      }
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCpw(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showCpw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {fieldErr(
                    "confirmPassword"
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                An account creation email will be sent
                to the admin after successful account creation.
              </p>
            </div>
          </div>

          {/* SERVER ERROR */}

          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {serverError}
            </div>
          )}

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg text-sm transition-colors shadow-sm"
            >
              {loading
                ? "Creating Admin..."
                : "Create Admin"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                navigate(
                  "/super-admin/admins"
                )
              }
              className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* ==================================================
          SUCCESS MODAL
      ================================================== */}

      {success && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-9 w-9 text-green-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Admin Created!
            </h3>

            <p className="text-gray-600 text-sm mb-1">
              <span className="font-semibold">
                {form.name}
              </span>{" "}
              has been assigned to
            </p>

            <p className="text-indigo-700 font-bold text-sm mb-3">
              {form.panchayatName}
            </p>

            <p className="text-gray-500 text-xs mb-6">
              The admin account has been created
              successfully and an account creation
              email has been sent to{" "}
              <span className="font-semibold">
                {form.email}
              </span>
              .
            </p>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  navigate(
                    "/super-admin/admins"
                  )
                }
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold text-sm"
              >
                View Admins
              </button>

              <button
                onClick={resetForm}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold text-sm"
              >
                <X className="h-4 w-4 inline mr-1" />
                Create Another
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}