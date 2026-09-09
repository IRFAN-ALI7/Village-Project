import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import API_URL from "../../config/api";

export default function SuperAdminLogin() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [forgotForm, setForgotForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [resetToken, setResetToken] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    // OTP should contain numbers only
    if (name === "otp") {
      updatedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setForgotForm((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    if (error) {
      setError("");
    }
  };

  // LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/super-admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid email or password."
        );
        return;
      }

      if (!data.success || !data.token) {
        setError(
          data.message ||
            "Login failed. Please try again."
        );
        return;
      }

      // JWT token save
      localStorage.setItem("token", data.token);

      // Super Admin information save
      if (data.superAdmin) {
        localStorage.setItem(
          "superAdmin",
          JSON.stringify(data.superAdmin)
        );
      }

      toast.success(
        data.message ||
          "Super Admin login successful"
      );

      navigate("/super-admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Super Admin Login Error:",
        error
      );

      setError(
        "Unable to connect to server. Please check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // SEND OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    setError("");

    const email = forgotForm.email
      .trim()
      .toLowerCase();

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/super-admin/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to send OTP. Please try again."
        );
        return;
      }

      setForgotForm((prev) => ({
        ...prev,
        email,
        otp: "",
      }));

      setMode("otp");

      toast.success(
        data.message ||
          "OTP sent successfully to your email."
      );
    } catch (error) {
      console.error(
        "Send OTP Error:",
        error
      );

      setError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");

    const email = forgotForm.email
      .trim()
      .toLowerCase();

    const otp = forgotForm.otp.trim();

    if (!email) {
      setError(
        "Email is required."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Please enter a valid 6-digit OTP."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/super-admin/forgot-password/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Invalid OTP. Please try again."
        );
        return;
      }

      if (!data.resetToken) {
        setError(
          "OTP verified, but password reset session could not be created."
        );
        return;
      }

      // Save short-lived reset token
      setResetToken(data.resetToken);

      setMode("reset");

      toast.success(
        data.message ||
          "OTP verified successfully."
      );
    } catch (error) {
      console.error(
        "OTP Verification Error:",
        error
      );

      setError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // RESET PASSWORD
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");

    const newPassword =
      forgotForm.newPassword;

    const confirmPassword =
      forgotForm.confirmPassword;

    if (!newPassword || !confirmPassword) {
      setError(
        "New password and confirm password are required."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (!resetToken) {
      setError(
        "Password reset session has expired. Please request a new OTP."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/super-admin/forgot-password/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resetToken,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to reset password. Please try again."
        );
        return;
      }

      toast.success(
        data.message ||
          "Password reset successfully."
      );

      setForgotForm({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });

      setResetToken("");

      setMode("login");

      setForm({
        email: "",
        password: "",
      });
    } catch (error) {
      console.error(
        "Reset Password Error:",
        error
      );

      setError(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // BACK TO LOGIN
  const handleBackToLogin = () => {
    setMode("login");
    setError("");
    setResetToken("");

    setForgotForm({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="h-9 w-9 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white">
            {mode === "login"
              ? "Super Admin Login"
              : "Reset Password"}
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            Smart Village Portal — Restricted Access
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN */}
          {mode === "login" && (
            <>
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      required
                      autoComplete="current-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-11 py-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm"
                >
                  {loading
                    ? "Logging in..."
                    : "Login"}
                </button>
              </form>

              {/* Forgot Password */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMode("forgot");
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}

          {/* FORGOT PASSWORD - EMAIL */}
          {mode === "forgot" && (
            <form
              onSubmit={handleSendOTP}
              className="space-y-5"
            >

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Forgot Password
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Enter your registered email address. We will
                  send you an OTP to verify your account.
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={forgotForm.email}
                    onChange={handleForgotChange}
                    placeholder="Enter registered email"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Send OTP */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm"
              >
                {loading
                  ? "Sending OTP..."
                  : "Send OTP"}
              </button>

              {/* Back */}
              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-indigo-600 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>
            </form>
          )}

          {/* OTP */}
          {mode === "otp" && (
            <form
              onSubmit={handleVerifyOTP}
              className="space-y-5"
            >

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Verify OTP
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Enter the 6-digit OTP sent to your
                  registered email address.
                </p>
              </div>

              {/* Email */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400">
                  OTP sent to
                </p>

                <p className="text-sm font-semibold text-gray-700 break-all mt-1">
                  {forgotForm.email}
                </p>
              </div>

              {/* OTP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  OTP
                </label>

                <input
                  type="text"
                  name="otp"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={forgotForm.otp}
                  onChange={handleForgotChange}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all tracking-widest text-center"
                />
              </div>

              {/* Verify OTP */}
              <button
                type="submit"
                disabled={
                  loading ||
                  forgotForm.otp.length !== 6
                }
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm"
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>

              {/* Back */}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("forgot");
                  setForgotForm((prev) => ({
                    ...prev,
                    otp: "",
                  }));
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-indigo-600 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </form>
          )}

          {/* RESET PASSWORD */}
          {mode === "reset" && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-5"
            >

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Create New Password
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Enter your new password and confirm it below.
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    name="newPassword"
                    required
                    autoComplete="new-password"
                    value={
                      forgotForm.newPassword
                    }
                    onChange={handleForgotChange}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-11 py-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  Password must be at least 8 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    required
                    autoComplete="new-password"
                    value={
                      forgotForm.confirmPassword
                    }
                    onChange={handleForgotChange}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-11 py-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Reset Password */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm shadow-sm"
              >
                {loading
                  ? "Resetting..."
                  : "Reset Password"}
              </button>

              {/* Back */}
              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-indigo-600 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          This portal is for authorized Super Administrators only.
        </p>
      </div>
    </div>
  );
}