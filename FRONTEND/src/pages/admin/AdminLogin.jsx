import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogIn, Phone, Lock, Eye, EyeOff, Shield, X } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [forgotData, setForgotData] = useState({
    phone: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try{
    const res = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if(res.ok){
      toast.success(data.message);
      localStorage.setItem("token", data.token);
      localStorage.setItem("adminName", data.name);
      setFormData({
        phone: "",
        password: "",
      });
      navigate('/admin/dashboard');
    }else{
      toast.error(data.message);
    }
  }catch(err){
    console.log(err);
  }
  };

  const handleForgotPassword = () => {
    if (!forgotData.phone.trim()) {
      alert('Please enter your phone number!');
      return;
    }
    if (!/^[0-9]{10}$/.test(forgotData.phone)) {
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
    alert('Password reset successful! Please login with your new password.');
    closeForgotPasswordModal();
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotData({
      phone: '',
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
                <Shield className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Smart Village</h1>
                <p className="text-white/80 text-lg">Admin Portal</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Welcome Back, Admin!</h2>
            <p className="text-white/90 text-lg mb-6">
              Login to access your admin dashboard and manage village operations efficiently.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Secure Access</h3>
                  <p className="text-white/80 text-sm">Protected admin authentication</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Full Control</h3>
                  <p className="text-white/80 text-sm">Manage all village services</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Real-time Updates</h3>
                  <p className="text-white/80 text-sm">Stay updated with notifications</p>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h2>
            <p className="text-gray-600">Enter your credentials to access admin panel</p>
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="9876543210"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                    errors.phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  className={`w-full pl-11 pr-12 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Forgot Password */}
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
              Login to Admin Panel
            </button>

            {/* Not Registered */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Don't have an admin account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/admin/register')}
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
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Forgot Password?</h2>
                <button
                  onClick={() => setShowForgotPassword(false)}
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
                    value={forgotData.phone}
                    onChange={(e) => setForgotData({ ...forgotData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
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
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  onClick={handleForgotPassword}
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