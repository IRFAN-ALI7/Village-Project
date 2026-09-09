import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  CheckCircle,
  X,
  Upload,
  KeyRound,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import SuperAdminLayout from "../../../components/super-admin/layout/SuperAdminLayout";
import API_URL from "../../../config/api";

function InfoCard({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-50 last:border-0 gap-1">
      <span className="sm:w-40 text-xs font-bold text-gray-400 uppercase tracking-wide">
        {label}
      </span>

      <span className="text-sm text-gray-800 font-medium">
        {value || "—"}
      </span>
    </div>
  );
}

export default function SuperAdminProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState(null);

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // EMAIL VERIFICATION
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  // Get token
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Logout on unauthorized
  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("superAdmin");

    navigate("/super-admin/login", {
      replace: true,
    });
  };

  // Fetch profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/super-admin/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch profile"
        );
      }

      const data = result.superAdmin;

      setProfileData(data);

      setEditData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });

      setPhotoUrl(data.profileImage || "");
    } catch (err) {
      console.error(
        "Fetch Super Admin Profile Error:",
        err
      );

      setError(
        err.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // OTP resend countdown
  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = setInterval(() => {
      setResendSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendSeconds]);

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    // Phone number validation
    if (name === "phone") {
      updatedValue = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    setEditData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    setError("");
    setSaved(false);

    // Email changed after verification
    if (name === "email") {
      const newEmail = updatedValue
        .trim()
        .toLowerCase();

      const currentEmail = (
        profileData?.email || ""
      )
        .trim()
        .toLowerCase();

      setEmailVerified(
        newEmail === currentEmail
      );

      if (
        verificationEmail &&
        newEmail !==
          verificationEmail.trim().toLowerCase()
      ) {
        setOtpModalOpen(false);
        setOtp("");
        setOtpError("");
        setOtpMessage("");
        setVerificationEmail("");
        setResendSeconds(0);
      }
    }
  };

  // Start editing
  const handleEdit = () => {
    if (!profileData) return;

    setEditData({
      name: profileData.name || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
    });

    setSelectedPhoto(null);
    setPhotoUrl(profileData.profileImage || "");

    setEmailVerified(true);
    setVerificationEmail("");
    setOtp("");
    setOtpError("");
    setOtpMessage("");
    setOtpModalOpen(false);
    setResendSeconds(0);

    setError("");
    setSaved(false);
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancel = () => {
    if (profileData) {
      setEditData({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
      });

      setPhotoUrl(profileData.profileImage || "");
    }

    setSelectedPhoto(null);

    setEmailVerified(false);
    setVerificationEmail("");
    setOtp("");
    setOtpError("");
    setOtpMessage("");
    setOtpModalOpen(false);
    setResendSeconds(0);

    setError("");
    setIsEditing(false);
  };

  // Select profile photo
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    // 2 MB frontend validation
    if (file.size > 2 * 1024 * 1024) {
      setError(
        "Profile image must be less than 2 MB."
      );
      return;
    }

    setSelectedPhoto(file);
    setError("");
    setSaved(false);

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setPhotoUrl(previewUrl);
  };

  // Request email verification OTP
  const requestEmailVerification = async () => {
    const newEmail = editData.email
      .trim()
      .toLowerCase();

    if (!newEmail) {
      toast.error("Email is required.");
      return;
    }

    // Email format validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const currentEmail = (
      profileData?.email || ""
    )
      .trim()
      .toLowerCase();

    if (newEmail === currentEmail) {
      setEmailVerified(true);
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      setOtpMessage("");

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/super-admin/profile/request-email-change`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: newEmail,
          }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to send verification OTP."
        );
      }

      setVerificationEmail(newEmail);
      setOtp("");
      setOtpError("");
      setOtpMessage(
        result.message ||
          "Verification OTP has been sent to your new email."
      );

      // Show OTP section below email
      setOtpModalOpen(true);
      setResendSeconds(60);

      toast.success(
        "Verification OTP sent to your new email."
      );
    } catch (err) {
      console.error(
        "Request Super Admin Email Change Error:",
        err
      );

      setOtpError(
        err.message ||
          "Failed to send verification OTP."
      );

      toast.error(
        err.message ||
          "Failed to send verification OTP."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify email OTP
  const handleVerifyEmail = async () => {
    if (!verificationEmail) {
      toast.error(
        "Please request a verification OTP first."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setOtpError(
        "Please enter a valid 6-digit OTP."
      );

      toast.error(
        "Please enter a valid 6-digit OTP."
      );
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      setOtpMessage("");

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/super-admin/profile/verify-email-change`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: verificationEmail,
            otp,
          }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Email verification failed."
        );
      }

      const verifiedEmail =
        result.email || verificationEmail;

      setEmailVerified(true);

      setVerificationEmail(verifiedEmail);

      setEditData((prev) => ({
        ...prev,
        email: verifiedEmail,
      }));

      setProfileData((prev) => ({
        ...prev,
        email: verifiedEmail,
      }));

      setOtp("");
      setOtpError("");
      setOtpMessage(
        "Email verified successfully."
      );
      setResendSeconds(0);

      // Hide OTP section after verification
      setOtpModalOpen(false);

      // Update localStorage email immediately
      const storedSuperAdmin =
        localStorage.getItem("superAdmin");

      if (storedSuperAdmin) {
        try {
          const parsed =
            JSON.parse(storedSuperAdmin);

          localStorage.setItem(
            "superAdmin",
            JSON.stringify({
              ...parsed,
              email: verifiedEmail,
            })
          );
        } catch (storageError) {
          console.error(
            "Local storage email update error:",
            storageError
          );
        }
      }

      toast.success(
        "Email verified successfully."
      );
    } catch (err) {
      console.error(
        "Verify Super Admin Email Error:",
        err
      );

      setOtpError(
        err.message ||
          "Email verification failed."
      );

      toast.error(
        err.message ||
          "Email verification failed."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSaved(false);

    // Validation
    if (!editData.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!editData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!editData.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (editData.phone.trim().length !== 10) {
      setError(
        "Phone number must be exactly 10 digits."
      );
      return;
    }

    const currentEmail = (
      profileData?.email || ""
    )
      .trim()
      .toLowerCase();

    const newEmail = editData.email
      .trim()
      .toLowerCase();

    const emailChanged =
      newEmail !== currentEmail;

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      // Profile update + image upload
      const formData = new FormData();

      formData.append(
        "name",
        editData.name.trim()
      );

      // If email is not verified, keep old email
      // so other profile changes can still be saved.
      formData.append(
        "email",
        emailChanged && !emailVerified
          ? currentEmail
          : newEmail
      );

      formData.append(
        "phone",
        editData.phone.trim()
      );

      // Only append image if user selected a new one
      if (selectedPhoto) {
        formData.append(
          "profileImage",
          selectedPhoto
        );
      }

      const response = await fetch(
        `${API_URL}/super-admin/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update profile"
        );
      }

      const updatedData = result.superAdmin;

      // Update state
      setProfileData(updatedData);

      setEditData({
        name: updatedData.name || "",
        email: updatedData.email || "",
        phone: updatedData.phone || "",
      });

      setPhotoUrl(
        updatedData.profileImage || ""
      );

      setSelectedPhoto(null);

      setEmailVerified(
        (updatedData.email || "")
          .trim()
          .toLowerCase() ===
          newEmail
      );

      setVerificationEmail("");

      // Update localStorage Super Admin data
      const storedSuperAdmin =
        localStorage.getItem("superAdmin");

      if (storedSuperAdmin) {
        try {
          const parsed =
            JSON.parse(storedSuperAdmin);

          localStorage.setItem(
            "superAdmin",
            JSON.stringify({
              ...parsed,
              ...updatedData,
            })
          );
        } catch (storageError) {
          console.error(
            "Local storage update error:",
            storageError
          );
        }
      }

      setIsEditing(false);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      console.error(
        "Update Super Admin Profile Error:",
        err
      );

      setError(
        err.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // Format last login
  const formatLastLogin = (date) => {
    if (!date) return "Never";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  // Loading
  if (loading) {
    return (
      <SuperAdminLayout
        breadcrumbs={[
          { label: "Profile" },
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  // Profile not loaded
  if (!profileData) {
    return (
      <SuperAdminLayout
        breadcrumbs={[
          { label: "Profile" },
        ]}
      >
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-red-500 font-medium">
            {error || "Unable to load profile"}
          </p>

          <button
            onClick={fetchProfile}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout
      breadcrumbs={[
        { label: "Profile" },
      ]}
    >
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Super Admin Profile
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage your account information
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Success */}
        {saved && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />

            <span className="text-sm font-medium">
              Profile updated successfully.
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <X className="w-5 h-5" />

            <span className="text-sm font-medium">
              {error}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col items-center text-center">

              {/* Profile Image */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow">

                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Super Admin Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-blue-600">
                      {(profileData.name || "S")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}

                </div>

                {/* Upload Button */}
                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={saving}
                      className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow disabled:opacity-60"
                      title="Change photo"
                    >
                      <Upload className="w-4 h-4" />
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-800">
                {profileData.name}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {profileData.email}
              </p>

              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500" />

                {profileData.status || "Active"}
              </div>

              {isEditing && (
                <p className="text-xs text-gray-400 mt-4">
                  Select a JPG, PNG or WEBP image.
                  Maximum size 2 MB.
                </p>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Account Information
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  Your registered account details
                </p>
              </div>
            </div>

            {!isEditing ? (
              <div>
                <InfoCard
                  label="Full Name"
                  value={profileData.name}
                />

                <InfoCard
                  label="Email"
                  value={profileData.email}
                />

                <InfoCard
                  label="Phone"
                  value={profileData.phone}
                />

                <InfoCard
                  label="Account Status"
                  value={profileData.status}
                />

                <InfoCard
                  label="Last Login"
                  value={formatLastLogin(
                    profileData.lastLogin
                  )}
                />

                <InfoCard
                  label="Created On"
                  value={formatDate(
                    profileData.createdAt
                  )}
                />
              </div>
            ) : (
              <form
                onSubmit={handleSave}
                className="space-y-5"
              >

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-gray-50"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>

                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleChange}
                      disabled={
                        saving || otpLoading
                      }
                      className={`w-full px-4 py-2.5 ${
                        emailVerified
                          ? "pr-28"
                          : "pr-24"
                      } border rounded-lg outline-none focus:ring-2 text-sm disabled:bg-gray-50 ${
                        emailVerified
                          ? "border-green-300 focus:border-green-500 focus:ring-green-100"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                      }`}
                      placeholder="Enter your email"
                    />

                    {emailVerified ? (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={
                          requestEmailVerification
                        }
                        disabled={
                          otpLoading ||
                          !editData.email.trim()
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {otpLoading
                          ? "Sending..."
                          : "Verify"}
                      </button>
                    )}
                  </div>

                  {!emailVerified && (
                    <p className="text-xs text-gray-400 mt-2">
                      Changing your email requires verification.
                    </p>
                  )}

                  {/* Inline OTP */}
                  {otpModalOpen &&
                    !emailVerified && (
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-700">
                              Verify New Email
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              OTP sent to{" "}
                              <span className="font-semibold text-gray-700 break-all">
                                {verificationEmail}
                              </span>
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!otpLoading) {
                                setOtpModalOpen(
                                  false
                                );
                                setOtp("");
                                setOtpError("");
                                setOtpMessage("");
                              }
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {otpMessage && (
                          <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg">
                            <CheckCircle className="w-4 h-4 shrink-0" />

                            <span className="text-xs font-medium">
                              {otpMessage}
                            </span>
                          </div>
                        )}

                        {otpError && (
                          <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
                            <X className="w-4 h-4 shrink-0" />

                            <span className="text-xs font-medium">
                              {otpError}
                            </span>
                          </div>
                        )}

                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => {
                              const value =
                                e.target.value.replace(
                                  /\D/g,
                                  ""
                                );

                              setOtp(value);
                              setOtpError("");
                            }}
                            disabled={otpLoading}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-center text-lg tracking-[0.3em] font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                            placeholder="Enter OTP"
                          />

                          <button
                            type="button"
                            onClick={
                              handleVerifyEmail
                            }
                            disabled={
                              otpLoading ||
                              otp.length !== 6
                            }
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {otpLoading
                              ? "Verifying..."
                              : "Verify"}
                          </button>
                        </div>

                        <div className="text-center mt-3">
                          {resendSeconds > 0 ? (
                            <p className="text-xs text-gray-400">
                              Resend OTP in{" "}
                              <span className="font-semibold text-gray-600">
                                {resendSeconds}s
                              </span>
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={
                                requestEmailVerification
                              }
                              disabled={
                                otpLoading
                              }
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-60"
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleChange}
                    disabled={saving}
                    maxLength={10}
                    inputMode="numeric"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-gray-50"
                    placeholder="Enter your 10-digit phone number"
                  />

                  {editData.phone.length > 0 &&
                    editData.phone.length !== 10 && (
                      <p className="text-xs text-red-500 mt-2">
                        Phone number must be exactly 10 digits.
                      </p>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}

                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 disabled:opacity-60"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>

                </div>
              </form>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Password & Security
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Change your Super Admin account password.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/super-admin/profile/change-password"
                )
              }
              className="px-5 py-2.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
            >
              Change Password
            </button>

          </div>
        </div>

      </div>
    </SuperAdminLayout>
  );
}