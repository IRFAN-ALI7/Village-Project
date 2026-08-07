import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import API_URL from '../config/api';
import {
  UserPlus,
  User,
  Phone,
  Lock,
  MapPin,
  Building2,
  Home,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  Camera
} from 'lucide-react';

import villageImg from "../assets/villageImg.png";
export default function RegistrationPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
 const [profilePic, setProfilePic] = useState({
  preview: "",
  file: null,
});
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    village: '',
    wardNo: '',
    postOffice: '',
    policeStation: '',
    district: '',
    state: '',
    pincode: '',
    password: '',
  });

const handleProfilePic = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const previewUrl = URL.createObjectURL(file);

  setProfilePic({
    preview: previewUrl,
    file: file,
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = new FormData();

    data.append("profileImage", profilePic.file);

    data.append("name", formData.name);
    data.append("mobile", formData.mobile);
    data.append("email", formData.email);
    data.append("address", formData.address);
    data.append("panchayat", formData.panchayat);
    data.append("village", formData.village);
    data.append("wardNo", formData.wardNo);
    data.append("postOffice", formData.postOffice);
    data.append("policeStation", formData.policeStation);
    data.append("district", formData.district);
    data.append("state", formData.state);
    data.append("pincode", formData.pincode);
    data.append("password", formData.password);

    const res = await fetch(`${API_URL}/user/register`, {
      method: "POST",
      body: data,
    });

    const result = await res.json();

    if (res.ok) {
      alert(result.message);
      localStorage.setItem("token", result.token);
      navigate("/dashboard");
    } else {
      alert(result.message);
    }
  } catch (err) {
    console.error(err);
    alert("Server Error");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-white space-y-6 hidden lg:block">
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>

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

          {/* Village Image */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <img
              src={villageImg}
              alt="Village"
              className="rounded-xl w-full shadow-2xl mb-6"
            />
            <h2 className="text-2xl font-bold mb-4">Join Our Digital Village!</h2>
            <p className="text-white/90 text-lg mb-6">
              Register now to access all village services and stay connected with your community.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
                <span className="text-white/90">File complaints and track progress</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
                <span className="text-white/90">Apply for government schemes</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
                <span className="text-white/90">Get certificates online</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
                <span className="text-white/90">Stay updated with notices</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 max-h-[90vh] overflow-y-auto">
          {/* Mobile Back Button */}
          <button
            onClick={() => navigate('/')}
            className="lg:hidden flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>

          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600">Register to access village services</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 hover:border-green-500 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden transition-all"
                >
                  {profilePic.preview
                    ? <img src={profilePic.preview} alt="Profile" className="w-full h-full object-cover" />
                    : <Camera className="h-8 w-8 text-gray-400 group-hover:text-green-500 transition-colors" />
                  }
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-green-500 hover:bg-green-600 text-white rounded-full p-1.5 shadow-md transition-colors"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">Click to upload profile photo</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePic} />
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b-2 border-green-500">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="font-bold text-gray-800">Personal Information</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number <span className="text-red-600">*</span>
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b-2 border-blue-500">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">Location Details</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House No. 123, Main Road, Rampur"
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                  />
                </div>
              </div>

           <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2">
            Panchayat Name <span className="text-red-600">*</span>
           </label>
          <input
          type="text"
          required
           value={formData.panchayat}
         onChange={(e) =>
          setFormData({ ...formData, panchayat: e.target.value })
           }
            placeholder="Enter panchayat name"
             className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
          </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Village <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Enter village name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ward No <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.wardNo}
                    onChange={(e) => setFormData({ ...formData, wardNo: e.target.value })}
                    placeholder="Enter ward number"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Post Office <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postOffice}
                    onChange={(e) => setFormData({ ...formData, postOffice: e.target.value })}
                    placeholder="Enter post office"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Police Station <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.policeStation}
                    onChange={(e) => setFormData({ ...formData, policeStation: e.target.value })}
                    placeholder="Enter police station"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Administrative Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b-2 border-purple-500">
                <Building2 className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-gray-800">Administrative Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    District <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="District"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="123456"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b-2 border-orange-500">
                <Lock className="h-5 w-5 text-orange-600" />
                <h3 className="font-bold text-gray-800">Security</h3>
              </div>

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
                    placeholder="Minimum 4 characters"
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
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2 bg-gray-50 p-4 rounded-lg">
              <input type="checkbox" required className="mt-1 h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <label className="text-sm text-gray-600">
                I agree to the <span className="text-green-600 font-semibold">Terms and Conditions</span> and <span className="text-green-600 font-semibold">Privacy Policy</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:shadow-xl transition-all font-semibold text-lg"
            >
              Create Account
            </button>

            {/* Already have account */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
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
