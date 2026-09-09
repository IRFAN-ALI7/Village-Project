import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  LogIn,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Home,
  X,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../config/api';

export default function LoginPage() {
  const navigate = useNavigate();

  // =========================
  // LOGIN STATES
  // =========================
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
  });

  // =========================
  // FORGOT PASSWORD STATES
  // =========================
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState('email');

  const [forgotData, setForgotData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [resetToken, setResetToken] = useState('');

  const [otpCooldown, setOtpCooldown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =========================
  // OTP COOLDOWN
  // =========================
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

  // =========================
  // LOGIN
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mobile.trim()) {
      toast.error('Please enter your phone number.');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!formData.password) {
      toast.error('Please enter your password.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoginLoading(true);

      const res = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Login successful!');

        localStorage.setItem('token', data.token);

        setFormData({
          mobile: '',
          password: '',
        });

        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // =========================
  // OPEN FORGOT PASSWORD
  // =========================
  const openForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotStep('email');

    setForgotData({
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    });

    setResetToken('');
    setOtpCooldown(0);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // =========================
  // SEND FORGOT PASSWORD OTP
  // =========================
  const handleSendForgotOtp = async (e) => {
    e.preventDefault();

    const email = forgotData.email.trim().toLowerCase();

    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (otpCooldown > 0) {
      toast.error(`Please wait ${otpCooldown} seconds before requesting another OTP.`);
      return;
    }

    try {
      setSendingOtp(true);

      const res = await fetch(`${API_URL}/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setForgotData((prev) => ({
          ...prev,
          email,
          otp: '',
        }));

        setForgotStep('otp');
        setOtpCooldown(60);

        toast.success(data.message || 'OTP sent to your email.');
      } else {
        toast.error(data.message || 'Unable to send OTP.');
      }
    } catch (err) {
      console.error('Forgot password OTP error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // =========================
  // VERIFY FORGOT PASSWORD OTP
  // =========================
  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();

    const otp = forgotData.otp.trim();

    if (!otp) {
      toast.error('Please enter the OTP.');
      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setVerifyingOtp(true);

      const res = await fetch(`${API_URL}/user/forgot-password/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotData.email,
          otp,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (!data.resetToken) {
          toast.error('Reset token was not received. Please try again.');
          return;
        }

        setResetToken(data.resetToken);
        setForgotStep('password');

        toast.success(data.message || 'OTP verified successfully.');
      } else {
        toast.error(data.message || 'Invalid OTP.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // =========================
  // RESEND OTP
  // =========================
  const handleResendForgotOtp = async () => {
    if (otpCooldown > 0 || sendingOtp) {
      return;
    }

    const email = forgotData.email.trim().toLowerCase();

    if (!email) {
      toast.error('Email address is missing.');
      setForgotStep('email');
      return;
    }

    try {
      setSendingOtp(true);

      const res = await fetch(`${API_URL}/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setForgotData((prev) => ({
          ...prev,
          otp: '',
        }));

        setOtpCooldown(60);

        toast.success(data.message || 'New OTP sent successfully.');
      } else {
        toast.error(data.message || 'Unable to resend OTP.');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // =========================
  // RESET PASSWORD
  // =========================
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetToken) {
      toast.error('Password reset session expired. Please start again.');
      setForgotStep('email');
      return;
    }

    if (!forgotData.newPassword) {
      toast.error('Please enter your new password.');
      return;
    }

    if (forgotData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (!forgotData.confirmPassword) {
      toast.error('Please confirm your new password.');
      return;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setResettingPassword(true);

      const res = await fetch(`${API_URL}/user/forgot-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken,
          newPassword: forgotData.newPassword,
          confirmPassword: forgotData.confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Password reset successfully.');

        closeForgotPasswordModal();
      } else {
        toast.error(data.message || 'Unable to reset password.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setResettingPassword(false);
    }
  };

  // =========================
  // CLOSE FORGOT PASSWORD
  // =========================
  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);

    setForgotStep('email');

    setForgotData({
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    });

    setResetToken('');
    setOtpCooldown(0);
    setSendingOtp(false);
    setVerifyingOtp(false);
    setResettingPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // =========================
  // BACK TO PREVIOUS FORGOT STEP
  // =========================
  const handleForgotBack = () => {
    if (forgotStep === 'password') {
      setForgotStep('otp');
      setForgotData((prev) => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }));
      setResetToken('');
      return;
    }

    if (forgotStep === 'otp') {
      setForgotStep('email');
      setForgotData((prev) => ({
        ...prev,
        otp: '',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* Left Side - Branding */}
        <div className="text-white space-y-6 hidden lg:block">
          <div className="space-y-4">
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

          <div className="space-y-4 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">
              Welcome Back!
            </h2>

            <p className="text-white/90 text-lg mb-6">
              Login to access all village services and stay connected with your community.
            </p>

            <div className="space-y-4">

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">File Complaints</h3>
                  <p className="text-white/80 text-sm">
                    Register and track your complaints with 21+ categories
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Apply for Schemes</h3>
                  <p className="text-white/80 text-sm">
                    Access government schemes and benefits
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Get Certificates</h3>
                  <p className="text-white/80 text-sm">
                    Apply for birth, death, income, and caste certificates
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Stay Updated</h3>
                  <p className="text-white/80 text-sm">
                    Get latest notices and announcements
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">

          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mb-4">
              <LogIn className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              User Login
            </h2>

            <p className="text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-600">*</span>
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mobile: e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10),
                    })
                  }
                  placeholder="9876543210"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-600">*</span>
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  placeholder="Enter password"
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />

                <span className="ml-2 text-sm text-gray-600">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={openForgotPassword}
                className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:shadow-xl transition-all font-semibold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loginLoading ? 'Logging in...' : 'Login to Portal'}
            </button>

            {/* Not Registered */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Don't have an account?{' '}

                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Register here
                </button>
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700 text-sm font-semibold transition-colors"
              >
                ← Back to Home
              </button>
            </div>

          </form>

          {/* Admin Link */}
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="mt-4 w-full px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-semibold"
            >
              Login as Admin
            </button>
          </div>

        </div>
      </div>

      {/* =========================
          FORGOT PASSWORD MODAL
      ========================= */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">
                  {forgotStep !== 'email' && (
                    <button
                      type="button"
                      onClick={handleForgotBack}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  )}

                  <h2 className="text-2xl font-bold">
                    Reset Password
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeForgotPasswordModal}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

            </div>

            <div className="p-6">

              {/* =========================
                  STEP 1 - EMAIL
              ========================= */}
              {forgotStep === 'email' && (
                <form
                  onSubmit={handleSendForgotOtp}
                  className="space-y-5"
                >

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex gap-3">
                      <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />

                      <p className="text-blue-800 text-sm">
                        Enter your registered email address. We will send
                        a 6-digit OTP to verify your identity.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-600">*</span>
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                      <input
                        type="email"
                        required
                        value={forgotData.email}
                        onChange={(e) =>
                          setForgotData({
                            ...forgotData,
                            email: e.target.value,
                          })
                        }
                        placeholder="example@email.com"
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sendingOtp}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={closeForgotPasswordModal}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all font-semibold"
                  >
                    Cancel
                  </button>

                </form>
              )}

              {/* =========================
                  STEP 2 - OTP
              ========================= */}
              {forgotStep === 'otp' && (
                <form
                  onSubmit={handleVerifyForgotOtp}
                  className="space-y-5"
                >

                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <div className="flex gap-3">
                      <Mail className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />

                      <div>
                        <p className="text-green-800 text-sm">
                          OTP has been sent to:
                        </p>

                        <p className="text-green-900 font-semibold text-sm break-all">
                          {forgotData.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Enter 6-Digit OTP{' '}
                      <span className="text-red-600">*</span>
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      autoComplete="one-time-code"
                      value={forgotData.otp}
                      onChange={(e) =>
                        setForgotData({
                          ...forgotData,
                          otp: e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6),
                        })
                      }
                      placeholder="123456"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-2xl tracking-[0.5em] font-bold"
                    />

                    <p className="text-xs text-gray-500 mt-2 text-center">
                      OTP is valid for 10 minutes.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={verifyingOtp}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {verifyingOtp
                      ? 'Verifying OTP...'
                      : 'Verify OTP'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendForgotOtp}
                      disabled={otpCooldown > 0 || sendingOtp}
                      className="text-sm text-blue-600 font-semibold hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {sendingOtp
                        ? 'Sending...'
                        : otpCooldown > 0
                          ? `Resend OTP in ${otpCooldown}s`
                          : 'Resend OTP'}
                    </button>
                  </div>

                </form>
              )}

              {/* =========================
                  STEP 3 - NEW PASSWORD
              ========================= */}
              {forgotStep === 'password' && (
                <form
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >

                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />

                      <p className="text-green-800 text-sm">
                        Email verified successfully. Create your new
                        password below.
                      </p>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password{' '}
                      <span className="text-red-600">*</span>
                    </label>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                      <input
                        type={
                          showNewPassword ? 'text' : 'password'
                        }
                        required
                        minLength={6}
                        value={forgotData.newPassword}
                        onChange={(e) =>
                          setForgotData({
                            ...forgotData,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Minimum 6 characters"
                        className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword(!showNewPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password{' '}
                      <span className="text-red-600">*</span>
                    </label>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                      <input
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        required
                        minLength={6}
                        value={forgotData.confirmPassword}
                        onChange={(e) =>
                          setForgotData({
                            ...forgotData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm new password"
                        className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Password must contain at least 6 characters.
                  </p>

                  <button
                    type="submit"
                    disabled={resettingPassword}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {resettingPassword
                      ? 'Resetting Password...'
                      : 'Reset Password'}
                  </button>

                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}