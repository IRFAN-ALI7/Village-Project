import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  Lock,
  Loader2,
  X,
} from "lucide-react";

import SuperAdminLayout from "../../../components/super-admin/layout/SuperAdminLayout";
import API_URL from "../../../config/api";

function PwInput({
  name,
  label,
  placeholder,
  value,
  show,
  error,
  loading,
  onChange,
  onToggle,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={loading}
          autoComplete={
            name === "current"
              ? "current-password"
              : "new-password"
          }
          className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    current: "",
    newPw: "",
    confirm: "",
  });

  const [show, setShow] = useState({
    current: false,
    newPw: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const toggle = (key) => {
    setShow((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const validate = () => {
    const e = {};

    if (!form.current) {
      e.current = "Current password is required";
    }

    if (!form.newPw) {
      e.newPw = "New password is required";
    } else if (form.newPw.length < 8) {
      e.newPw = "New password must be at least 8 characters";
    }

    if (form.newPw === form.current && form.newPw) {
      e.newPw = "New password must differ from current password";
    }

    if (!form.confirm) {
      e.confirm = "Please confirm your new password";
    } else if (form.newPw !== form.confirm) {
      e.confirm = "Passwords do not match";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.removeItem("superAdmin");
        navigate("/super-admin/login", { replace: true });
        return;
      }

      const response = await fetch(
        `${API_URL}/super-admin/profile/change-password`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: form.current,
            newPassword: form.newPw,
          }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("superAdmin");

        navigate("/super-admin/login", { replace: true });
        return;
      }

      if (!response.ok || !result.success) {
        setServerError(
          result.message || "Failed to update password"
        );
        return;
      }

      setForm({
        current: "",
        newPw: "",
        confirm: "",
      });

      setErrors({});
      setSuccess(true);
    } catch (error) {
      console.error("Change Password Error:", error);

      setServerError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperAdminLayout
      breadcrumbs={[
        {
          label: "Profile",
          path: "/super-admin/profile",
        },
        {
          label: "Change Password",
        },
      ]}
    >
      <div className="max-w-md mx-auto space-y-5">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/super-admin/profile")}
          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </button>

        {/* Server Error */}
        {serverError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <X className="h-5 w-5 shrink-0 mt-0.5" />

            <p className="text-sm font-medium">
              {serverError}
            </p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
            <h2 className="text-white font-bold">
              Change Password
            </h2>

            <p className="text-indigo-200 text-xs mt-0.5">
              Use a strong, unique password for your account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5 space-y-4"
          >
            <PwInput
              name="current"
              label="Current Password"
              placeholder="Enter current password"
              value={form.current}
              show={show.current}
              error={errors.current}
              loading={loading}
              onChange={handleChange}
              onToggle={() => toggle("current")}
            />

            <PwInput
              name="newPw"
              label="New Password"
              placeholder="Min 8 characters"
              value={form.newPw}
              show={show.newPw}
              error={errors.newPw}
              loading={loading}
              onChange={handleChange}
              onToggle={() => toggle("newPw")}
            />

            <PwInput
              name="confirm"
              label="Confirm Password"
              placeholder="Re-enter new password"
              value={form.confirm}
              show={show.confirm}
              error={errors.confirm}
              loading={loading}
              onChange={handleChange}
              onToggle={() => toggle("confirm")}
            />

            {/* Requirements */}
            <div className="bg-indigo-50 rounded-lg p-3 text-xs text-indigo-700 space-y-1">
              <p className="font-semibold">
                Password requirements:
              </p>

              <ul className="list-disc list-inside space-y-0.5 text-indigo-600">
                <li>Minimum 8 characters</li>
                <li>Must differ from your current password</li>
                <li>
                  Use letters, numbers, and special characters
                  for best security
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg text-sm transition-colors"
              >
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {loading ? "Updating..." : "Update Password"}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/super-admin/profile")
                }
                disabled={loading}
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-9 w-9 text-green-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Password Updated!
            </h3>

            <p className="text-gray-500 text-sm mb-6">
              Your password has been changed successfully.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/super-admin/profile")
              }
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold text-sm"
            >
              Back to Profile
            </button>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}