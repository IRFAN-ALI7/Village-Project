import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Gift,
  CreditCard,
  Megaphone,
  Bell,
  User,
  LogOut,
  X,
  Home,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config/api";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "complaint",
    label: "File Complaint",
    icon: FileText,
    path: "/complaint",
  },
  {
    id: "my-complaints",
    label: "My Complaints",
    icon: ClipboardList,
    path: "/my-complaints",
  },
  {
    id: "schemes",
    label: "Government Schemes",
    icon: Gift,
    path: "/schemes",
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: CreditCard,
    path: "/certificates",
  },
  {
    id: "notices",
    label: "Notice Board",
    icon: Megaphone,
    path: "/notices",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    path: "/notifications",
  },
  {
    id: "profile",
    label: "My Profile",
    icon: User,
    path: "/profile",
  },
];

export default function UserSidebar({ isOpen, onClose, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);

  const [locationNames, setLocationNames] = useState({
    village: "",
    panchayat: "",
  });

  // =========================================
  // GET LOCATION NAMES
  // =========================================
  const getLocationName = async (userData) => {
    if (!userData) return;

    try {
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // IMPORTANT:
      // Backend expects SUB-DISTRICT CODE
      const subDistrictCode = userData.subDistrictCode;

      // IMPORTANT:
      // Backend expects PANCHAYAT CODE
      const panchayatCode = userData.panchayatCode;

      if (!subDistrictCode || !panchayatCode) {
        console.log("LOCATION CODE MISSING:", {
          subDistrictCode,
          panchayatCode,
        });

        return;
      }

      // =========================================
      // GET PANCHAYATS
      // =========================================
      const panchayatRes = await axios.get(
        `${API_URL}/api/locations/subdistricts/${subDistrictCode}/panchayats`,
        {
          headers,
        }
      );

      // =========================================
      // GET VILLAGES
      // =========================================
      const villageRes = await axios.get(
        `${API_URL}/api/locations/subdistricts/${subDistrictCode}/panchayats/${panchayatCode}/villages`,
        {
          headers,
        }
      );

      const panchayats =
        panchayatRes.data?.data || panchayatRes.data || [];

      const villages =
        villageRes.data?.data || villageRes.data || [];

      // Find Panchayat
      const panchayat = panchayats.find(
        (item) =>
          String(item.panchayatCode) === String(panchayatCode)
      );

      // Find Village
      const village = villages.find(
        (item) =>
          String(item.villageCode) === String(userData.villageCode)
      );

      setLocationNames({
        panchayat:
          panchayat?.panchayatName ||
          userData.panchayat ||
          "",
        village:
          village?.villageName ||
          userData.village ||
          "",
      });
    } catch (error) {
      console.log(
        "LOCATION ERROR:",
        error.response?.data || error.message
      );

      // Even if API fails, show names already present in user data
      setLocationNames({
        panchayat: userData.panchayat || "",
        village: userData.village || "",
      });
    }
  };

  useEffect(() => {
    if (user) {
      getLocationName(user);
    }
  }, [user]);

  // =========================================
  // NAVIGATION
  // =========================================
  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  // =========================================
  // UNREAD NOTIFICATION COUNT
  // =========================================
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/activity/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUnreadCount(res.data?.unreadCount || 0);
    } catch (error) {
      console.log(
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // =========================================
  // LOGOUT
  // =========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    onClose();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <>
      {/* =========================================
          OVERLAY
      ========================================= */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* =========================================
          SIDEBAR
      ========================================= */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* =========================================
            HEADER
        ========================================= */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Home className="h-5 w-5 text-white" />
            </div>

            <div>
              <h2 className="text-white font-bold text-lg leading-tight">
                Smart Village
              </h2>

              <p className="text-white/70 text-xs">
                Digital Service Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* =========================================
            USER PROFILE CARD
        ========================================= */}
        <div className="px-4 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-3">
            {/* Profile Image */}
            <div className="h-11 w-11 rounded-full overflow-hidden bg-gray-200 shadow">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">
                {user?.name || "User"}
              </p>

              <p className="text-xs text-gray-500 truncate">
                {locationNames.village || user?.village || ""}
                {locationNames.village || user?.village ? ", " : ""}
                {locationNames.panchayat || user?.panchayat || ""}
              </p>
            </div>
          </div>
        </div>

        {/* =========================================
            NAVIGATION
        ========================================= */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                location.pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md shadow-green-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-green-600"
                    }`}
                  />

                  <span
                    className={`font-medium text-sm ${
                      isActive ? "text-white" : ""
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Notification Count */}
                  {item.id === "notifications" &&
                    unreadCount > 0 && (
                      <span
                        className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {unreadCount}
                      </span>
                    )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* =========================================
            LOGOUT
        ========================================= */}
        <div className="px-3 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-200 group"
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />

            <span className="font-semibold text-sm">
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}