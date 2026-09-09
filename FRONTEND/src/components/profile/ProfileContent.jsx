import { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Edit,
  Lock,
  Trash2,
  Camera,
  AlertTriangle,
  ArrowLeft,
  Save,
  X,
  Home,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import API_URL from "../../config/api";

// ── SelectField ───────────────────────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = 'Select',
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-500 cursor-pointer disabled:cursor-not-allowed"
        >
          <option value="">
            {disabled ? '— Fixed / Not Editable —' : placeholder}
          </option>

          {options.map((opt) => (
            <option
              key={String(opt.value ?? opt)}
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

// ── InfoCard ──────────────────────────────────────────────────────────────────

function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-500 font-semibold mb-1">
        {label}
      </p>

      <p className="text-lg font-bold text-gray-800">
        {value || '—'}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProfileContent() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Profile Data ─────────────────────────────────────────────────────────

  const [profileData, setProfileData] = useState({
    _id: '',
    name: '',
    mobile: '',
    email: '',
    address: '',

    state: '',
    stateCode: '',

    district: '',
    districtCode: '',

    subDistrict: '',
    subDistrictCode: '',

    panchayat: '',
    panchayatCode: '',

    village: '',
    villageCode: '',

    pincode: '',
    postOffice: '',
    policeStation: '',

    profilePhoto: '',
  });

  const [editData, setEditData] = useState({
    ...profileData,
  });

  // ── Email Verification ───────────────────────────────────────────────────

  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);

  // ── Password ─────────────────────────────────────────────────────────────

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ── Location Lists ───────────────────────────────────────────────────────

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [panchayats, setPanchayats] = useState([]);
  const [villages, setVillages] = useState([]);
  const [postOffices, setPostOffices] = useState([]);

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubDistricts, setLoadingSubDistricts] = useState(false);
  const [loadingPanchayats, setLoadingPanchayats] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [loadingPostOffices, setLoadingPostOffices] = useState(false);

  // ── Helper: Normalize User ────────────────────────────────────────────────

  const normalizeUser = (user) => ({
    _id: user?._id || '',

    name: user?.name || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    address: user?.address || '',

    state: user?.state || '',
    stateCode: user?.stateCode || '',

    district: user?.district || '',
    districtCode: user?.districtCode || '',

    subDistrict: user?.subDistrict || '',
    subDistrictCode: user?.subDistrictCode || '',

    panchayat: user?.panchayat || '',
    panchayatCode: user?.panchayatCode || '',

    village: user?.village || '',
    villageCode: user?.villageCode || '',

    pincode: user?.pincode || '',
    postOffice: user?.postOffice || '',
    policeStation: user?.policeStation || '',

    profilePhoto:
      user?.profilePhoto ||
      user?.profileImage ||
      '',
  });

  // ── Fetch Profile ────────────────────────────────────────────────────────

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user = response.data.data || response.data;
      const normalizedUser = normalizeUser(user);
      setProfileData(normalizedUser);
      setEditData((prev) => ({
        ...normalizedUser,
        profileFile: prev.profileFile || null,
        profilePreview: prev.profilePreview || '',
      }));

      // Current saved email is already verified.
      setEmailVerified(true);
      setEmailVerificationSent(false);
      setEmailOtp('');
      setEmailOtpCooldown(0);

    } catch (error) {
      console.error("Profile fetch error:", error);

      toast.error(
        error.response?.data?.message ||
        "Unable to load profile."
      );
    }
  };

  // ── Initial Profile Fetch ────────────────────────────────────────────────

  useEffect(() => {
    fetchProfile();
  }, []);

  // ── Email OTP Cooldown ───────────────────────────────────────────────────

  useEffect(() => {
    if (emailOtpCooldown <= 0) return;

    const timer = setInterval(() => {
      setEmailOtpCooldown((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [emailOtpCooldown]);

  // ── Fetch States ─────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/locations/states`
        );

        setStates(response.data.data || []);
      } catch (error) {
        console.error("States fetch error:", error);
        setStates([]);
      }
    };

    fetchStates();
  }, []);

  // ── Fetch Districts ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!editData.stateCode) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      try {
        setLoadingDistricts(true);

        const response = await axios.get(
          `${API_URL}/api/locations/states/${editData.stateCode}/districts`
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
  }, [editData.stateCode]);

  // ── Fetch Sub-Districts ──────────────────────────────────────────────────

  useEffect(() => {
    if (!editData.districtCode) {
      setSubDistricts([]);
      return;
    }

    const fetchSubDistricts = async () => {
      try {
        setLoadingSubDistricts(true);

        const response = await axios.get(
          `${API_URL}/api/locations/districts/${editData.districtCode}/subdistricts`
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
  }, [editData.districtCode]);

  // ── Fetch Panchayats ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!editData.subDistrictCode) {
      setPanchayats([]);
      return;
    }

    const fetchPanchayats = async () => {
      try {
        setLoadingPanchayats(true);

        const response = await axios.get(
          `${API_URL}/api/locations/subdistricts/${editData.subDistrictCode}/panchayats`
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
  }, [editData.subDistrictCode]);

  // ── Fetch Villages ───────────────────────────────────────────────────────

  useEffect(() => {
    if (
      !editData.subDistrictCode ||
      !editData.panchayatCode
    ) {
      setVillages([]);
      return;
    }

    const fetchVillages = async () => {
      try {
        setLoadingVillages(true);

        const response = await axios.get(
          `${API_URL}/api/locations/subdistricts/${editData.subDistrictCode}/panchayats/${editData.panchayatCode}/villages`
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
  }, [
    editData.subDistrictCode,
    editData.panchayatCode,
  ]);

  // ── Fetch Post Offices ───────────────────────────────────────────────────

  useEffect(() => {
    if (!editData.pincode) {
      setPostOffices([]);
      return;
    }

    const fetchPostOffices = async () => {
      try {
        setLoadingPostOffices(true);

        const response = await axios.get(
          `${API_URL}/api/locations/pincodes/${editData.pincode}/postoffices`
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
  }, [editData.pincode]);

  // ── Location Change Handler ──────────────────────────────────────────────

  const setLocation = (field) => (value) => {
    // State is fixed
    if (field === 'state') {
      return;
    }

    // District is fixed
    if (field === 'district') {
      return;
    }

    // Sub-District is fixed
    if (field === 'subDistrict') {
      return;
    }

    // ── Panchayat Change ──────────────────────────────────────────────────

    if (field === 'panchayat') {
      const selectedPanchayat = panchayats.find(
        (item) =>
          String(item.panchayatCode) === String(value)
      );

      setEditData((prev) => ({
        ...prev,

        panchayat:
          selectedPanchayat?.panchayatName || '',

        panchayatCode:
          selectedPanchayat?.panchayatCode || value,

        village: '',
        villageCode: '',

        pincode: '',
        postOffice: '',
      }));

      return;
    }

    // ── Village Change ───────────────────────────────────────────────────

    if (field === 'village') {
      const selectedVillage = villages.find(
        (item) =>
          String(item.villageCode) === String(value)
      );

      setEditData((prev) => ({
        ...prev,

        village:
          selectedVillage?.villageName || '',

        villageCode:
          selectedVillage?.villageCode || value,

        pincode:
          selectedVillage?.pincode ||
          selectedVillage?.pinCode ||
          '',

        postOffice: '',
      }));

      return;
    }

    // ── Post Office ───────────────────────────────────────────────────────

    if (field === 'postOffice') {
      setEditData((prev) => ({
        ...prev,
        postOffice: value,
      }));

      return;
    }

    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ── Email Change Handler ─────────────────────────────────────────────────

  const handleEmailChange = (value) => {
    const newEmail = value.trim().toLowerCase();

    setEditData((prev) => ({
      ...prev,
      email: newEmail,
    }));

    const originalEmail = (profileData.email || '')
      .trim()
      .toLowerCase();

    if (newEmail === originalEmail) {
      setEmailVerified(true);
      setEmailVerificationSent(false);
      setEmailOtp('');
      setEmailOtpCooldown(0);
    } else {
      setEmailVerified(false);
      setEmailVerificationSent(false);
      setEmailOtp('');
      setEmailOtpCooldown(0);
    }
  };

  // ── Email Validation ────────────────────────────────────────────────────

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ── Request Email Change OTP ─────────────────────────────────────────────

  const handleRequestEmailChange = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again.");
        return;
      }

      const newEmail = (editData.email || '')
        .trim()
        .toLowerCase();

      const currentEmail = (profileData.email || '')
        .trim()
        .toLowerCase();

      if (!newEmail) {
        toast.error("Email is required.");
        return;
      }

      if (!isValidEmail(newEmail)) {
        toast.error("Please enter a valid email address.");
        return;
      }

      if (newEmail === currentEmail) {
        setEmailVerified(true);
        return;
      }

      if (emailOtpCooldown > 0) {
        return;
      }

      setSendingEmailOtp(true);

      const response = await axios.post(
        `${API_URL}/user/request-email-change`,
        {
          newEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmailVerificationSent(true);
      setEmailVerified(false);
      setEmailOtp('');
      setEmailOtpCooldown(60);

      toast.success(
        response.data.message ||
        "OTP sent to your new email address."
      );

    } catch (error) {
      console.error(
        "Email change OTP error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Unable to send verification OTP."
      );
    } finally {
      setSendingEmailOtp(false);
    }
  };

  // ── Verify Email Change OTP ──────────────────────────────────────────────

  const handleVerifyEmailChange = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again.");
        return;
      }

      if (!/^\d{6}$/.test(emailOtp)) {
        toast.error("Please enter a valid 6-digit OTP.");
        return;
      }

      setVerifyingEmailOtp(true);

      const response = await axios.post(
        `${API_URL}/user/verify-email-change`,
        {
          otp: emailOtp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const verifiedEmail = (editData.email || '')
        .trim()
        .toLowerCase();

      // Backend changes the actual email after successful OTP verification.
      // Keep frontend state synchronized immediately.
      setProfileData((prev) => ({
        ...prev,
        email: verifiedEmail,
      }));

      setEditData((prev) => ({
        ...prev,
        email: verifiedEmail,
      }));

      setEmailVerified(true);
      setEmailVerificationSent(false);
      setEmailOtp('');
      setEmailOtpCooldown(0);

      toast.success(
        response.data.message ||
        "New email verified successfully!"
      );

    } catch (error) {
      console.error(
        "Email verification error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Email verification failed."
      );
    } finally {
      setVerifyingEmailOtp(false);
    }
  };

  // ── Resend Email Change OTP ──────────────────────────────────────────────

  const handleResendEmailOtp = async () => {
    if (emailOtpCooldown > 0) {
      return;
    }

    await handleRequestEmailChange();
  };

  // ── Start Editing ────────────────────────────────────────────────────────

  const handleEdit = () => {
    setEditData({
      ...profileData,
      profileFile: null,
      profilePreview: '',
    });

    setEmailVerified(true);
    setEmailVerificationSent(false);
    setEmailOtp('');
    setEmailOtpCooldown(0);

    setIsEditing(true);
  };

  // ── Save Profile ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again.");
        return;
      }

      const currentEmail = (profileData.email || '')
        .trim()
        .toLowerCase();

      const enteredEmail = (editData.email || '')
        .trim()
        .toLowerCase();

      if (!enteredEmail) {
        toast.error("Email is required.");
        return;
      }

      if (!isValidEmail(enteredEmail)) {
        toast.error("Please enter a valid email address.");
        return;
      }

      // Email changed but new email is not verified.
      if (
        enteredEmail !== currentEmail &&
        !emailVerified
      ) {
        toast.error(
          "Please verify your new email before saving."
        );
        return;
      }

      const data = new FormData();

      data.append("name", editData.name || "");
      data.append("mobile", editData.mobile || "");
      data.append("email", enteredEmail);
      data.append("address", editData.address || "");

      /*
       * State / District / Sub-District are fixed.
       * Backend also removes these fields.
       * We send them only for compatibility.
       */

      data.append("state", editData.state || "");

      data.append(
        "stateCode",
        editData.stateCode || ""
      );

      data.append(
        "district",
        editData.district || ""
      );

      data.append(
        "districtCode",
        editData.districtCode || ""
      );

      data.append(
        "subDistrict",
        editData.subDistrict || ""
      );

      data.append(
        "subDistrictCode",
        editData.subDistrictCode || ""
      );

      // Panchayat CAN be changed
      data.append(
        "panchayat",
        editData.panchayat || ""
      );

      data.append(
        "panchayatCode",
        editData.panchayatCode || ""
      );

      // Village CAN be changed
      data.append(
        "village",
        editData.village || ""
      );

      data.append(
        "villageCode",
        editData.villageCode || ""
      );

      data.append(
        "pincode",
        editData.pincode || ""
      );

      data.append(
        "postOffice",
        editData.postOffice || ""
      );

      data.append(
        "policeStation",
        editData.policeStation || ""
      );

      // New image
      if (editData.profileFile) {
        data.append(
          "profileImage",
          editData.profileFile
        );
      }

      const response = await axios.put(
        `${API_URL}/user/${profileData._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchProfile();
      setIsEditing(false);
      toast.success(
        response.data.message ||
        "Profile updated successfully!"
      );

    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Profile update failed."
      );
    }
  };

  // ── Cancel Edit ──────────────────────────────────────────────────────────

  const handleCancel = () => {
    setEditData({
      ...profileData,
      profileFile: null,
      profilePreview: '',
    });

    setEmailVerified(true);
    setEmailVerificationSent(false);
    setEmailOtp('');
    setEmailOtpCooldown(0);

    setIsEditing(false);
  };

  // ── Password Change ─────────────────────────────────────────────────────

  const handlePasswordChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      toast.error(
        "New password and confirm password do not match!"
      );
      return;
    }

    if (
      passwordData.newPassword.length < 6
    ) {
      toast.error(
        "Password must be at least 6 characters long!"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again.");
        return;
      }

      const response = await axios.put(
        `${API_URL}/user/change-password`,
        {
          currentPassword:
            passwordData.currentPassword,

          newPassword:
            passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        response.data.message ||
        "Password changed successfully!"
      );

      setShowPasswordModal(false);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Password change failed."
      );
    }
  };

  // ── Delete Account ───────────────────────────────────────────────────────

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again.");
        return;
      }

      const response = await axios.delete(
        `${API_URL}/user/${profileData._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        response.data.message ||
        "Account deleted successfully!"
      );

      localStorage.removeItem("token");

      setShowDeleteModal(false);

      window.location.href = "/";

    } catch (error) {
      console.error(
        "Delete account error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to delete account."
      );
    }
  };

  // ── Photo Upload ─────────────────────────────────────────────────────────

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const previewUrl =
      URL.createObjectURL(file);

    setEditData((prev) => ({
      ...prev,
      profileFile: file,
      profilePreview: previewUrl,
    }));
  };

  // ── Initials ─────────────────────────────────────────────────────────────

  const getInitials = (name = '') => {
    const cleanName = name.trim();

    if (!cleanName) {
      return 'US';
    }

    const parts = cleanName.split(/\s+/);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[1][0]
      );
    }

    return cleanName.substring(0, 2);
  };

  // ── Email Save Status ────────────────────────────────────────────────────

  const currentEmail = (profileData.email || '')
    .trim()
    .toLowerCase();

  const enteredEmail = (editData.email || '')
    .trim()
    .toLowerCase();

  const emailChanged =
    enteredEmail !== currentEmail;

  const canSaveProfile =
    !emailChanged || emailVerified;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6">

      {/* Back Button */}

      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold transition-all"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Dashboard</span>
      </button>

      {!isEditing ? (
        // READ ONLY VIEW

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <h2 className="text-3xl font-bold">
              User Profile
            </h2>
          </div>

          <div className="p-4 md:p-8">

            {/* Avatar + Name */}

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 md:mb-8 pb-6 border-b-2 border-gray-100 text-center sm:text-left">

              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-xl overflow-hidden shrink-0">

                {profileData.profilePhoto ? (
                  <img
                    src={profileData.profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(
                    profileData.name
                  ).toUpperCase()
                )}

              </div>

              <div>

                <h3 className="text-xl md:text-3xl font-bold text-gray-800 mb-1">
                  {profileData.name}
                </h3>

                <p className="text-blue-600 font-semibold text-base md:text-lg mb-2">
                  Village Member
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="font-semibold text-sm md:text-base">
                      {profileData.mobile || '—'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="font-semibold text-sm md:text-base">
                      {profileData.village || '—'}
                    </span>
                  </div>

                </div>

              </div>

            </div>

            <div className="space-y-8">

              {/* Personal Information */}

              <div>

                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <User className="h-6 w-6 mr-2 text-blue-600" />
                  Personal Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <InfoCard
                    label="Full Name"
                    value={profileData.name}
                  />

                  <InfoCard
                    label="Mobile Number"
                    value={profileData.mobile}
                  />

                  <InfoCard
                    label="Email Address"
                    value={profileData.email}
                  />

                </div>

              </div>

              {/* Location Details */}

              <div>

                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-blue-600" />
                  Location Details
                </h4>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">

                  <p className="text-sm text-gray-500 font-semibold mb-1">
                    Address
                  </p>

                  <p className="text-lg font-bold text-gray-800">
                    {profileData.address || '—'}
                  </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                  <InfoCard
                    label="State"
                    value={profileData.state}
                  />

                  <InfoCard
                    label="District"
                    value={profileData.district}
                  />

                  <InfoCard
                    label="Sub-District"
                    value={profileData.subDistrict}
                  />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                  <InfoCard
                    label="Panchayat"
                    value={profileData.panchayat}
                  />

                  <InfoCard
                    label="Village"
                    value={profileData.village}
                  />

                  <InfoCard
                    label="Pincode"
                    value={profileData.pincode}
                  />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <InfoCard
                    label="Post Office"
                    value={profileData.postOffice}
                  />

                  <InfoCard
                    label="Police Station"
                    value={profileData.policeStation}
                  />

                </div>

              </div>

            </div>

            {/* Action Buttons */}

            <div className="mt-8 pt-6 border-t-2 border-gray-100 space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <button
                  onClick={handleEdit}
                  className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-all font-bold shadow-lg flex items-center justify-center space-x-2 text-lg"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() =>
                    setShowPasswordModal(true)
                  }
                  className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-all font-bold shadow-lg flex items-center justify-center space-x-2 text-lg"
                >
                  <Lock className="h-5 w-5" />
                  <span>Change Password</span>
                </button>

              </div>

              {/* Danger Zone */}

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                  <div>

                    <h3 className="text-lg font-bold text-red-800 flex items-center mb-1">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Danger Zone
                    </h3>

                    <p className="text-sm text-red-700">
                      Permanently delete your account and all data. This cannot be undone.
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setShowDeleteModal(true)
                    }
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all font-bold shadow-lg flex items-center space-x-2 whitespace-nowrap"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Delete Account</span>
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      ) : (

        // EDIT MODE

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">

            <h2 className="text-3xl font-bold">
              Edit Profile
            </h2>

            <p className="text-blue-50 mt-1">
              Update your personal information
            </p>

          </div>

          <div className="p-4 md:p-8 space-y-8">

            {/* Profile Photo */}

            <div className="flex justify-center">

              <div className="relative">

                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl overflow-hidden">

                  {editData.profilePreview ||
                  editData.profilePhoto ? (

                    <img
                      src={
                        editData.profilePreview ||
                        editData.profilePhoto
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    getInitials(
                      editData.name
                    ).toUpperCase()

                  )}

                </div>

                <label className="absolute bottom-0 right-0 bg-blue-600 p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-all shadow-lg">

                  <Camera className="h-5 w-5 text-white" />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                </label>

              </div>

            </div>

            {/* Personal Information */}

            <section className="space-y-4">

              <div className="flex items-center space-x-2 pb-2 border-b-2 border-blue-500">

                <User className="h-5 w-5 text-blue-600" />

                <h3 className="font-bold text-gray-800">
                  Personal Information
                </h3>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Name */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>

                  <div className="relative">

                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((p) => ({
                          ...p,
                          name: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                  </div>

                </div>

                {/* Mobile */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number *
                  </label>

                  <div className="relative">

                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                      type="tel"
                      value={editData.mobile}
                      onChange={(e) =>
                        setEditData((p) => ({
                          ...p,
                          mobile: e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 10),
                        }))
                      }
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                  </div>

                </div>

              </div>

              {/* Email */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>

                <div className="relative">

                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      handleEmailChange(e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      emailChanged && !emailVerified
                        ? "border-orange-400"
                        : "border-green-400"
                    }`}
                  />

                </div>

                {/* Email unchanged / verified */}

                {!emailChanged && (
                  <div className="mt-2 flex items-center gap-2 text-green-600 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    <span>Email Verified</span>
                  </div>
                )}

                {/* Changed email but not verified */}

                {emailChanged && !emailVerified && (
                  <div className="mt-3 space-y-3">

                    {!emailVerificationSent ? (
                      <button
                        type="button"
                        onClick={handleRequestEmailChange}
                        disabled={
                          sendingEmailOtp ||
                          emailOtpCooldown > 0
                        }
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {sendingEmailOtp
                          ? "Sending OTP..."
                          : emailOtpCooldown > 0
                            ? `Resend OTP in ${emailOtpCooldown}s`
                            : "Verify New Email"}
                      </button>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

                        <p className="text-sm text-blue-800 font-semibold mb-3">
                          OTP sent to <span className="font-bold">{editData.email}</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2">

                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={emailOtp}
                            onChange={(e) =>
                              setEmailOtp(
                                e.target.value
                                  .replace(/\D/g, '')
                                  .slice(0, 6)
                              )
                            }
                            placeholder="Enter 6-digit OTP"
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tracking-widest text-center font-bold"
                          />

                          <button
                            type="button"
                            onClick={handleVerifyEmailChange}
                            disabled={
                              verifyingEmailOtp ||
                              emailOtp.length !== 6
                            }
                            className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition-all font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {verifyingEmailOtp
                              ? "Verifying..."
                              : "Verify OTP"}
                          </button>

                        </div>

                        <div className="mt-3">

                          {emailOtpCooldown > 0 ? (
                            <p className="text-sm text-gray-600">
                              You can resend OTP in{" "}
                              <span className="font-bold">
                                {emailOtpCooldown}s
                              </span>
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResendEmailOtp}
                              disabled={sendingEmailOtp}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-sm disabled:text-gray-400"
                            >
                              {sendingEmailOtp
                                ? "Sending..."
                                : "Resend OTP"}
                            </button>
                          )}

                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* Verified new email */}

                {emailChanged && emailVerified && (
                  <div className="mt-2 flex items-center gap-2 text-green-600 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    <span>New Email Verified</span>
                  </div>
                )}

              </div>

            </section>

            {/* Location Details */}

            <section className="space-y-4">

              <div className="flex items-center space-x-2 pb-2 border-b-2 border-green-500">

                <MapPin className="h-5 w-5 text-green-600" />

                <h3 className="font-bold text-gray-800">
                  Location Details
                </h3>

              </div>

              {/* Address */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address *
                </label>

                <div className="relative">

                  <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

                  <textarea
                    value={editData.address}
                    onChange={(e) =>
                      setEditData((p) => ({
                        ...p,
                        address: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="House No. 123, Main Road, Rampur"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />

                </div>

              </div>

              {/* State | District | Sub-District */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <SelectField
                  label="State"
                  value={editData.stateCode}
                  onChange={() => {}}
                  options={states.map((state) => ({
                    value: state.stateCode,
                    label: state.stateName,
                  }))}
                  disabled={true}
                  placeholder={editData.state || "State"}
                  required
                />

                <SelectField
                  label="District"
                  value={editData.districtCode}
                  onChange={() => {}}
                  options={districts.map((district) => ({
                    value: district.districtCode,
                    label: district.districtName,
                  }))}
                  disabled={true}
                  placeholder={editData.district || "District"}
                  required
                />

                <SelectField
                  label="Sub-District"
                  value={editData.subDistrictCode}
                  onChange={() => {}}
                  options={subDistricts.map((subDistrict) => ({
                    value: subDistrict.subDistrictCode,
                    label: subDistrict.subDistrictName,
                  }))}
                  disabled={true}
                  placeholder={
                    editData.subDistrict ||
                    "Sub-District"
                  }
                  required
                />

              </div>

              {/* Panchayat | Village | Pincode */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Panchayat */}

                <SelectField
                  label="Panchayat"
                  value={editData.panchayatCode}
                  onChange={() => {}}
                  options={panchayats.map((panchayat) => ({
                    value: panchayat.panchayatCode,
                    label: panchayat.panchayatName,
                  }))}
                  disabled={true}
                  placeholder={
                    editData.panchayat ||
                    "Panchayat"
                  }
                  required
                />

                {/* Village */}

                <SelectField
                  label="Village"
                  value={editData.villageCode}
                  onChange={() => {}}
                  options={villages.map((village) => ({
                    value: village.villageCode,
                    label: village.villageName,
                  }))}
                  disabled={true}
                  placeholder={
                    editData.village ||
                    "Village"
                  }
                  required
                />

                {/* Pincode */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode *
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={editData.pincode}
                    placeholder="Auto-filled on village select"
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg bg-green-50 text-gray-700 cursor-not-allowed placeholder:text-gray-400 placeholder:text-xs"
                  />

                </div>

              </div>

              {/* Post Office | Police Station */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Post Office */}

                <SelectField
                  label="Post Office"
                  value={editData.postOffice}
                  onChange={setLocation('postOffice')}
                  options={postOffices.map((postOffice) => ({
                    value:
                      postOffice.officeName,
                    label:
                      postOffice.officeName,
                  }))}
                  disabled={
                    !editData.villageCode ||
                    loadingPostOffices
                  }
                  placeholder={
                    loadingPostOffices
                      ? "Loading..."
                      : "Select Post Office"
                  }
                  required
                />

                {/* Police Station */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Police Station *
                  </label>

                  <div className="relative">

                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                      type="text"
                      value={editData.policeStation}
                      onChange={(e) =>
                        setEditData((p) => ({
                          ...p,
                          policeStation:
                            e.target.value,
                        }))
                      }
                      placeholder="Enter police station name"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                  </div>

                </div>

              </div>

            </section>

            {/* Save / Cancel */}

            <div className="flex space-x-4 pt-2">

              <button
                onClick={handleSave}
                disabled={!canSaveProfile}
                className={`flex-1 text-white px-6 py-4 rounded-lg transition-all font-bold shadow-lg flex items-center justify-center space-x-2 text-lg ${
                  canSaveProfile
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <Save className="h-6 w-6" />
                <span>Save Changes</span>
              </button>

              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-500 text-white px-6 py-4 rounded-lg hover:bg-gray-600 transition-all font-bold shadow-lg flex items-center justify-center space-x-2 text-lg"
              >
                <X className="h-6 w-6" />
                <span>Cancel</span>
              </button>

            </div>

          </div>

        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}

      {showPasswordModal && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">

          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full shadow-2xl">

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">

              <div className="flex items-center justify-between">

                <div className="flex items-center space-x-3">

                  <Lock className="h-6 w-6" />

                  <h2 className="text-2xl font-bold">
                    Change Password
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setShowPasswordModal(false)
                  }
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

            </div>

            <form
              onSubmit={handlePasswordSubmit}
              className="p-6 space-y-4"
            >

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password *
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter current password"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password *
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={
                    passwordData.newPassword
                  }
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter new password (min 6 characters)"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password *
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Confirm new password"
                />

              </div>

              <div className="flex space-x-3 pt-4">

                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-lg"
                >
                  Change Password
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordModal(false)
                  }
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* DELETE ACCOUNT MODAL */}

      {showDeleteModal && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">

          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full shadow-2xl">

            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">

              <div className="flex items-center space-x-3">

                <AlertTriangle className="h-6 w-6" />

                <h2 className="text-2xl font-bold">
                  Delete Account
                </h2>

              </div>

            </div>

            <div className="p-6">

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">

                <p className="text-red-800 font-semibold mb-2">
                  Warning: This action cannot be undone!
                </p>

                <p className="text-red-700 text-sm">
                  Deleting your account will permanently remove:
                </p>

                <ul className="text-red-700 text-sm mt-2 space-y-1 ml-4">

                  <li>
                    • All your personal information
                  </li>

                  <li>
                    • All your complaints and history
                  </li>

                  <li>
                    • All your scheme applications
                  </li>

                  <li>
                    • Access to your dashboard
                  </li>

                </ul>

              </div>

              <p className="text-gray-700 mb-6">
                Are you absolutely sure you want to delete your account?
              </p>

              <div className="flex space-x-3">

                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>
                    Yes, Delete My Account
                  </span>
                </button>

                <button
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}