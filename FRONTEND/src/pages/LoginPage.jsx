import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogIn, Phone, Lock, Eye, EyeOff, Home, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../config/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
  });
  const [forgotData, setForgotData] = useState({
    mobile: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async(e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if(res.ok){
      toast.success(data.message);
      localStorage.setItem("token", data.token);
      navigate('/dashboard');
      setFormData({
        mobile: "",
        password: ""
      });
    }else{
      toast.error(data.message);
    }
  };

  const handleResetPassword = async(e) => {
    e.preventDefault();

    if (!forgotData.mobile.trim()) {
      alert('Please enter your phone number!');
      return;
    }
    if (!/^[0-9]{10}$/.test(forgotData.mobile)) {
      alert('Please enter a valid 10-digit phone number!');
      return;
    }
    if (!forgotData.newPassword || !forgotData.confirmPassword) {
      alert('Please fill all fields!');
      return;
    }
    if (forgotData.newPassword.length < 4) {
      alert('Password must be at least 4 characters!');
      return;
    }
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try{
    const res = await fetch(`${API_URL}/user/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile: forgotData.mobile,
        newPassword: forgotData.newPassword,
      }),
    });
    const data = await res.json();
    if(res.ok){
      toast.success(data.message);
      closeForgotPasswordModal();
    }else{
      toast.error(data.message);
    }
    }catch(err){
    alert(err);
  }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotData({
      mobile: '',
      newPassword: '',
      confirmPassword: '',
    });
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
                <p className="text-white/80 text-lg">Digital Gram Panchayat</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Welcome Back!</h2>
            <p className="text-white/90 text-lg mb-6">
              Login to access all village services and stay connected with your community.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">File Complaints</h3>
                  <p className="text-white/80 text-sm">Register and track your complaints with 21+ categories</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Apply for Schemes</h3>
                  <p className="text-white/80 text-sm">Access government schemes and benefits</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Get Certificates</h3>
                  <p className="text-white/80 text-sm">Apply for birth, death, income, and caste certificates</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Stay Updated</h3>
                  <p className="text-white/80 text-sm">Get latest notices and announcements</p>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-2">User Login</h2>
            <p className="text-gray-600">Enter your credentials to access your account</p>
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
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
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
                  minLength={4}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:shadow-xl transition-all font-semibold text-lg"
            >
              Login to Portal
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
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/login')}
              className="mt-4 w-full px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-semibold"
            >
              Login as Admin
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Reset Password</h2>
                <button
                  onClick={closeForgotPasswordModal}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-blue-800 text-sm">
                  Enter your registered phone number and set a new password.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={forgotData.mobile}
                    onChange={(e) => setForgotData({ ...forgotData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="9876543210"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={forgotData.newPassword}
                    onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={forgotData.confirmPassword}
                    onChange={(e) => setForgotData({ ...forgotData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleResetPassword}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Reset Password
                </button>
                <button
                  onClick={closeForgotPasswordModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
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