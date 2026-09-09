import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";

import {
  LayoutDashboard,
  Users,
  MapPin,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";

import API_URL from "../../../config/api";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/super-admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Admins",
    path: "/super-admin/admins",
    icon: Users,
  },
  {
    label: "Panchayats",
    path: "/super-admin/panchayats",
    icon: MapPin,
  },
  {
    label: "Notices",
    path: "/super-admin/notices",
    icon: Bell,
  },
  {
    label: "Profile",
    path: "/super-admin/profile",
    icon: UserCircle,
  },
];

export default function SuperAdminLayout({
  children,
  breadcrumbs = [],
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =====================================================
  // SUPER ADMIN PROFILE IMAGE
  // =====================================================

  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const fetchSuperAdminProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await fetch(
          `${API_URL}/super-admin/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setProfileImage(data.superAdmin?.profileImage || "");
      } catch (error) {
        console.error(
          "Fetch Super Admin profile image error:",
          error
        );
      }
    };

    fetchSuperAdminProfile();
  }, [location.pathname]);

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      navigate("/super-admin/login");
    }
  };

  const Sidebar = (
    <aside className="flex flex-col h-full bg-indigo-950">
      {/* Logo + close button */}
      <div className="px-4 py-4 border-b border-indigo-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-white" />
          </div>

          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">
              Super Admin
            </p>

            <p className="text-indigo-400 text-xs truncate">
              Smart Village Portal
            </p>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 rounded-lg text-indigo-400 hover hover transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <button
            key={path}
            onClick={() => {
              navigate(path);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(path)
                ? "bg-indigo-700 text-white"
                : "text-indigo-300 hover:bg-indigo-900 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-indigo-800 pt-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar — overlay on all screen sizes, toggle with hamburger */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-60 z-50 shadow-2xl">
            {Sidebar}
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 md:px-6 h-14">
            {/* Hamburger toggle */}
            <button
              onClick={() =>
                setSidebarOpen((prev) => !prev)
              }
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="flex-1 flex items-center gap-1 text-sm min-w-0">
              <span
                className="text-indigo-600 font-semibold hover:text-indigo-700 cursor-pointer whitespace-nowrap"
                onClick={() =>
                  navigate("/super-admin/dashboard")
                }
              >
                Super Admin
              </span>

              {breadcrumbs.map((crumb, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 min-w-0"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />

                  {crumb.path ? (
                    <span
                      onClick={() =>
                        navigate(crumb.path)
                      }
                      className="text-indigo-600 hover:text-indigo-700 cursor-pointer truncate"
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <span className="text-gray-500 font-medium truncate">
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>

            {/* Profile pill */}
            <button
              onClick={() =>
                navigate("/super-admin/profile")
              }
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-indigo-600">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Super Admin"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xs font-bold">
                    SA
                  </span>
                )}
              </div>

              <span className="text-sm font-semibold text-indigo-800 hidden sm:block">
                Super Admin
              </span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}