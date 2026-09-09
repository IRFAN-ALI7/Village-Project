import { useState, useEffect, useRef } from "react";
import {
  User,
  MapPin,
  Shield,
  Palette,
  HelpCircle,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  Lock,
  Sun,
  Moon,
  Monitor,
  Mail,
  MessageSquare,
  Camera,
  Info,
  LogOut,
  ExternalLink,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import API_URL from "../../config/api";

function SectionHeader({ icon: Icon, title, color }) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-4 rounded-t-2xl ${color}`}
    >
      <Icon className="h-5 w-5 text-white" />
      <h2 className="font-bold text-white text-base">{title}</h2>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
        {value || "-"}
      </div>
    </div>
  );
}

function Toast({ msg }) {
  return (
    <div className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl">
      <CheckCircle className="h-4 w-4 shrink-0" />
      {msg}
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  // ==========================================
  // PROFILE
  // ==========================================
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    photo: "",
  });

  const [location, setLocation] = useState({
    state: "",
    district: "",
    subDistrict: "",
    panchayat: "",
    panchayatCode: "",
  });

  const [accountStatus, setAccountStatus] = useState("active");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // ==========================================
  // EMAIL CHANGE
  // ==========================================
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailStep, setEmailStep] = useState("email");
  const [emailLoading, setEmailLoading] = useState(false);

  // ==========================================
  // LOGOUT
  // ==========================================
  const [showLogout, setShowLogout] = useState(false);

  // ==========================================
  // GET TOKEN
  // ==========================================
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ==========================================
  // FETCH ADMIN PROFILE
  // ==========================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await axios.get(`${API_URL}/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const admin = response.data?.admin;

        if (!admin) {
          throw new Error("Admin profile not found");
        }

        setProfile({
          name: admin.name || "",
          email: admin.email || "",
          phone: admin.phone || "",
          photo: admin.profilePhoto || "",
        });

        setLocation({
          state: admin.state || "",
          district: admin.district || "",
          subDistrict: admin.subDistrict || "",
          panchayat: admin.panchayat || "",
          panchayatCode: admin.panchayatCode ?? "",
        });

        setAccountStatus(admin.status || "active");
      } catch (error) {
        console.error("Fetch admin profile error:", error);

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem("token");
          navigate("/admin/login");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            "Failed to load admin profile"
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // ==========================================
  // PROFILE PHOTO PREVIEW
  // ==========================================
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be less than 2 MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      setProfile((prev) => ({
        ...prev,
        photo: event.target?.result || "",
      }));
    };

    reader.readAsDataURL(file);
  };

  // ==========================================
  // SAVE PROFILE
  // EMAIL IS NOT UPDATED HERE
  // ==========================================
  const saveProfile = async () => {
    try {
      const token = getToken();

      if (!token) {
        navigate("/admin/login");
        return;
      }

      if (!profile.name.trim()) {
        toast.error("Name is required");
        return;
      }

      if (!profile.phone.trim()) {
        toast.error("Phone number is required");
        return;
      }

      setSavingProfile(true);

      const formData = new FormData();
      formData.append("phone", profile.phone.trim());

      const file = fileRef.current?.files?.[0];

      if (file) {
        formData.append("profilePhoto", file);
      }

      const response = await axios.put(
        `${API_URL}/admin/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedAdmin = response.data?.admin;

      if (updatedAdmin) {
        setProfile({
          name: updatedAdmin.name || "",
          email: updatedAdmin.email || "",
          phone: updatedAdmin.phone || "",
          photo: updatedAdmin.profilePhoto || "",
        });

        setLocation({
          state: updatedAdmin.state || "",
          district: updatedAdmin.district || "",
          subDistrict: updatedAdmin.subDistrict || "",
          panchayat: updatedAdmin.panchayat || "",
          panchayatCode: updatedAdmin.panchayatCode ?? "",
        });

        setAccountStatus(updatedAdmin.status || "active");
      }

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      setProfileSaved(true);

      toast.success(
        response.data?.message || "Profile updated successfully"
      );

      setTimeout(() => {
        setProfileSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Save admin profile error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ==========================================
  // OPEN EMAIL CHANGE MODAL
  // ==========================================
  const openEmailChange = () => {
    setNewEmail("");
    setEmailOtp("");
    setEmailStep("email");
    setShowEmailModal(true);
  };

  // ==========================================
  // CLOSE EMAIL CHANGE MODAL
  // ==========================================
  const closeEmailModal = () => {
    if (emailLoading) return;

    setShowEmailModal(false);
    setNewEmail("");
    setEmailOtp("");
    setEmailStep("email");
  };

  // ==========================================
  // SEND EMAIL CHANGE OTP
  // ==========================================
  const sendEmailOtp = async () => {
    try {
      const token = getToken();

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const cleanEmail = newEmail.toLowerCase().trim();

      if (!cleanEmail) {
        toast.error("Please enter your new email address");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (cleanEmail === profile.email.toLowerCase().trim()) {
        toast.error(
          "New email must be different from current email"
        );
        return;
      }

      setEmailLoading(true);

      const response = await axios.post(
        `${API_URL}/admin/request-email-change`,
        {
          email: cleanEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewEmail(cleanEmail);
      setEmailStep("otp");

      toast.success(
        response.data?.message ||
          "OTP sent to your new email address"
      );
    } catch (error) {
      console.error("Send email OTP error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/admin/login");
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to send verification OTP"
      );
    } finally {
      setEmailLoading(false);
    }
  };

  // ==========================================
  // VERIFY EMAIL CHANGE OTP
  // ==========================================
  const verifyEmailOtp = async () => {
    try {
      const token = getToken();

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const cleanOtp = emailOtp.trim();

      if (!cleanOtp) {
        toast.error("Please enter the OTP");
        return;
      }

      if (!/^\d{6}$/.test(cleanOtp)) {
        toast.error("OTP must be 6 digits");
        return;
      }

      setEmailLoading(true);

      const response = await axios.post(
        `${API_URL}/admin/verify-email-change`,
        {
          otp: cleanOtp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const verifiedEmail =
        response.data?.email || newEmail;

      setProfile((prev) => ({
        ...prev,
        email: verifiedEmail,
      }));

      setShowEmailModal(false);
      setNewEmail("");
      setEmailOtp("");
      setEmailStep("email");

      toast.success(
        response.data?.message ||
          "Email address updated successfully"
      );
    } catch (error) {
      console.error("Verify email OTP error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/admin/login");
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to verify OTP"
      );
    } finally {
      setEmailLoading(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  const changePw = async (e) => {
    e.preventDefault();

    const err = {};

    if (!pw.current) {
      err.current = "Required";
    }

    if (!pw.newPw) {
      err.newPw = "Required";
    } else if (pw.newPw.length < 8) {
      err.newPw = "Minimum 8 characters";
    }

    if (!pw.confirm) {
      err.confirm = "Required";
    } else if (pw.newPw !== pw.confirm) {
      err.confirm = "Passwords do not match";
    }

    setPwErr(err);

    if (Object.keys(err).length) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        navigate("/admin/login");
        return;
      }

      setChangingPw(true);

      const response = await axios.put(
        `${API_URL}/admin/change-password`,
        {
          currentPassword: pw.current,
          newPassword: pw.newPw,
          confirmPassword: pw.confirm,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPwSaved(true);

      toast.success(
        response.data?.message ||
          "Password changed successfully"
      );

      setPw({
        current: "",
        newPw: "",
        confirm: "",
      });

      setPwErr({});

      setTimeout(() => {
        setPwSaved(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Change admin password error:",
        error
      );

      if (error.response?.status === 401) {
        setPwErr({
          current:
            error.response?.data?.message ||
            "Current password is incorrect",
        });
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to change password"
        );
      }
    } finally {
      setChangingPw(false);
    }
  };

  // ==========================================
  // THEME
  // ==========================================
  const handleThemeChange = (value) => {
    setTheme(value);
    localStorage.setItem("adminTheme", value);
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");

    navigate("/admin/login");
  };

  // ==========================================
  // INPUT CLASS
  // ==========================================
  const inputCls = (ring, err) =>
    `w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 ${
      err
        ? "border-red-300 bg-red-50"
        : `border-gray-200 ${ring}`
    }`;

  // ==========================================
  // LOADING
  // ==========================================
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="text-sm text-gray-500 mt-3">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">

        {/* ==========================================
            1. PROFILE & ACCOUNT
        ========================================== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <SectionHeader
            icon={User}
            title="Profile & Account"
            color="bg-gradient-to-r from-blue-600 to-blue-700"
          />

          <div className="p-5 space-y-5">

            {profileSaved && (
              <Toast msg="Profile saved successfully!" />
            )}

            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-5 border-b border-gray-100">

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhoto}
              />

              <div
                className="relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group shrink-0 shadow-md"
                onClick={() => fileRef.current?.click()}
              >
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                    {profile.name?.charAt(0)?.toUpperCase() ||
                      "A"}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="text-center sm:text-left">
                <p className="font-bold text-gray-900 text-lg">
                  {profile.name || "Admin"}
                </p>

                <p className="text-sm text-gray-400 mt-0.5">
                  {profile.email || "-"}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fileRef.current?.click()
                  }
                  className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />

                  {profile.photo
                    ? "Change Photo"
                    : "Upload Photo"}
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <FieldLabel>Full Name</FieldLabel>

              <input
                   type="text"
                    value={profile.name}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                   />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Email */}
              <div>
                <FieldLabel>Email Address</FieldLabel>

                <div className="flex gap-2">
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="flex-1 min-w-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none"
                  />

                  <button
                    type="button"
                    onClick={openEmailChange}
                    className="shrink-0 px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 font-bold text-sm rounded-xl transition-colors"
                  >
                    Change
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-1.5">
                  Email change requires OTP verification.
                </p>
              </div>

              {/* Phone */}
              <div>
                <FieldLabel>Mobile Number</FieldLabel>

                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      phone: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    })
                  }
                  className={inputCls(
                    "focus:ring-blue-500 focus:border-blue-500"
                  )}
                />
              </div>
            </div>

            {/* Account Status */}
            <div>
              <FieldLabel>Account Status</FieldLabel>

              <div
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border ${
                  accountStatus === "active"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    accountStatus === "active"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                />

                <span
                  className={`text-sm font-bold ${
                    accountStatus === "active"
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {accountStatus === "active"
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>

            {/* Save */}
            <button
              type="button"
              onClick={saveProfile}
              disabled={savingProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
            >
              {savingProfile
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ==========================================
            2. ASSIGNED PANCHAYAT
        ========================================== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <SectionHeader
            icon={MapPin}
            title="Assigned Panchayat"
            color="bg-gradient-to-r from-emerald-600 to-emerald-700"
          />

          <div className="p-5 space-y-5">

            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">

              <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />

              <p className="text-sm text-amber-800 font-medium">
                This section is{" "}
                <span className="font-bold">
                  read-only
                </span>
                . Contact Super Admin to change your
                assignment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <ReadOnlyField
                label="State"
                value={location.state}
              />

              <ReadOnlyField
                label="District"
                value={location.district}
              />

              <ReadOnlyField
                label="Sub-District"
                value={location.subDistrict}
              />

              <ReadOnlyField
                label="Panchayat"
                value={location.panchayat}
              />

              <ReadOnlyField
                label="Panchayat Code"
                value={location.panchayatCode}
              />

              <div>
                <FieldLabel>
                  Assignment Status
                </FieldLabel>

                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">

                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />

                  <span className="text-sm font-bold text-emerald-700">
                    {accountStatus === "active"
                      ? "Assigned"
                      : "Inactive Assignment"}
                  </span>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            5. HELP & SUPPORT
        ========================================== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <SectionHeader
            icon={HelpCircle}
            title="Help & Support"
            color="bg-gradient-to-r from-orange-500 to-orange-600"
          />

          <div className="p-5 space-y-2">

            {[
              {
                Icon: HelpCircle,
                label: "Help Center",
                desc: "Browse FAQs and step-by-step guides",
                iconCls:
                  "bg-blue-100 text-blue-600",
                href: "#",
              },
              {
                Icon: Mail,
                label: "Contact Super Admin",
                desc: "Send a direct message to the Super Admin",
                iconCls:
                  "bg-indigo-100 text-indigo-600",
                href: "#",
              },
              {
                Icon: MessageSquare,
                label: "Report a Problem",
                desc: "Report bugs or technical issues",
                iconCls:
                  "bg-orange-100 text-orange-600",
                href: "#",
              },
            ].map(
              ({
                Icon,
                label,
                desc,
                iconCls,
                href,
              }) => (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => {
                    if (href === "#") {
                      e.preventDefault();
                      toast(
                        "Support feature will be connected later"
                      );
                    }
                  }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all group"
                >

                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">
                      {label}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {desc}
                    </p>
                  </div>

                  <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                </a>
              )
            )}
          </div>
        </div>

        {/* ==========================================
            LOGOUT
        ========================================== */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">

          <div className="p-5">

            <p className="text-sm font-bold text-gray-800 mb-1">
              Logout
            </p>

            <p className="text-xs text-gray-400 mb-4">
              You will be signed out of your admin account.
            </p>

            <button
              type="button"
              onClick={() => setShowLogout(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold py-3 rounded-xl text-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* ==========================================
            LOGOUT MODAL
        ========================================== */}
        {showLogout && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6">

              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="h-7 w-7 text-red-600" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
                Logout?
              </h3>

              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to sign out of your admin account?
              </p>

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Yes, Logout
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowLogout(false)
                  }
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>

              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            EMAIL CHANGE MODAL
        ========================================== */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">

            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">

              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Change Email Address
                    </h3>

                    <p className="text-xs text-gray-400">
                      Verify your new email with OTP
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeEmailModal}
                  disabled={emailLoading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5">

                {/* STEP 1 */}
                {emailStep === "email" && (
                  <div className="space-y-4">

                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <p className="text-xs text-blue-700">
                        Enter your new email address. A 6-digit
                        verification OTP will be sent to it.
                      </p>
                    </div>

                    <div>
                      <FieldLabel>
                        Current Email
                      </FieldLabel>

                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
                        {profile.email || "-"}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>
                        New Email Address
                      </FieldLabel>

                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) =>
                          setNewEmail(e.target.value)
                        }
                        placeholder="Enter new email address"
                        autoFocus
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={sendEmailOtp}
                      disabled={emailLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                    >
                      {emailLoading
                        ? "Sending OTP..."
                        : "Send Verification OTP"}
                    </button>
                  </div>
                )}

                {/* STEP 2 */}
                {emailStep === "otp" && (
                  <div className="space-y-4">

                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">

                      <div className="flex items-start gap-2">

                        <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />

                        <p className="text-xs text-emerald-700">
                          OTP has been sent to{" "}
                          <span className="font-bold">
                            {newEmail}
                          </span>
                          . Please check your inbox.
                        </p>

                      </div>
                    </div>

                    <div>
                      <FieldLabel>
                        Verification OTP
                      </FieldLabel>

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={emailOtp}
                        onChange={(e) =>
                          setEmailOtp(
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6)
                          )
                        }
                        placeholder="Enter 6-digit OTP"
                        autoFocus
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg font-bold tracking-[0.35em] outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={verifyEmailOtp}
                      disabled={
                        emailLoading ||
                        emailOtp.length !== 6
                      }
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                    >
                      {emailLoading
                        ? "Verifying..."
                        : "Verify & Change Email"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEmailStep("email");
                        setEmailOtp("");
                      }}
                      disabled={emailLoading}
                      className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-sm transition-colors"
                    >
                      Change Email Address
                    </button>

                    <p className="text-xs text-center text-gray-400">
                      OTP is valid for 10 minutes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}