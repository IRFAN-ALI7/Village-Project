import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  UserPlus,
  User,
  Phone,
  Lock,
  MapPin,
  Home,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  Camera,
  ChevronDown,
} from "lucide-react";

import villageImg from "../assets/villageImg.png";
import axios from "axios";
import API_URL from "../config/api";

// ── SelectField Component ────────────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "Select",
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}{" "}
        {required && <span className="text-red-600">*</span>}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
        >
          <option value="">
            {disabled ? "— Select above first —" : placeholder}
          </option>

          {options.map((opt) => (
            <option
              key={opt.value ?? opt}
              value={opt.value ?? opt}
            >
              {opt.label ?? opt}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function RegistrationPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);

  // ── Form Data ──────────────────────────────────────────────────────────────

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    state: "20",
    district: "",
    subDistrict: "",
    panchayat: "",
    village: "",
    pincode: "",
    postOffice: "",
    policeStation: "",
    password: "",
  });

  // ── Location Data ─────────────────────────────────────────────────────────

  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [panchayats, setPanchayats] = useState([]);
  const [villages, setVillages] = useState([]);
  const [postOffices, setPostOffices] = useState([]);

  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubDistricts, setLoadingSubDistricts] = useState(false);
  const [loadingPanchayats, setLoadingPanchayats] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [loadingPostOffices, setLoadingPostOffices] = useState(false);

  // ── Email OTP State ────────────────────────────────────────────────────────

  const [emailVerified, setEmailVerified] = useState(false);
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);

  // ── Toast State ────────────────────────────────────────────────────────────

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  // ── Toast Helper ───────────────────────────────────────────────────────────

  const showToast = (message, type = "error") => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        type: "",
        message: "",
      });
    }, 4000);
  };

  // ── OTP Cooldown Timer ─────────────────────────────────────────────────────

  useEffect(() => {
    if (otpCooldown <= 0) return;

    const timer = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpCooldown]);

  // ── Location Data ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!formData.state) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      try {
        setLoadingDistricts(true);

        const response = await axios.get(
          `${API_URL}/api/locations/states/${formData.state}/districts`
        );

        setDistricts(response.data.data || []);
      } catch (error) {
        console.error("Districts fetch error:", error);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [formData.state]);

  useEffect(() => {
    if (!formData.district) {
      setSubDistricts([]);
      return;
    }

    const fetchSubDistricts = async () => {
      try {
        setLoadingSubDistricts(true);

        const response = await axios.get(
          `${API_URL}/api/locations/districts/${formData.district}/subdistricts`
        );

        setSubDistricts(response.data.data || []);
      } catch (error) {
        console.error("SubDistricts fetch error:", error);
        setSubDistricts([]);
      } finally {
        setLoadingSubDistricts(false);
      }
    };

    fetchSubDistricts();
  }, [formData.district]);

  useEffect(() => {
    if (!formData.subDistrict) {
      setPanchayats([]);
      return;
    }

    const fetchPanchayats = async () => {
      try {
        setLoadingPanchayats(true);

        const response = await axios.get(
          `${API_URL}/api/locations/subdistricts/${formData.subDistrict}/panchayats`
        );

        setPanchayats(response.data.data || []);
      } catch (error) {
        console.error("Panchayats fetch error:", error);
        setPanchayats([]);
      } finally {
        setLoadingPanchayats(false);
      }
    };

    fetchPanchayats();
  }, [formData.subDistrict]);

  useEffect(() => {
    if (!formData.subDistrict || !formData.panchayat) {
      setVillages([]);
      return;
    }

    const fetchVillages = async () => {
      try {
        setLoadingVillages(true);

        const response = await axios.get(
          `${API_URL}/api/locations/subdistricts/${formData.subDistrict}/panchayats/${formData.panchayat}/villages`
        );

        setVillages(response.data.data || []);
      } catch (error) {
        console.error("Villages fetch error:", error);
        setVillages([]);
      } finally {
        setLoadingVillages(false);
      }
    };

    fetchVillages();
  }, [formData.subDistrict, formData.panchayat]);

  useEffect(() => {
    if (!formData.pincode) {
      setPostOffices([]);
      return;
    }

    const fetchPostOffices = async () => {
      try {
        setLoadingPostOffices(true);

        const response = await axios.get(
          `${API_URL}/api/locations/pincodes/${formData.pincode}/postoffices`
        );

        setPostOffices(response.data.data || []);
      } catch (error) {
        console.error("Post Offices fetch error:", error);
        setPostOffices([]);
      } finally {
        setLoadingPostOffices(false);
      }
    };

    fetchPostOffices();
  }, [formData.pincode]);

  // ── Form Field Setter ──────────────────────────────────────────────────────

  const set = (field) => (val) => {
    if (field === "state") {
      setFormData((p) => ({
        ...p,
        state: val,
        district: "",
        subDistrict: "",
        panchayat: "",
        village: "",
        pincode: "",
        postOffice: "",
      }));

      setDistricts([]);
      setSubDistricts([]);
      setPanchayats([]);
      setVillages([]);
      setPostOffices([]);
    } else if (field === "district") {
      setFormData((p) => ({
        ...p,
        district: val,
        subDistrict: "",
        panchayat: "",
        village: "",
        pincode: "",
        postOffice: "",
      }));

      setSubDistricts([]);
      setPanchayats([]);
      setVillages([]);
      setPostOffices([]);
    } else if (field === "subDistrict") {
      setFormData((p) => ({
        ...p,
        subDistrict: val,
        panchayat: "",
        village: "",
        pincode: "",
        postOffice: "",
      }));

      setPanchayats([]);
      setVillages([]);
      setPostOffices([]);
    } else if (field === "panchayat") {
      setFormData((p) => ({
        ...p,
        panchayat: val,
        village: "",
        pincode: "",
        postOffice: "",
      }));

      setVillages([]);
      setPostOffices([]);
    } else if (field === "village") {
      const village = villages.find(
        (item) => String(item.villageCode) === String(val)
      );

      const pincode = village?.pincode || "";

      setFormData((p) => ({
        ...p,
        village: val,
        pincode,
        postOffice: "",
      }));

      setPostOffices([]);
    } else {
      setFormData((p) => ({
        ...p,
        [field]: val,
      }));
    }
  };

  // ── Profile Image ──────────────────────────────────────────────────────────

  const handleProfileImage = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setProfileImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  // ── Email Change ────────────────────────────────────────────────────────────

  const handleEmailChange = (e) => {
    const email = e.target.value;

    setFormData((prev) => ({
      ...prev,
      email,
    }));

    // Email changed → previous verification is no longer valid
    setEmailVerified(false);
    setShowEmailOtp(false);
    setEmailOtp("");
    setOtpCooldown(0);
  };

  // ── Request Registration OTP ────────────────────────────────────────────────

  const handleSendEmailOtp = async () => {
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      showToast("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Please enter a valid email address.");
      return;
    }

    if (otpCooldown > 0) {
      showToast(`Please wait ${otpCooldown} seconds before requesting OTP again.`);
      return;
    }

    try {
      setSendingOtp(true);

      const response = await axios.post(
        `${API_URL}/user/register/request-otp`,
        {
          email,
        }
      );

      setFormData((prev) => ({
        ...prev,
        email,
      }));

      setShowEmailOtp(true);
      setEmailOtp("");
      setOtpCooldown(60);

      showToast(
        response.data?.message ||
          "OTP sent successfully. Please check your email.",
        "success"
      );
    } catch (error) {
      console.error("Send Registration OTP Error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to send OTP. Please try again.";

      showToast(message);
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Verify Registration OTP ─────────────────────────────────────────────────

  const handleVerifyEmailOtp = async () => {
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      showToast("Please enter your email address.");
      return;
    }

    if (!emailOtp || emailOtp.length !== 6) {
      showToast("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setVerifyingOtp(true);

      const response = await axios.post(
        `${API_URL}/user/register/verify-email`,
        {
          email,
          otp: emailOtp,
        }
      );

      setEmailVerified(true);
      setShowEmailOtp(false);
      setEmailOtp("");
      setOtpCooldown(0);

      showToast(
        response.data?.message || "Email verified successfully.",
        "success"
      );
    } catch (error) {
      console.error("Verify Registration OTP Error:", error);

      const message =
        error.response?.data?.message ||
        "Invalid OTP. Please try again.";

      showToast(message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────

  const handleResendEmailOtp = async () => {
    if (otpCooldown > 0) {
      showToast(`Please wait ${otpCooldown} seconds.`);
      return;
    }

    await handleSendEmailOtp();
  };

  // ── Registration Submit ─────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      showToast("Please verify your email before creating your account.");
      return;
    }

    if (formData.password.length < 6) {
      showToast("Password must be at least 6 characters.");
      return;
    }

    try {
      setRegistering(true);

      const data = new FormData();

      data.append("name", formData.name);
      data.append("mobile", formData.mobile);
      data.append("email", formData.email.trim().toLowerCase());
      data.append("address", formData.address);
      data.append("state", formData.state);
      data.append("district", formData.district);
      data.append("subDistrict", formData.subDistrict);
      data.append("panchayat", formData.panchayat);
      data.append("village", formData.village);
      data.append("pincode", formData.pincode);
      data.append("postOffice", formData.postOffice);
      data.append("policeStation", formData.policeStation);
      data.append("password", formData.password);

      // Profile Image
      if (profileImageFile) {
        data.append("profileImage", profileImageFile);
      }

      const response = await axios.post(
        `${API_URL}/user/register`,
        data
      );

      showToast(
        response.data?.message || "Account created successfully.",
        "success"
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (error) {
      console.error("Registration Error:", error);

      showToast(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center p-4">

      {/* ── Toast ─────────────────────────────────────────────────────────── */}

      {toast.show && (
        <div className="fixed top-5 right-5 z-50 max-w-sm">
          <div
            className={`px-5 py-4 rounded-xl shadow-2xl border flex items-start gap-3 ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-green-600" />
            ) : (
              <span className="text-red-600 font-bold text-lg leading-none">
                !
              </span>
            )}

            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* ── Left Side – Branding ───────────────────────────────────────── */}

        <div className="text-white space-y-6 hidden lg:block">
          <div className="space-y-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <Home className="h-12 w-12 text-white" />
              </div>

              <div>
                <h1 className="text-4xl font-bold">Smart Village</h1>
                <p className="text-white/80 text-lg">
                  Digital Gram Panchayat
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <img
              src={villageImg}
              alt="Village"
              className="rounded-xl w-full shadow-2xl mb-6"
            />

            <h2 className="text-2xl font-bold mb-4">
              Join Our Digital Village!
            </h2>

            <p className="text-white/90 text-lg mb-6">
              Register now to access all village services and stay connected
              with your community.
            </p>

            <div className="space-y-3">
              {[
                "File complaints and track progress",
                "Apply for government schemes",
                "Get certificates online",
                "Stay updated with notices",
              ].map((item) => (
                <div key={item} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
                  <span className="text-white/90">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Side – Registration Form ─────────────────────────────── */}

        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 max-h-[92vh] overflow-y-auto">

          {/* Mobile back */}

          <button
            onClick={() => navigate("/")}
            className="lg:hidden flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>

          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Create Account
            </h2>

            <p className="text-gray-600">
              Register to access village services
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Profile Photo ──────────────────────────────────────────── */}

            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 hover:border-green-500 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden transition-all"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400 group-hover:text-green-500 transition-colors" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-green-500 hover:bg-green-600 text-white rounded-full p-1.5 shadow-md transition-colors"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Click to upload profile photo
              </p>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImage}
              />
            </div>

            {/* ── Personal Information ───────────────────────────────────── */}

            <section className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b-2 border-green-500">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="font-bold text-gray-800">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Full Name */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name{" "}
                    <span className="text-red-600">*</span>
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter your full name"
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>
                </div>

                {/* Mobile */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number{" "}
                    <span className="text-red-600">*</span>
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobile: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        })
                      }
                      placeholder="9876543210"
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ── Email Verification ─────────────────────────────────── */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-600">*</span>
                </label>

                <div className="flex gap-2">

                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                      type="email"
                      required
                      value={formData.email}
                      disabled={emailVerified}
                      onChange={handleEmailChange}
                      placeholder="your@email.com"
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 transition-all ${
                        emailVerified
                          ? "border-green-400 bg-green-50 text-green-700 cursor-not-allowed"
                          : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                      }`}
                    />
                  </div>

                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={
                        sendingOtp ||
                        !formData.email.trim() ||
                        otpCooldown > 0
                      }
                      className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold whitespace-nowrap transition-all"
                    >
                      {sendingOtp
                        ? "Sending..."
                        : otpCooldown > 0
                        ? `${otpCooldown}s`
                        : showEmailOtp
                        ? "Resend"
                        : "Verify"}
                    </button>
                  )}

                  {emailVerified && (
                    <div className="flex items-center gap-1.5 px-3 py-3 text-green-600 font-semibold whitespace-nowrap">
                      <CheckCircle className="h-5 w-5" />
                      Verified
                    </div>
                  )}
                </div>

                {/* OTP Box */}

                {showEmailOtp && !emailVerified && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">

                    <p className="text-sm text-green-800 mb-3">
                      A 6-digit OTP has been sent to{" "}
                      <span className="font-semibold">
                        {formData.email}
                      </span>
                    </p>

                    <div className="flex gap-2">

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
                        className="flex-1 px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 tracking-[0.3em] text-center font-semibold"
                      />

                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        disabled={
                          verifyingOtp ||
                          emailOtp.length !== 6
                        }
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold whitespace-nowrap transition-all"
                      >
                        {verifyingOtp ? "Verifying..." : "Verify OTP"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-sm">

                      <span className="text-gray-500">
                        Didn't receive the OTP?
                      </span>

                      <button
                        type="button"
                        onClick={handleResendEmailOtp}
                        disabled={otpCooldown > 0 || sendingOtp}
                        className="text-green-600 font-semibold hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {otpCooldown > 0
                          ? `Resend in ${otpCooldown}s`
                          : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ── Location Details ───────────────────────────────────────── */}

            <section className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b-2 border-blue-500">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">
                  Location Details
                </h3>
              </div>

              {/* Address */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address <span className="text-red-600">*</span>
                </label>

                <div className="relative">
                  <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: e.target.value,
                      })
                    }
                    placeholder="House No. 123, Main Road, Rampur"
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* State | District | Sub-District */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State <span className="text-red-600">*</span>
                  </label>

                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium">
                    Jharkhand
                    <span className="ml-1 text-xs text-gray-400">
                      (Fixed)
                    </span>
                  </div>
                </div>

                <SelectField
                  label="District"
                  value={formData.district}
                  onChange={set("district")}
                  options={districts.map((district) => ({
                    value: district.districtCode,
                    label: district.districtName,
                  }))}
                  disabled={!formData.state}
                  placeholder={
                    loadingDistricts
                      ? "Loading Districts..."
                      : "Select District"
                  }
                  required
                />

                <SelectField
                  label="Sub-District"
                  value={formData.subDistrict}
                  onChange={set("subDistrict")}
                  options={subDistricts.map((subDistrict) => ({
                    value: subDistrict.subDistrictCode,
                    label: subDistrict.subDistrictName,
                  }))}
                  disabled={!formData.district}
                  placeholder={
                    loadingSubDistricts
                      ? "Loading Sub-Districts..."
                      : "Select Sub-District"
                  }
                  required
                />
              </div>

              {/* Panchayat | Village | Pincode */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <SelectField
                  label="Panchayat"
                  value={formData.panchayat}
                  onChange={set("panchayat")}
                  options={panchayats.map((panchayat) => ({
                    value: panchayat.panchayatCode,
                    label: panchayat.panchayatName,
                  }))}
                  disabled={!formData.subDistrict}
                  placeholder={
                    loadingPanchayats
                      ? "Loading Panchayats..."
                      : "Select Panchayat"
                  }
                  required
                />

                <SelectField
                  label="Village"
                  value={formData.village}
                  onChange={set("village")}
                  options={villages.map((v) => ({
                    value: v.villageCode,
                    label: v.villageName,
                  }))}
                  disabled={!formData.panchayat}
                  placeholder={
                    loadingVillages
                      ? "Loading Villages..."
                      : "Select Village"
                  }
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode <span className="text-red-600">*</span>
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={formData.pincode}
                    placeholder="Auto-filled on village select"
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg bg-green-50 text-gray-700 cursor-not-allowed placeholder:text-gray-400 placeholder:text-xs"
                  />
                </div>
              </div>

              {/* Post Office | Police Station */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <SelectField
                  label="Post Office"
                  value={formData.postOffice}
                  onChange={set("postOffice")}
                  options={postOffices.map((postOffice) => ({
                    value: postOffice.officeName,
                    label: postOffice.officeName,
                  }))}
                  disabled={!formData.village}
                  placeholder={
                    loadingPostOffices
                      ? "Loading Post Offices..."
                      : "Select Post Office"
                  }
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Police Station{" "}
                    <span className="text-red-600">*</span>
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.policeStation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        policeStation: e.target.value,
                      })
                    }
                    placeholder="Enter police station name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* ── Security Details ───────────────────────────────────────── */}

            <section className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b-2 border-orange-500">
                <Lock className="h-5 w-5 text-orange-600" />
                <h3 className="font-bold text-gray-800">
                  Security Details
                </h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-600">*</span>
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    placeholder="Minimum 6 characters"
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* ── Terms ──────────────────────────────────────────────────── */}

            <div className="flex items-start space-x-2 bg-gray-50 p-4 rounded-lg">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
              />

              <label className="text-sm text-gray-600">
                I agree to the{" "}
                <span className="text-green-600 font-semibold">
                  Terms and Conditions
                </span>{" "}
                and{" "}
                <span className="text-green-600 font-semibold">
                  Privacy Policy
                </span>
              </label>
            </div>

            {/* ── Submit ─────────────────────────────────────────────────── */}

            <button
              type="submit"
              disabled={registering || !emailVerified}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:shadow-xl transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registering
                ? "Creating Account..."
                : !emailVerified
                ? "Verify Email to Create Account"
                : "Create Account"}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Login here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}