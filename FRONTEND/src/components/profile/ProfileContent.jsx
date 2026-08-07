import { useEffect, useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Shield, 
  Map, 
  Flag,
  Edit,
  Lock,
  Trash2,
  Camera,
  AlertTriangle,
  ArrowLeft,
  Save,
  X,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router';
import API_URL from '../../config/api';

export default function ProfileContent() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: 'Rajesh Kumar',
    mobile: '9876543210',
    email: 'rajesh.kumar@example.com',
    address: 'House No. 123, Main Road, Rampur',
    village: 'Rampur',
    wardNo: '5',
    postOffice: 'Rampur Post',
    policeStation: 'Rampur Thana',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: '221001',
    profileImage: '',
  });

  const [editData, setEditData] = useState(profileData);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  
    useEffect(()=> {
    const fetchProfile = async()=> {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setProfileData(data);
    };
    fetchProfile();
  },[]);

    useEffect(()=> {
    if(profileData){
      setEditData(profileData);
    }
  },[profileData]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");

    const data = new FormData();

    data.append("name", editData.name || "");
    data.append("mobile", editData.mobile || "");
    data.append("email", editData.email || "");
    data.append("address", editData.address || "");
    data.append("panchayat", editData.panchayat || "");
    data.append("village", editData.village || "");
    data.append("wardNo", editData.wardNo || "");
    data.append("postOffice", editData.postOffice || "");
    data.append("policeStation", editData.policeStation || "");
    data.append("district", editData.district || "");
    data.append("state", editData.state || "");
    data.append("pincode", editData.pincode || "");

    // New image file only
    if (editData.profileFile) {
      data.append("profileImage", editData.profileFile);
    }

    const res = await fetch(
      `${API_URL}/user/${profileData._id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      }
    );

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || "Profile update failed");
      return;
    }

    setProfileData(result);
    setEditData(result);
    setIsEditing(false);

    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Profile update error:", error);
    alert("Server Error");
  }
};

   const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async(e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }
    if (passwordData.newPassword.length < 4) {
      alert('Password must be at least 4 characters long!');
      return;
    }

    const token = localStorage.getItem("token");
    const res =  await fetch(`${API_URL}/user/change-password`,{
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
    });
    const data = await res.json();
    if(res.ok){
       alert(data.message);
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    }else{
      alert(data.message);
    }
   
  };

 const handleDeleteAccount = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/user/${profileData._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to delete account");
      return;
    }

    localStorage.removeItem("token");

    alert(data.message || "Account deleted successfully!");

    setShowDeleteModal(false);

    window.location.href = "/";
  } catch (error) {
    console.error("Delete account error:", error);
    alert("Server Error. Please try again.");
  }
};

  const handlePhotoUpload = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const previewUrl = URL.createObjectURL(file);

  setEditData((prev) => ({
    ...prev,
    profileFile: file,
    profilePreview: previewUrl,
  }));
};

  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold transition-all"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Dashboard</span>
      </button>

      {!isEditing ? (
        // READ-ONLY VIEW
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">User Profile</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Profile Photo and Name */}
            <div className="flex items-center space-x-6 mb-8 pb-6 border-b-2 border-gray-100">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl overflow-hidden">
                {profileData.profileImage ? (
                  <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  getInitials(profileData.name).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{profileData.name}</h3>
                <p className="text-blue-600 font-semibold text-lg mb-2">Village Member</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="font-semibold">{profileData.mobile}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="font-semibold">Ward {profileData.wardNo}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="space-y-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <User className="h-6 w-6 mr-2 text-blue-600" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Full Name</p>
                    <p className="text-lg font-bold text-gray-800">{profileData.name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Mobile Number</p>
                    <p className="text-lg font-bold text-gray-800">{profileData.mobile}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Email Address</p>
                    <p className="text-lg font-bold text-gray-800">{profileData.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Ward Number</p>
                    <p className="text-lg font-bold text-gray-800">{profileData.wardNo}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-blue-600" />
                  Address Information
                </h4>
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Full Address</p>
                    <p className="text-lg font-bold text-gray-800">{profileData.address}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 font-semibold mb-1">
                   Panchayat
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                   {profileData.panchayat}
                   </p>
              </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Village</p>
                    <p className="text-lg font-bold text-gray-800">{profileData.village}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Post Office</p>
                    <p className="text-lg font-bold text-gray-800">{profileData.postOffice}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Police Station</p>
                    <p className="text-lg font-bold text-gray-800">{profileData.policeStation}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 font-semibold mb-1">District</p>
                    <p className="text-lg font-bold text-gray-800">{profileData.district}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 font-semibold mb-1">State</p>
                    <p className="text-lg font-bold text-gray-800">{profileData.state}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Pincode</p>
                    <p className="text-lg font-bold text-gray-800">{profileData.pincode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-all font-bold shadow-lg flex items-center justify-center space-x-2 text-lg"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-all font-bold shadow-lg flex items-center justify-center space-x-2 text-lg"
                >
                  <Lock className="h-5 w-5" />
                  <span>Change Password</span>
                </button>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-red-800 flex items-center mb-1">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all data. This cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all font-bold shadow-lg flex items-center space-x-2 whitespace-nowrap"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // EDIT MODE
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <h2 className="text-3xl font-bold">Edit Profile</h2>
            <p className="text-blue-50 mt-1">Update your personal information</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Profile Photo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl overflow-hidden">
                {editData.profilePreview || editData.profileImage ? (
                   <img
                src={editData.profilePreview || editData.profileImage}
             alt="Profile"
              className="w-full h-full object-cover"
                 />
            ) : (
               getInitials(editData.name).toUpperCase()
                 )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-all shadow-lg">
                  <Camera className="h-5 w-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="mobile"
                    value={editData.mobile}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ward Number *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="wardNo"
                    value={editData.wardNo}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
              Panchayat *
           </label>
           <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
               <input
               type="text"
               name="panchayat"
               value={editData.panchayat}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             />
             </div>
             </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Village *</label>
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="village"
                    value={editData.village}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Post Office *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="postOffice"
                    value={editData.postOffice}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Police Station *</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="policeStation"
                    value={editData.policeStation}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">District *</label>
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="district"
                    value={editData.district}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                <div className="relative">
                  <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="state"
                    value={editData.state}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="pincode"
                    value={editData.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Address Field - Full Width */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address *</label>
              <div className="relative">
                <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="address"
                  value={editData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="House No. 123, Main Road, Rampur"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-all font-bold shadow-lg flex items-center justify-center space-x-2 text-lg"
              >
                <Save className="h-6 w-6" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-500 text-white px-6 py-4 rounded-lg hover:bg-gray-600 transition-all font-bold shadow-lg flex items-center justify-center space-x-2 text-lg"
              >
                <X className="h-6 w-6" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lock className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">Change Password</h2>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter new password (min 4 characters)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-lg"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Delete Account</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <p className="text-red-800 font-semibold mb-2">Warning: This action cannot be undone!</p>
                <p className="text-red-700 text-sm">
                  Deleting your account will permanently remove:
                </p>
                <ul className="text-red-700 text-sm mt-2 space-y-1 ml-4">
                  <li>• All your personal information</li>
                  <li>• All your complaints and history</li>
                  <li>• All your scheme applications</li>
                  <li>• Access to your dashboard</li>
                </ul>
              </div>
              <p className="text-gray-700 mb-6">
                Are you absolutely sure you want to delete your account?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Yes, Delete My Account</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold"
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