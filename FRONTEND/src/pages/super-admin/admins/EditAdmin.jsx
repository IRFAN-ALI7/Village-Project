import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
  ArrowLeft,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import SuperAdminLayout from "../../../components/super-admin/layout/SuperAdminLayout";
import API_URL from "../../../config/api";

const STATE_CODE = 20;

function SelectField({
  label,
  value,
  onChange,
  options,
  valueKey,
  labelKey,
  disabled,
  loading,
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
          className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <option value="">
            {loading
              ? "Loading..."
              : disabled
              ? "— Select above first —"
              : `Select ${label}`}
          </option>

          {options.map((option) => (
            <option
              key={option[valueKey]}
              value={option[valueKey]}
            >
              {option[labelKey]}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

export default function EditAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [admin, setAdmin] = useState(null);

  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [panchayats, setPanchayats] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    districtCode: "",
    subDistrictCode: "",
    panchayatCode: "",
  });

  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // =====================================================
  // EMAIL VERIFICATION
  // =====================================================

  const [originalEmail, setOriginalEmail] =
    useState("");

  const [emailVerified, setEmailVerified] =
    useState(false);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [otpVerifying, setOtpVerifying] =
    useState(false);

  const [emailVerificationError, setEmailVerificationError] =
    useState("");

  const [emailVerificationMessage, setEmailVerificationMessage] =
    useState("");

  // =====================================================
  // GET ADMIN
  // =====================================================

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/super-admin/admins/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch admin"
        );
      }

      const fetchedAdmin = data.admin;

      setAdmin(fetchedAdmin);

      const fetchedEmail = (
        fetchedAdmin.email || ""
      )
        .trim()
        .toLowerCase();

      setOriginalEmail(fetchedEmail);

      setEmailVerified(true);

      setForm({
        name: fetchedAdmin.name || "",
        email: fetchedAdmin.email || "",
        phone: fetchedAdmin.phone || "",
        districtCode:
          fetchedAdmin.districtCode?.toString() || "",
        subDistrictCode:
          fetchedAdmin.subDistrictCode?.toString() ||
          "",
        panchayatCode:
          fetchedAdmin.panchayatCode?.toString() || "",
      });
    } catch (err) {
      console.error(
        "Fetch admin error:",
        err
      );

      setError(
        err.message || "Failed to fetch admin"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET DISTRICTS
  // =====================================================

  const fetchDistricts = async () => {
    try {
      setLocationLoading(true);

      const response = await fetch(
        `${API_URL}/api/locations/states/${STATE_CODE}/districts`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch districts"
        );
      }

      setDistricts(data.data || []);
    } catch (err) {
      console.error(
        "District error:",
        err
      );

      setError(
        err.message ||
          "Failed to fetch districts"
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchAdmin();
    fetchDistricts();
  }, [id]);

  // =====================================================
  // DISTRICT → SUBDISTRICTS
  // =====================================================

  useEffect(() => {
    if (!form.districtCode) {
      setSubDistricts([]);
      return;
    }

    const fetchSubDistricts = async () => {
      try {
        setLocationLoading(true);

        const response = await fetch(
          `${API_URL}/api/locations/districts/${form.districtCode}/subdistricts`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch sub-districts"
          );
        }

        setSubDistricts(data.data || []);
      } catch (err) {
        console.error(
          "Subdistrict error:",
          err
        );

        setSubDistricts([]);

        setError(
          err.message ||
            "Failed to fetch sub-districts"
        );
      } finally {
        setLocationLoading(false);
      }
    };

    fetchSubDistricts();
  }, [form.districtCode]);

  // =====================================================
  // SUBDISTRICT → PANCHAYATS
  // =====================================================

  useEffect(() => {
    if (!form.subDistrictCode) {
      setPanchayats([]);
      return;
    }

    const fetchPanchayats = async () => {
      try {
        setLocationLoading(true);

        const response = await fetch(
          `${API_URL}/api/locations/subdistricts/${form.subDistrictCode}/panchayats`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch panchayats"
          );
        }

        setPanchayats(data.data || []);
      } catch (err) {
        console.error(
          "Panchayat error:",
          err
        );

        setPanchayats([]);

        setError(
          err.message ||
            "Failed to fetch panchayats"
        );
      } finally {
        setLocationLoading(false);
      }
    };

    fetchPanchayats();
  }, [form.subDistrictCode]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleDistrictChange = (value) => {
    setForm((prev) => ({
      ...prev,
      districtCode: value,
      subDistrictCode: "",
      panchayatCode: "",
    }));

    setPanchayats([]);
  };

  const handleSubDistrictChange = (value) => {
    setForm((prev) => ({
      ...prev,
      subDistrictCode: value,
      panchayatCode: "",
    }));
  };

  // =====================================================
  // EMAIL CHANGE
  // =====================================================

  const handleEmailChange = (value) => {
    setForm((prev) => ({
      ...prev,
      email: value,
    }));

    const normalizedEmail = value
      .trim()
      .toLowerCase();

    // ==================================================
    // SAME EMAIL AS ORIGINAL
    // ==================================================

    if (
      normalizedEmail === originalEmail
    ) {
      setEmailVerified(true);
      setOtpSent(false);
      setOtp("");
      setEmailVerificationError("");
      setEmailVerificationMessage("");

      return;
    }

    // ==================================================
    // NEW EMAIL
    // OTP VERIFICATION REQUIRED
    // ==================================================

    setEmailVerified(false);
    setOtpSent(false);
    setOtp("");
    setEmailVerificationError("");
    setEmailVerificationMessage("");

    setError("");
  };

  // =====================================================
  // SEND EMAIL OTP
  // =====================================================

  const handleSendEmailOtp = async () => {
    setError("");
    setEmailVerificationError("");
    setEmailVerificationMessage("");

    const email = form.email
      .trim()
      .toLowerCase();

    if (!email) {
      setEmailVerificationError(
        "Email is required"
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setEmailVerificationError(
        "Please enter a valid email address"
      );

      return;
    }

    // Same email does not need OTP
    if (email === originalEmail) {
      setEmailVerified(true);
      return;
    }

    if (!token) {
      setEmailVerificationError(
        "Super Admin session expired. Please login again."
      );

      return;
    }

    setOtpLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/super-admin/admins/${id}/verify-email/send-otp`,
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

      setEmailVerificationMessage(
        "A 6-digit verification code has been sent to your new email address."
      );
    } catch (err) {
      console.error(
        "Send Edit Email OTP Error:",
        err
      );

      setEmailVerificationError(
        err.message ||
          "Unable to send verification code"
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // =====================================================
  // VERIFY EMAIL OTP
  // =====================================================

  const handleVerifyEmailOtp = async () => {
    setError("");
    setEmailVerificationError("");
    setEmailVerificationMessage("");

    const email = form.email
      .trim()
      .toLowerCase();

    if (!/^\d{6}$/.test(otp)) {
      setEmailVerificationError(
        "Please enter the 6-digit verification code."
      );

      return;
    }

    if (!token) {
      setEmailVerificationError(
        "Super Admin session expired. Please login again."
      );

      return;
    }

    setOtpVerifying(true);

    try {
      const response = await fetch(
        `${API_URL}/super-admin/admins/${id}/verify-email/verify-otp`,
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
      setOtpSent(false);
      setOtp("");

      setEmailVerificationError("");

      setEmailVerificationMessage(
        "Email address verified successfully."
      );
    } catch (err) {
      console.error(
        "Verify Edit Email OTP Error:",
        err
      );

      setEmailVerified(false);

      setEmailVerificationError(
        err.message ||
          "Unable to verify email address"
      );
    } finally {
      setOtpVerifying(false);
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      form.email.trim()
    )) {
      setError("Please enter a valid email address");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError(
        "Phone number must be exactly 10 digits"
      );
      return;
    }

    if (!form.districtCode) {
      setError("Please select district");
      return;
    }

    if (!form.subDistrictCode) {
      setError(
        "Please select sub-district"
      );
      return;
    }

    if (!form.panchayatCode) {
      setError("Please select Panchayat");
      return;
    }

    const normalizedEmail = form.email
      .trim()
      .toLowerCase();

    // ==================================================
    // EMAIL VERIFICATION
    // Only required when email has changed.
    // ==================================================

    const emailChanged =
      normalizedEmail !== originalEmail;

    if (
      emailChanged &&
      !emailVerified
    ) {
      setError(
        "Please verify the new email address before saving."
      );

      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "email",
        normalizedEmail
      );

      formData.append(
        "phone",
        form.phone.trim()
      );

      formData.append(
        "stateCode",
        String(STATE_CODE)
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

      const response = await fetch(
        `${API_URL}/super-admin/admins/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update admin"
        );
      }

      setAdmin(data.admin);

      // Update original email after successful save
      setOriginalEmail(normalizedEmail);
      setEmailVerified(true);
      setOtpSent(false);
      setOtp("");

      setSuccess(true);
    } catch (err) {
      console.error(
        "Update admin error:",
        err
      );

      setError(
        err.message ||
          "Failed to update admin"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SuperAdminLayout
        breadcrumbs={[
          {
            label: "Admins",
            path: "/super-admin/admins",
          },
          {
            label: "Loading...",
          },
        ]}
      >
        <div className="text-center py-24 text-gray-500">
          Loading admin...
        </div>
      </SuperAdminLayout>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!admin) {
    return (
      <SuperAdminLayout
        breadcrumbs={[
          {
            label: "Admins",
            path: "/super-admin/admins",
          },
          {
            label: "Not Found",
          },
        ]}
      >
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <AlertTriangle className="h-12 w-12 mb-3 text-gray-300" />

          <p className="text-lg font-semibold">
            Admin not found
          </p>

          {error && (
            <p className="text-sm text-red-500 mt-2">
              {error}
            </p>
          )}

          <button
            onClick={() =>
              navigate(
                "/super-admin/admins"
              )
            }
            className="mt-4 text-indigo-600 text-sm font-medium"
          >
            Back to Admins
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout
      breadcrumbs={[
        {
          label: "Admins",
          path: "/super-admin/admins",
        },
        {
          label: admin.name,
          path: `/super-admin/admins/${id}`,
        },
        {
          label: "Edit",
        },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-5">

        {/* BACK */}
        <button
          onClick={() =>
            navigate(
              `/super-admin/admins/${id}`
            )
          }
          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </button>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* PERSONAL INFO */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
              <h2 className="text-white font-bold">
                Personal Information
              </h2>
            </div>

            <div className="p-5 space-y-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name *
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address *
                  </label>

                  <div className="flex gap-2">

                    <div className="relative flex-1">
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          handleEmailChange(
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm outline-none transition-all
                          ${
                            emailVerified
                              ? "border-green-300 bg-green-50 text-green-700"
                              : "border-gray-200 focus:ring-2 focus:ring-indigo-500"
                          }
                        `}
                      />

                      {emailVerified && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-green-600" />
                      )}
                    </div>

                    {!emailVerified && (
                      <button
                        type="button"
                        onClick={
                          handleSendEmailOtp
                        }
                        disabled={
                          otpLoading ||
                          !form.email.trim()
                        }
                        className="shrink-0 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        {otpLoading
                          ? "Sending..."
                          : otpSent
                          ? "Resend OTP"
                          : "Verify Email"}
                      </button>
                    )}
                  </div>

                  {/* VERIFIED */}
                  {emailVerified && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />

                      <p className="text-xs font-semibold text-green-700">
                        Email Verified ✓
                      </p>
                    </div>
                  )}

                  {/* OTP */}
                  {!emailVerified &&
                    otpSent && (
                      <div className="mt-3 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">

                        <p className="text-xs text-gray-600 mb-2">
                          A 6-digit OTP has been sent
                          to{" "}
                          <span className="font-semibold text-gray-800">
                            {form.email
                              .trim()
                              .toLowerCase()}
                          </span>
                          .
                        </p>

                        <div className="flex gap-2">

                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => {
                              setOtp(
                                e.target.value
                                  .replace(
                                    /\D/g,
                                    ""
                                  )
                                  .slice(
                                    0,
                                    6
                                  )
                              );

                              setEmailVerificationError(
                                ""
                              );
                            }}
                            placeholder="6-digit OTP"
                            className="flex-1 px-3 py-2.5 border border-indigo-200 bg-white rounded-lg text-sm text-center tracking-[0.25em] font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          />

                          <button
                            type="button"
                            onClick={
                              handleVerifyEmailOtp
                            }
                            disabled={
                              otpVerifying ||
                              otp.length !==
                                6
                            }
                            className="shrink-0 px-3 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            {otpVerifying
                              ? "Verifying..."
                              : "Verify OTP"}
                          </button>

                        </div>

                        <p className="mt-2 text-[11px] text-gray-400">
                          OTP is valid for 10 minutes.
                        </p>
                      </div>
                    )}

                  {/* VERIFICATION MESSAGE */}
                  {emailVerificationMessage && (
                    <p className="mt-2 text-xs text-green-600">
                      {
                        emailVerificationMessage
                      }
                    </p>
                  )}

                  {/* VERIFICATION ERROR */}
                  {emailVerificationError && (
                    <p className="mt-2 text-xs text-red-600">
                      {
                        emailVerificationError
                      }
                    </p>
                  )}
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        phone: e.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            10
                          ),
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

              </div>
            </div>
          </div>

          {/* PANCHAYAT ASSIGNMENT */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
              <h2 className="text-white font-bold">
                Panchayat Assignment
              </h2>
            </div>

            <div className="p-5 space-y-4">

              {/* STATE */}
              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  State
                </label>

                <div className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 font-medium">
                  {admin.state ||
                    "Jharkhand"}

                  <span className="text-xs text-gray-400 ml-1">
                    (fixed)
                  </span>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* DISTRICT */}
                <SelectField
                  label="District *"
                  value={
                    form.districtCode
                  }
                  onChange={
                    handleDistrictChange
                  }
                  options={districts}
                  valueKey="districtCode"
                  labelKey="districtName"
                  disabled={
                    locationLoading &&
                    !districts.length
                  }
                  loading={
                    locationLoading &&
                    !districts.length
                  }
                />

                {/* SUB DISTRICT */}
                <SelectField
                  label="Sub-District *"
                  value={
                    form.subDistrictCode
                  }
                  onChange={
                    handleSubDistrictChange
                  }
                  options={subDistricts}
                  valueKey="subDistrictCode"
                  labelKey="subDistrictName"
                  disabled={
                    !form.districtCode
                  }
                  loading={
                    locationLoading &&
                    !!form.districtCode &&
                    !subDistricts.length
                  }
                />

                {/* PANCHAYAT */}
                <SelectField
                  label="Panchayat *"
                  value={
                    form.panchayatCode
                  }
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      panchayatCode:
                        value,
                    }))
                  }
                  options={panchayats}
                  valueKey="panchayatCode"
                  labelKey="panchayatName"
                  disabled={
                    !form.subDistrictCode
                  }
                  loading={
                    locationLoading &&
                    !!form.subDistrictCode &&
                    !panchayats.length
                  }
                />

              </div>
            </div>
          </div>

          {/* PASSWORD NOTE */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-700">
            <strong>Note:</strong> Password is not changed from
            this page. The admin can use the password recovery
            process if needed.
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">

            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg text-sm disabled:opacity-50"
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/super-admin/admins/${id}`
                )
              }
              disabled={saving}
              className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-sm"
            >
              Cancel
            </button>

          </div>

        </form>
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-8 text-center">

            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">

              <CheckCircle className="h-8 w-8 text-green-600" />

            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Changes Saved!
            </h3>

            <p className="text-gray-500 text-sm mb-6">
              Admin profile has been updated successfully.
            </p>

            <button
              onClick={() =>
                navigate(
                  `/super-admin/admins/${id}`
                )
              }
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold text-sm"
            >
              View Admin
            </button>

          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}