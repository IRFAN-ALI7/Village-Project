import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Home,
  Bell,
  ChevronDown,
  Lock,
  X,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router";
import axios from "axios";
import API_URL from "../../config/api";
import toast from "react-hot-toast";

export default function AdminNavbar({ onMenuClick, pageTitle }) {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Admin",
    photo: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // FETCH ADMIN PROFILE FROM BACKEND
  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const res = await axios.get(`${API_URL}/admin/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data || res.data?.admin || res.data;

      setAdminData({
        name: data?.name || "",
        email: data?.email || "",
        phone: data?.phone || "",
        role: data?.role || "Admin",
        photo: data?.profilePhoto || data?.photo || "",
      });
    } catch (err) {
      console.error("Error fetching admin profile:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await axios.get(`${API_URL}/activity/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(res.data?.activities || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // CHANGE PASSWORD
  const handleChangePassword = async () => {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      setPasswordLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Session expired. Please login again.");
        navigate("/admin/login");
        return;
      }

      await axios.put(
        `${API_URL}/admin/change-password`,
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Password changed successfully.");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowChangePassword(false);
      setShowProfileMenu(false);
    } catch (err) {
      console.error("Change password error:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    localStorage.removeItem("token");

    setShowProfileMenu(false);
    setShowNotifications(false);

    navigate("/admin/login");
  };

  // INITIALS
  const getInitials = () => {
    if (!adminData.name) return "A";

    return adminData.name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <>
      {/* 
          NAVBAR
       */}
      <nav className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-gradient-to-r from-green-600 to-blue-600 shadow-lg z-50">
        <div className="h-full px-3 md:px-8 flex items-center gap-2">

          {/* Hamburger */}
          <button
            onClick={onMenuClick}
            className="shrink-0 p-2 md:p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
          >
            <Menu className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </button>

          {/* Home */}
          <button
            onClick={() => navigate("/")}
            className="shrink-0 flex items-center gap-2 px-2.5 py-2 md:px-4 md:py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm text-white"
          >
            <Home className="h-5 w-5 md:h-5 md:w-5" />

            <span className="hidden sm:block font-semibold">
              Home
            </span>
          </button>

          {/* Page Title */}
          <div className="flex-1 min-w-0 flex justify-center">
            <h1 className="text-white text-base md:text-2xl font-bold truncate max-w-full px-2 text-center">
              {pageTitle}
            </h1>
          </div>

          {/* Right Side */}
          <div className="shrink-0 flex items-center gap-2 md:gap-4">

            {/* 
                NOTIFICATIONS
             */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() =>
                  setShowNotifications(!showNotifications)
                }
                className="p-2 md:p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm relative"
              >
                <Bell className="h-5 w-5 md:h-6 md:w-6 text-white" />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm md:w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50">

                  <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4">
                    <h3 className="font-bold text-lg">
                      Notifications
                    </h3>
                  </div>

                  <div className="max-h-72 md:max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notif.isRead ? "bg-blue-50" : ""
                          }`}
                        >
                          <p
                            className={`text-sm ${
                              !notif.isRead
                                ? "font-semibold text-gray-800"
                                : "text-gray-600"
                            }`}
                          >
                            {notif.title}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {notif.createdAt}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 text-center border-t">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/admin/notifications");
                      }}
                      className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 
                ADMIN PROFILE
             */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() =>
                  setShowProfileMenu(!showProfileMenu)
                }
                className="flex items-center gap-2 p-2 md:pr-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg shrink-0 overflow-hidden">
                  {adminData.photo ? (
                    <img
                      src={adminData.photo}
                      alt="Admin"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>

                <span className="text-white font-semibold hidden md:block">
                  {adminData.name || "Admin"}
                </span>

                <ChevronDown className="h-4 w-4 text-white hidden md:block" />
              </button>

              {/* 
                  PROFILE DROPDOWN
               */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-xs md:w-72 bg-white rounded-2xl shadow-2xl overflow-hidden z-50">

                  {/* Profile Information */}
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
                    <div className="flex items-center space-x-4">

                      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl shadow-lg overflow-hidden">
                        {adminData.photo ? (
                          <img
                            src={adminData.photo}
                            alt="Admin"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials()
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-lg truncate">
                          {adminData.name || "Admin"}
                        </h3>

                        <p className="text-sm text-white/80 capitalize">
                          {adminData.role || "Admin"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1 text-sm text-white/90 break-words">
                      <p>{adminData.email || "—"}</p>
                      <p>{adminData.phone || "—"}</p>
                    </div>
                  </div>

                  {/* Profile Actions */}
                  <div className="p-2">

                    {/* Change Password */}
                    <button
                      onClick={() => {
                        setShowChangePassword(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all text-gray-700"
                    >
                      <Lock className="h-5 w-5 text-purple-600" />

                      <span className="font-semibold">
                        Change Password
                      </span>
                    </button>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all text-gray-700"
                    >
                      <LogOut className="h-5 w-5 text-gray-600" />

                      <span className="font-semibold">
                        Logout
                      </span>
                    </button>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 
          CHANGE PASSWORD MODAL
       */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                  Change Password
                </h2>

                <button
                  onClick={() => setShowChangePassword(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>
            </div>

            <div className="p-6 space-y-4">

              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>

                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="Enter current password"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>

                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="Enter new password"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="Confirm new password"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">

                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {passwordLoading
                    ? "Changing..."
                    : "Change Password"}
                </button>

                <button
                  onClick={() => {
                    setShowChangePassword(false);

                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  disabled={passwordLoading}
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