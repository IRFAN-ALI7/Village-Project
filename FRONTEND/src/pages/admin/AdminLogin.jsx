import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogIn,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import API_URL from "../../config/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  // =========================
  // LOGIN MODE
  // =========================
  const [loginMode, setLoginMode] = useState("password");
  // password = Phone/Email + Password
  // otp = Email + OTP

  const [loginType, setLoginType] = useState("phone");
  // phone / email

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);

  // =========================
  // FORGOT PASSWORD
  // =========================
  const [forgotPassword, setForgotPassword] = useState(false);

  const [forgotStep, setForgotStep] = useState("email");
  // email -> otp -> password

  const [forgotData, setForgotData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [resetToken, setResetToken] = useState("");

  // =========================
  // OTP COUNTDOWN
  // =========================
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    if (otpTimer <= 0) return;

    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpTimer]);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;

    setForgotData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SAVE LOGIN DATA
  // =========================
  const saveLoginData = (data) => {
    if (!data.token || !data.admin) {
      toast.error("Invalid login response from server");
      return false;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("adminName");

    localStorage.setItem("token", data.token);

    localStorage.setItem(
      "admin",
      JSON.stringify(data.admin)
    );

    localStorage.setItem(
      "adminName",
      data.admin.name || ""
    );

    return true;
  };

  // =========================
  // NORMAL LOGIN
  // =========================
  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    const password = formData.password;

    if (loginType === "phone") {
      const phone = formData.phone.trim();

      if (!phone) {
        toast.error("Please enter your phone number");
        return;
      }

      if (!/^[0-9]{10}$/.test(phone)) {
        toast.error(
          "Please enter a valid 10-digit phone number"
        );
        return;
      }

      if (!password) {
        toast.error("Please enter your password");
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/admin/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone,
              password,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          toast.error(
            data.message || "Admin login failed"
          );
          return;
        }

        if (!saveLoginData(data)) return;

        toast.success(
          data.message || "Admin login successful"
        );

        setFormData({
          phone: "",
          email: "",
          password: "",
          otp: "",
        });

        navigate("/admin/dashboard", {
          replace: true,
        });
      } catch (error) {
        console.error(
          "Admin Phone Login Error:",
          error
        );

        toast.error(
          "Unable to connect to server. Please try again."
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    // =========================
    // EMAIL + PASSWORD
    // =========================
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/login`,
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

      if (!response.ok || !data.success) {
        toast.error(
          data.message || "Admin login failed"
        );
        return;
      }

      if (!saveLoginData(data)) return;

      toast.success(
        data.message || "Admin login successful"
      );

      setFormData({
        phone: "",
        email: "",
        password: "",
        otp: "",
      });

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Admin Email Login Error:",
        error
      );

      toast.error(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REQUEST LOGIN OTP
  // =========================
  const handleRequestLoginOtp = async () => {
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/request-login-otp`,
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
        toast.error(
          data.message || "Unable to send login OTP"
        );
        return;
      }

      toast.success(
        data.message ||
          "OTP sent to your registered email"
      );

      setOtpTimer(60);
    } catch (error) {
      console.error(
        "Request Login OTP Error:",
        error
      );

      toast.error(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGIN WITH OTP
  // =========================
  const handleOtpLogin = async (e) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const otp = formData.otp.trim();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/login-with-otp`,
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
        toast.error(
          data.message || "OTP login failed"
        );
        return;
      }

      if (!saveLoginData(data)) return;

      toast.success(
        data.message || "OTP login successful"
      );

      setFormData({
        phone: "",
        email: "",
        password: "",
        otp: "",
      });

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Admin OTP Login Error:",
        error
      );

      toast.error(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORGOT PASSWORD - SEND OTP
  // =========================
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    const email = forgotData.email.trim().toLowerCase();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/forgot-password`,
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
        toast.error(
          data.message ||
            "Unable to send password reset OTP"
        );
        return;
      }

      toast.success(
        data.message ||
          "Password reset OTP sent to your email"
      );

      setForgotStep("otp");
      setOtpTimer(60);
    } catch (error) {
      console.error(
        "Forgot Password Error:",
        error
      );

      toast.error(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VERIFY FORGOT PASSWORD OTP
  // =========================
  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();

    const email = forgotData.email.trim().toLowerCase();
    const otp = forgotData.otp.trim();

    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/verify-forgot-password-otp`,
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
        toast.error(
          data.message ||
            "Invalid or expired OTP"
        );
        return;
      }

      if (!data.resetToken) {
        toast.error(
          "Invalid password reset response"
        );
        return;
      }

      setResetToken(data.resetToken);
      setForgotStep("password");

      toast.success(
        "OTP verified. Set your new password."
      );
    } catch (error) {
      console.error(
        "Verify Forgot Password OTP Error:",
        error
      );

      toast.error(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET PASSWORD
  // =========================
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const newPassword = forgotData.newPassword;
    const confirmPassword =
      forgotData.confirmPassword;

    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        "Password must be at least 8 characters"
      );
      return;
    }

    if (!confirmPassword) {
      toast.error(
        "Please confirm your new password"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!resetToken) {
      toast.error(
        "Password reset session expired. Please try again."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/reset-password`,
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
        toast.error(
          data.message ||
            "Unable to reset password"
        );
        return;
      }

      toast.success(
        data.message ||
          "Password reset successfully"
      );

      setForgotPassword(false);
      setForgotStep("email");

      setForgotData({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });

      setResetToken("");
      setOtpTimer(0);

      setLoginMode("password");
      setLoginType("phone");
    } catch (error) {
      console.error(
        "Reset Password Error:",
        error
      );

      toast.error(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET LOGIN MODE
  // =========================
  const changeLoginMode = (mode) => {
    setLoginMode(mode);

    setFormData((prev) => ({
      ...prev,
      password: "",
      otp: "",
    }));

    setOtpTimer(0);
  };

  // =========================
  // FORGOT PASSWORD SCREEN
  // =========================
  if (forgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* LEFT SIDE */}
          <div className="text-white space-y-6 hidden lg:block">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <Shield className="h-12 w-12 text-white" />
              </div>

              <div>
                <h1 className="text-4xl font-bold">
                  Smart Village
                </h1>

                <p className="text-white/80 text-lg">
                  Admin Portal
                </p>
              </div>
            </div>

            <div className="space-y-4 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h2 className="text-2xl font-bold">
                Reset Your Password
              </h2>

              <p className="text-white/90 text-lg">
                Verify your registered email and
                create a new secure password for
                your admin account.
              </p>

              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
                <KeyRound className="h-5 w-5" />

                <div>
                  <h3 className="font-bold">
                    Secure Password Recovery
                  </h3>

                  <p className="text-white/80 text-sm">
                    Email OTP verification required
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RESET CARD */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">

            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mb-4">
                <KeyRound className="h-8 w-8 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Forgot Password
              </h2>

              <p className="text-gray-600">
                {forgotStep === "email" &&
                  "Enter your registered email address"}

                {forgotStep === "otp" &&
                  "Enter the OTP sent to your email"}

                {forgotStep === "password" &&
                  "Create your new password"}
              </p>
            </div>

            {/* EMAIL STEP */}
            {forgotStep === "email" && (
              <form
                onSubmit={handleForgotPassword}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                      type="email"
                      name="email"
                      value={forgotData.email}
                      onChange={handleForgotChange}
                      disabled={loading}
                      placeholder="Enter registered email"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Sending OTP..."
                    : "Send OTP"}
                </button>
              </form>
            )}

            {/* OTP STEP */}
            {forgotStep === "otp" && (
              <form
                onSubmit={handleVerifyForgotOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter 6-Digit OTP{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                      type="text"
                      name="otp"
                      value={forgotData.otp}
                      onChange={(e) =>
                        setForgotData((prev) => ({
                          ...prev,
                          otp: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6),
                        }))
                      }
                      disabled={loading}
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 tracking-[0.4em] text-center font-semibold disabled:bg-gray-50"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-gray-500">
                      OTP expires in 10 minutes
                    </span>

                    {otpTimer > 0 ? (
                      <span className="text-blue-600 font-medium">
                        Resend in {otpTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Verifying..."
                    : "Verify OTP"}
                </button>
              </form>
            )}

            {/* NEW PASSWORD STEP */}
            {forgotStep === "password" && (
              <form
                onSubmit={handleResetPassword}
                className="space-y-6"
              >
                {/* NEW PASSWORD */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="newPassword"
                      value={forgotData.newPassword}
                      onChange={handleForgotChange}
                      disabled={loading}
                      placeholder="Enter new password"
                      className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Password must be at least 8 characters.
                  </p>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                      type="password"
                      name="confirmPassword"
                      value={
                        forgotData.confirmPassword
                      }
                      onChange={handleForgotChange}
                      disabled={loading}
                      placeholder="Confirm new password"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Resetting Password..."
                    : "Reset Password"}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setForgotPassword(false);
                  setForgotStep("email");
                  setForgotData({
                    email: "",
                    otp: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setResetToken("");
                  setOtpTimer(0);
                }}
                disabled={loading}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // NORMAL LOGIN UI
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* LEFT SIDE */}
        <div className="text-white space-y-6 hidden lg:block">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <Shield className="h-12 w-12 text-white" />
            </div>

            <div>
              <h1 className="text-4xl font-bold">
                Smart Village
              </h1>

              <p className="text-white/80 text-lg">
                Admin Portal
              </p>
            </div>
          </div>

          <div className="space-y-4 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-2xl font-bold">
              Welcome Back, Admin!
            </h2>

            <p className="text-white/90 text-lg">
              Login to access your admin dashboard and
              manage village operations efficiently.
            </p>

            <div className="space-y-3">

              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
                <Shield className="h-5 w-5" />

                <div>
                  <h3 className="font-bold">
                    Secure Access
                  </h3>

                  <p className="text-white/80 text-sm">
                    Protected admin authentication
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
                <Shield className="h-5 w-5" />

                <div>
                  <h3 className="font-bold">
                    Panchayat Management
                  </h3>

                  <p className="text-white/80 text-sm">
                    Manage your assigned Panchayat
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
                <Shield className="h-5 w-5" />

                <div>
                  <h3 className="font-bold">
                    Real-time Updates
                  </h3>

                  <p className="text-white/80 text-sm">
                    Stay updated with notifications
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">

          <div className="mb-8 text-center">

            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mb-4">
              <LogIn className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Login
            </h2>

            <p className="text-gray-600">
              Enter your credentials to access admin panel
            </p>

          </div>

          {/* LOGIN MODE TABS */}
          <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1 mb-6">

            <button
              type="button"
              onClick={() =>
                changeLoginMode("password")
              }
              disabled={loading}
              className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                loginMode === "password"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Password Login
            </button>

            <button
              type="button"
              onClick={() =>
                changeLoginMode("otp")
              }
              disabled={loading}
              className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                loginMode === "otp"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Email OTP
            </button>

          </div>

          {/* PASSWORD LOGIN */}
          {loginMode === "password" && (
            <form
              onSubmit={handlePasswordLogin}
              className="space-y-6"
            >

              {/* LOGIN TYPE */}
              <div className="grid grid-cols-2 gap-2 bg-gray-100 rounded-xl p-1">

                <button
                  type="button"
                  onClick={() =>
                    setLoginType("phone")
                  }
                  disabled={loading}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                    loginType === "phone"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  Phone
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setLoginType("email")
                  }
                  disabled={loading}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                    loginType === "email"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  Email
                </button>

              </div>

              {/* PHONE */}
              {loginType === "phone" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        }))
                      }
                      maxLength={10}
                      disabled={loading}
                      placeholder="Enter 10-digit phone number"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                    />

                  </div>
                </div>
              )}

              {/* EMAIL */}
              {loginType === "email" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Enter your email address"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                    />

                  </div>
                </div>
              )}

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password{" "}
                  <span className="text-red-600">
                    *
                  </span>
                </label>

                <div className="relative">

                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    disabled={loading}
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

              {/* FORGOT PASSWORD */}
              {loginType === "email" && (
                <div className="text-right -mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPassword(true);
                      setForgotStep("email");
                      setForgotData({
                        email: formData.email,
                        otp: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>

            </form>
          )}

          {/* EMAIL OTP LOGIN */}
          {loginMode === "otp" && (
            <form
              onSubmit={handleOtpLogin}
              className="space-y-6"
            >

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address{" "}
                  <span className="text-red-600">
                    *
                  </span>
                </label>

                <div className="relative">

                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter your registered email"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                  />

                </div>
              </div>

              {/* SEND OTP */}
              <button
                type="button"
                onClick={handleRequestLoginOtp}
                disabled={loading || otpTimer > 0}
                className="w-full py-3 border-2 border-blue-500 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {otpTimer > 0
                  ? `OTP Sent • Resend in ${otpTimer}s`
                  : "Send Login OTP"}
              </button>

              {/* OTP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP{" "}
                  <span className="text-red-600">
                    *
                  </span>
                </label>

                <div className="relative">

                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        otp: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6),
                      }))
                    }
                    maxLength={6}
                    disabled={loading}
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 tracking-[0.4em] text-center font-semibold disabled:bg-gray-50"
                  />

                </div>

                <p className="text-xs text-gray-500 mt-2 text-center">
                  OTP is valid for 10 minutes.
                </p>
              </div>

              {/* LOGIN */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Verifying..."
                  : "Login with OTP"}
              </button>

            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-blue-600"
            >
              ← Back to Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}