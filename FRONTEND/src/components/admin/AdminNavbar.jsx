import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, ChevronDown, User, Edit, Lock, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function AdminNavbar({ onMenuClick, pageTitle }) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const notifications = [
    { id: 1, text: 'New complaint registered', time: '5 min ago', unread: true },
    { id: 2, text: 'User John Doe verified', time: '10 min ago', unread: true },
    { id: 3, text: 'Certificate request approved', time: '1 hour ago', unread: false },
    { id: 4, text: 'New scheme application', time: '2 hours ago', unread: false },
  ];

  const [adminData, setAdminData] = useState({
    name: 'Admin Sharma',
    email: 'admin@rampur.gov.in',
    phone: '9876543210',
    role: 'Super Admin',
    photo: '',
  });

  const [editData, setEditData] = useState(adminData);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-r from-green-600 to-blue-600 shadow-lg z-50">
        <div className="h-full px-4 md:px-8 flex items-center justify-between">
          {/* Left: Hamburger Menu */}
          <button
            onClick={onMenuClick}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
          >
            <Menu className="h-6 w-6 text-white" />
          </button>

          {/* Center: Page Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-white text-xl md:text-2xl font-bold whitespace-nowrap">
              {pageTitle}
            </h1>
          </div>

          {/* Right: Notification + Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm relative"
              >
                <Bell className="h-6 w-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4">
                    <h3 className="font-bold text-lg">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          notif.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className={`text-sm ${notif.unread ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                          {notif.text}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t">
                    <button 
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/admin/notifications');
                      }}
                      className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 pr-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {adminData.photo ? (
                    <img src={adminData.photo} alt="Admin" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    'AS'
                  )}
                </div>
                <span className="text-white font-semibold hidden md:block">Admin</span>
                <ChevronDown className="h-4 w-4 text-white" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl shadow-lg overflow-hidden">
                        {adminData.photo ? (
                          <img src={adminData.photo} alt="Admin" className="h-full w-full object-cover" />
                        ) : (
                          'AS'
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{adminData.name}</h3>
                        <p className="text-sm text-white/80">{adminData.role}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1 text-sm text-white/90">
                      <p>{adminData.email}</p>
                      <p>{adminData.phone}</p>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowEditProfile(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all text-gray-700"
                    >
                      <Edit className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Edit Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowChangePassword(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all text-gray-700"
                    >
                      <Lock className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold">Change Password</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteAccount(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-all text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="font-semibold">Delete Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setAdminData(editData);
                    setShowEditProfile(false);
                    alert('Profile updated successfully!');
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Change Password</h2>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    if (passwordData.newPassword !== passwordData.confirmPassword) {
                      alert('Passwords do not match!');
                      return;
                    }
                    setShowChangePassword(false);
                    alert('Password changed successfully!');
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Change Password
                </button>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Delete Account</h2>
                <button
                  onClick={() => setShowDeleteAccount(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <p className="text-red-800 font-semibold mb-2">Warning: This action cannot be undone!</p>
                <p className="text-red-700 text-sm">
                  Deleting your admin account will permanently remove all access and data.
                </p>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete your account?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    alert('Account deleted!');
                    navigate('/');
                  }}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-all font-semibold"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteAccount(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}