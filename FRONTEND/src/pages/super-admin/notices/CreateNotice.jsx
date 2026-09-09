import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  Pin,
} from "lucide-react";
import { toast } from "react-hot-toast";

import SuperAdminLayout from "../../../components/super-admin/layout/SuperAdminLayout";
import API_URL from "../../../config/api";

const CATEGORIES = [
  "General",
  "Administrative",
  "Technical",
  "Security",
  "Training",
  "Emergency",
];

const INITIAL_FORM = {
  title: "",
  category: "",
  date: "",
  time: "",
  location: "",
  validUpto: "",
  description: "",
  fullDetails: "",
  audience: "all",
  selectedAdmin: "",
  isPinned: false,
};

export default function CreateNotice() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState(false);
  const [createdNotice, setCreatedNotice] = useState(null);

  const [errors, setErrors] = useState({});

  // =====================================================
  // AUTH TOKEN
  // =====================================================
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // HANDLE FORM FIELD
  // =====================================================
  const set = (key) => (value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    // Remove field error after user changes it
    setErrors((previous) => {
      if (!previous[key]) return previous;

      const updated = { ...previous };
      delete updated[key];

      return updated;
    });
  };

  // =====================================================
// FETCH ADMINS
// =====================================================
const fetchAdmins = async () => {
  try {
    setLoadingAdmins(true);

    const token = getToken();

    if (!token) {
      navigate("/super-admin/login");
      return;
    }

    const response = await fetch(
      `${API_URL}/super-admin/admins`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    console.log("Super Admin - Admin API Response:", result);

    // Unauthorized
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("superAdmin");

      navigate("/super-admin/login");
      return;
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to fetch admins"
      );
    }

    // Backend response ko safely handle karo
    let adminList = [];

    if (Array.isArray(result.data)) {
      adminList = result.data;
    } else if (Array.isArray(result.admins)) {
      adminList = result.admins;
    } else if (
      result.data &&
      Array.isArray(result.data.admins)
    ) {
      adminList = result.data.admins;
    }

    console.log("Admins received:", adminList);

    setAdmins(adminList);
  } catch (error) {
    console.error("Fetch admins error:", error);

    toast.error(
      error.message || "Failed to load admins"
    );

    setAdmins([]);
  } finally {
    setLoadingAdmins(false);
  }
};

  // =====================================================
  // LOAD ADMINS ON PAGE LOAD
  // =====================================================
  useEffect(() => {
    fetchAdmins();
  }, []);

  // =====================================================
  // VALIDATE FORM
  // =====================================================
  const validate = () => {
    const validationErrors = {};

    if (!form.title.trim()) {
      validationErrors.title = "Title is required";
    }

    if (!form.category) {
      validationErrors.category =
        "Category is required";
    }

    if (!form.date) {
      validationErrors.date = "Date is required";
    }

    if (!form.validUpto) {
      validationErrors.validUpto =
        "Valid upto date is required";
    }

    if (!form.description.trim()) {
      validationErrors.description =
        "Description is required";
    }

    if (
      form.audience === "specific" &&
      !form.selectedAdmin
    ) {
      validationErrors.selectedAdmin =
        "Please select an admin";
    }

    // Date validation
    if (form.date && form.validUpto) {
      const noticeDate = new Date(form.date);
      const expiryDate = new Date(form.validUpto);

      if (expiryDate < noticeDate) {
        validationErrors.validUpto =
          "Valid upto date cannot be before notice date";
      }
    }

    setErrors(validationErrors);

    return (
      Object.keys(validationErrors).length === 0
    );
  };

  // =====================================================
  // SUBMIT NOTICE
  // =====================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (!validate()) return;

    try {
      setSubmitting(true);

      const token = getToken();

      if (!token) {
        navigate("/super-admin/login");
        return;
      }

      const payload = {
        title: form.title.trim(),
        category: form.category,
        date: form.date,
        time: form.time,
        location: form.location.trim(),
        validUpto: form.validUpto,
        description: form.description.trim(),
        fullDetails: form.fullDetails.trim(),
        audience: form.audience,
        selectedAdmin:
          form.audience === "specific"
            ? form.selectedAdmin
            : null,
        isPinned: form.isPinned,
      };

      const response = await fetch(
        `${API_URL}/super-admin/notices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      // Unauthorized
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("superAdmin");

        navigate("/super-admin/login");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create notice"
        );
      }

      setCreatedNotice(result.data);
      setSuccess(true);

      toast.success("Notice sent successfully");
    } catch (error) {
      console.error("Create notice error:", error);

      toast.error(
        error.message || "Failed to send notice"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // RESET FORM
  // =====================================================
  const handleSendAnother = () => {
    setSuccess(false);
    setCreatedNotice(null);
    setForm(INITIAL_FORM);
    setErrors({});
  };

  // =====================================================
  // SELECT FIELD COMPONENT
  // =====================================================
  const SelectF = ({
    label,
    value,
    options,
    onChange,
    placeholder,
    error,
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`w-full appearance-none px-3 py-2.5 border rounded-lg text-sm bg-white outline-none ${
            error
              ? "border-red-400 focus:ring-2 focus:ring-red-200"
              : "border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          }`}
        >
          <option value="">
            {placeholder ??
              `Select ${label}`}
          </option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
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

  return (
    <SuperAdminLayout
      breadcrumbs={[
        {
          label: "Notices",
          path: "/super-admin/notices",
        },
        {
          label: "Send Notice",
        },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-5">

        {/* =================================================
            BACK
        ================================================= */}
        <button
          type="button"
          onClick={() =>
            navigate("/super-admin/notices")
          }
          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notices
        </button>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* =================================================
              AUDIENCE
          ================================================= */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
              <h2 className="text-white font-bold">
                Audience
              </h2>
            </div>

            <div className="p-5 space-y-4">

              {/* Audience selection */}
              <div className="flex gap-3">
                {[
                  {
                    value: "all",
                    label: "All Admins",
                  },
                  {
                    value: "specific",
                    label: "Select Admin",
                  },
                ].map(
                  ({ value, label }) => (
                    <label
                      key={value}
                      className={`flex-1 flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                        form.audience === value
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="audience"
                        value={value}
                        checked={
                          form.audience ===
                          value
                        }
                        onChange={() =>
                          set("audience")(value)
                        }
                        className="text-indigo-600"
                      />

                      <span className="text-sm font-semibold text-gray-700">
                        {label}
                      </span>
                    </label>
                  )
                )}
              </div>

              {/* Specific admin */}
              {form.audience ===
                "specific" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Select Admin *
                  </label>

                  <div className="relative">
                    <select
                      value={
                        form.selectedAdmin
                      }
                      onChange={(event) =>
                        set("selectedAdmin")(
                          event.target.value
                        )
                      }
                      disabled={
                        loadingAdmins
                      }
                      className={`w-full appearance-none px-3 py-2.5 border rounded-lg text-sm bg-white outline-none ${
                        errors.selectedAdmin
                          ? "border-red-400"
                          : "border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      } ${
                        loadingAdmins
                          ? "bg-gray-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="">
                        {loadingAdmins
                          ? "Loading admins..."
                          : admins.length === 0
                          ? "No admins available"
                          : "Choose an admin"}
                      </option>

                      {admins.map(
                        (admin) => (
                          <option
                            key={
                              admin._id ||
                              admin.id
                            }
                            value={
                              admin._id ||
                              admin.id
                            }
                          >
                            {admin.name} —{" "}
                            {admin.panchayat ||
                              "Panchayat not assigned"}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  </div>

                  {errors.selectedAdmin && (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        errors.selectedAdmin
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              NOTICE DETAILS
          ================================================= */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
              <h2 className="text-white font-bold">
                Notice Details
              </h2>
            </div>

            <div className="p-5 space-y-4">

              {/* TITLE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Title *
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    set("title")(
                      event.target.value
                    )
                  }
                  placeholder="Enter notice title"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.title
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                />

                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* CATEGORY */}
              <SelectF
                label="Category"
                value={form.category}
                options={CATEGORIES}
                onChange={set("category")}
                error={errors.category}
              />

              {/* DATE + TIME */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Date *
                  </label>

                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      set("date")(
                        event.target.value
                      )
                    }
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                      errors.date
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />

                  {errors.date && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Time
                  </label>

                  <input
                    type="time"
                    value={form.time}
                    onChange={(event) =>
                      set("time")(
                        event.target.value
                      )
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

              </div>

              {/* LOCATION + VALID UPTO */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Location
                  </label>

                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      set("location")(
                        event.target.value
                      )
                    }
                    placeholder="Optional location"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Valid Upto *
                  </label>

                  <input
                    type="date"
                    value={form.validUpto}
                    onChange={(event) =>
                      set("validUpto")(
                        event.target.value
                      )
                    }
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                      errors.validUpto
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />

                  {errors.validUpto && (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        errors.validUpto
                      }
                    </p>
                  )}
                </div>

              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description *
                </label>

                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    set("description")(
                      event.target.value
                    )
                  }
                  placeholder="Brief description of the notice"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none ${
                    errors.description
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                />

                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {
                      errors.description
                    }
                  </p>
                )}
              </div>

              {/* FULL DETAILS */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Details
                </label>

                <textarea
                  rows={5}
                  value={form.fullDetails}
                  onChange={(event) =>
                    set("fullDetails")(
                      event.target.value
                    )
                  }
                  placeholder="Detailed information (optional)"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              {/* PIN */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={(event) =>
                    set("isPinned")(
                      event.target.checked
                    )
                  }
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />

                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Pin className="h-3.5 w-3.5 text-indigo-600" />
                  Pin this notice (shows at top)
                </span>
              </label>

            </div>
          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}
          <div className="flex gap-3">

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-colors shadow-sm"
            >
              {submitting
                ? "Sending Notice..."
                : "Send Notice"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/super-admin/notices"
                )
              }
              disabled={submitting}
              className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>

          </div>
        </form>
      </div>

      {/* =====================================================
          SUCCESS MODAL
      ===================================================== */}
      {success && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-8 text-center">

            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-9 w-9 text-green-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Notice Sent!
            </h3>

            <p className="text-gray-500 text-sm mb-6">
              "{createdNotice?.title ||
                form.title}" has been sent
              to{" "}
              <span className="font-semibold">
                {form.audience === "all"
                  ? "All Admins"
                  : createdNotice
                      ?.selectedAdmin
                      ?.name ||
                    admins.find(
                      (admin) =>
                        (admin._id ||
                          admin.id) ===
                        form.selectedAdmin
                    )?.name ||
                    "Selected Admin"}
              </span>
              .
            </p>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/super-admin/notices"
                  )
                }
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold text-sm"
              >
                View Notices
              </button>

              <button
                type="button"
                onClick={
                  handleSendAnother
                }
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold text-sm"
              >
                Send Another
              </button>

            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}