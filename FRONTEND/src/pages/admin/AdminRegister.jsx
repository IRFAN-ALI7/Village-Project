import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserPlus, Mail, Phone, Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import API_URL from '../../config/api';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const {confirmPassword, ...dataToSend} = formData;
    try{
    const res = await fetch(`${API_URL}/admin/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend)
    });
    
    const data = await res.json();
    if(res.ok){
      localStorage.setItem("token", data.token);
      alert(data.message);
      navigate('/admin/login');
    }else{
      alert(data.message);
    }
  }catch(err){
    console.log(err);
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
                <Shield className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Smart Village</h1>
                <p className="text-white/80 text-lg">Admin Portal</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Why Join as Admin?</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Manage Village Operations</h3>
                  <p className="text-white/80 text-sm">Handle complaints, schemes, and certificates efficiently</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Monitor Users</h3>
                  <p className="text-white/80 text-sm">Track and manage all registered villagers</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Real-time Analytics</h3>
                  <p className="text-white/80 text-sm">Get insights and statistics about village activities</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Publish Notices</h3>
                  <p className="text-white/80 text-sm">Communicate with villagers through notices and announcements</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Registration</h2>
            <p className="text-gray-600">Create your admin account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:shadow-xl transition-all font-semibold text-lg mt-6"
            >
              Create Admin Account
            </button>

            {/* Already Registered */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/admin/login')}
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
