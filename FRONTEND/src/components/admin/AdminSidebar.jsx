import {
  LayoutDashboard,
  FileText,
  Gift,
  Megaphone,
  Users,
  Award,
  Settings,
  LogOut,
  X, 
  Bell,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import API_URL from "../../config/api";

export default function AdminSidebar({
  isOpen,
  onClose,
  activeSection,
  onSectionChange,
}) {
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState({
    name: "",
    panchayat: "",
    district: "",
    subDistrict: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "complaints",
      label: "Complaints",
      icon: FileText,
    },
    {
      id: "schemes",
      label: "Schemes",
      icon: Gift,
    },
    {
      id: "notices",
      label: "Notices",
      icon: Megaphone,
    },
    {
      id: "official-notices",
      label: "Official Notices",
      icon: Shield,
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
    },
    {
      id: "certificates",
      label: "Certificates",
      icon: Award,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoadingProfile(false);
        return;
      }

      const res = await axios.get(`${API_URL}/admin/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.admin || res.data?.data || res.data;

      setAdminData({
        name: data?.name || "",
        panchayat: data?.panchayat || "",
        district: data?.district || "",
        subDistrict: data?.subDistrict || "",
      });
    } catch (error) {
      toast.error("Admin profile fetch error.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleItemClick = (id) => {
    onSectionChange(id);
    onClose();
    navigate(`/admin/${id}`);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminName");

      navigate("/admin/login");
    }
  };

  const displayPanchayat = loadingProfile
    ? "Loading..."
    : adminData.panchayat
      ? `${adminData.panchayat} Gram Panchayat`
      : "Gram Panchayat";

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">

        {/* Sidebar Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-bold">
              Admin Panel
            </h2>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white text-sm font-semibold">
              {displayPanchayat}
            </p>

            <p className="text-white/80 text-xs mt-1">
              Digital Village Portal
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg transform scale-105"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                />

                <span className="font-semibold">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
          >
            <LogOut className="h-5 w-5" />

            <span className="font-semibold">
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}