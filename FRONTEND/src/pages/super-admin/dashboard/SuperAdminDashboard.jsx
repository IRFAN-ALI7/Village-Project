import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  MapPin,
  Bell,
  UserCheck,
  UserX,
  Plus,
  Eye,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import SuperAdminLayout from "../../../components/super-admin/layout/SuperAdminLayout";

import API_URL from "../../../config/api";

const activityColor = {
  create: "bg-green-100 text-green-700",
  activate: "bg-blue-100 text-blue-700",
  deactivate: "bg-orange-100 text-orange-700",
  delete: "bg-red-100 text-red-700",
  notice: "bg-purple-100 text-purple-700",
  update: "bg-gray-100 text-gray-700",
};

const formatActivityTime = (date) => {
  if (!date) return "";

  const activityDate = new Date(date);

  if (Number.isNaN(activityDate.getTime())) {
    return "";
  }

  const now = new Date();

  const diffMs = now - activityDate;

  const diffMinutes = Math.floor(
    diffMs / (1000 * 60)
  );

  const diffHours = Math.floor(
    diffMs / (1000 * 60 * 60)
  );

  const diffDays = Math.floor(
    diffMs / (1000 * 60 * 60 * 24)
  );

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${
      diffHours > 1 ? "s" : ""
    } ago`;
  }

  if (diffDays < 7) {
    return `${diffDays} day${
      diffDays > 1 ? "s" : ""
    } ago`;
  }

  return activityDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // ======================================================
  // FETCH DASHBOARD
  // ======================================================

  const fetchDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/super-admin/login", {
          replace: true,
        });

        return;
      }

      const response = await fetch(
        `${API_URL}/super-admin/dashboard`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      // --------------------------------------------------
      // TOKEN / AUTH ERROR
      // --------------------------------------------------

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("superAdmin");

        toast.error(
          data.message ||
            "Session expired. Please login again."
        );

        navigate("/super-admin/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load dashboard"
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to load dashboard"
        );
      }

      setDashboard(data.dashboard);
    } catch (error) {
      console.error(
        "Super Admin Dashboard Error:",
        error
      );

      setError(
        error.message ||
          "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">

              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

              <p className="text-sm text-gray-500 mt-4">
                Loading dashboard...
              </p>

            </div>
          </div>

        </div>
      </SuperAdminLayout>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error && !dashboard) {
    return (
      <SuperAdminLayout>
        <div className="max-w-6xl mx-auto">

          <div className="bg-white border border-red-200 rounded-xl p-8 text-center">

            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mt-4">
              Unable to load dashboard
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              {error}
            </p>

            <button
              onClick={() => fetchDashboard()}
              className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

          </div>

        </div>
      </SuperAdminLayout>
    );
  }

  const {
    totalAdmins = 0,
    activeAdmins = 0,
    inactiveAdmins = 0,
    totalPanchayats = 0,
    panchayatsWithAdmin = 0,
    panchayatsWithoutAdmin = 0,
    recentActivity = [],
  } = dashboard || {};

  // ======================================================
  // STATS
  // ======================================================

  const activePercentage =
    totalAdmins > 0
      ? Math.round(
          (activeAdmins / totalAdmins) * 100
        )
      : 0;

  const assignedPercentage =
    totalPanchayats > 0
      ? Math.round(
          (panchayatsWithAdmin /
            totalPanchayats) *
            100
        )
      : 0;

  const stats = [
    {
      label: "Total Admins",
      value: totalAdmins,
      icon: Users,
      color: "bg-indigo-600",
      sub: "All registered admins",
    },

    {
      label: "Active Admins",
      value: activeAdmins,
      icon: UserCheck,
      color: "bg-green-600",
      sub: `${activePercentage}% active`,
    },

    {
      label: "Inactive Admins",
      value: inactiveAdmins,
      icon: UserX,
      color: "bg-orange-500",
      sub:
        inactiveAdmins > 0
          ? `${inactiveAdmins} need review`
          : "No inactive admins",
    },

    {
      label: "Total Panchayats",
      value: totalPanchayats,
      icon: MapPin,
      color: "bg-slate-600",
      sub: "Jharkhand state",
    },
  ];

  // ======================================================
  // QUICK ACTIONS
  // ======================================================

  const quickActions = [
    {
      label: "Create Admin",
      icon: Plus,
      path: "/super-admin/admins/create",
      color:
        "bg-indigo-600 hover:bg-indigo-700 text-white",
    },

    {
      label: "View Admins",
      icon: Eye,
      path: "/super-admin/admins",
      color:
        "bg-white hover:bg-gray-50 text-gray-800 border border-gray-200",
    },

    {
      label: "View Panchayats",
      icon: MapPin,
      path: "/super-admin/panchayats",
      color:
        "bg-white hover:bg-gray-50 text-gray-800 border border-gray-200",
    },

    {
      label: "Send Notice",
      icon: Bell,
      path: "/super-admin/notices/create",
      color:
        "bg-white hover:bg-gray-50 text-gray-800 border border-gray-200",
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="flex items-start justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-0.5">
              Overview of the Smart Village Portal
              administration
            </p>
          </div>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>

        </div>

        {/* ==================================================
            ERROR BANNER
        ================================================== */}

        {error && dashboard && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {stats.map((s) => {
            const Icon = s.icon;

            return (
              <div
                key={s.label}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >

                <div className="flex items-start justify-between mb-3">

                  <div
                    className={`${s.color} w-10 h-10 rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                </div>

                <p className="text-3xl font-bold text-gray-900">
                  {s.value}
                </p>

                <p className="text-sm font-medium text-gray-600 mt-0.5">
                  {s.label}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {s.sub}
                </p>

              </div>
            );
          })}

        </div>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* =================================================
              RECENT ACTIVITY
          ================================================= */}

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">

            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">

              <h2 className="font-bold text-gray-900">
                Recent Admin Activity
              </h2>

              <button
                onClick={() =>
                  navigate("/super-admin/admins")
                }
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                View all

                <ArrowRight className="h-3 w-3" />
              </button>

            </div>

            <div className="divide-y divide-gray-50">

              {recentActivity.length === 0 ? (
                <div className="px-5 py-10 text-center">

                  <Users className="h-8 w-8 text-gray-300 mx-auto" />

                  <p className="text-sm text-gray-500 mt-2">
                    No admin activity yet.
                  </p>

                </div>
              ) : (
                recentActivity.map((item) => (

                  <div
                    key={item.id}
                    className="px-5 py-3 flex items-start gap-3"
                  >

                    <span
                      className={`mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        activityColor[
                          item.type
                        ] ||
                        activityColor.update
                      }`}
                    >
                      {item.action}
                    </span>

                    <div className="flex-1 min-w-0">

                      <p className="text-sm text-gray-700 truncate">
                        {item.detail}
                      </p>

                      <p className="text-xs text-gray-400 mt-0.5">
                        Panchayat:{" "}
                        {item.panchayat || "—"}
                      </p>

                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatActivityTime(
                          item.time
                        )}
                      </p>

                    </div>

                  </div>

                ))
              )}

            </div>

          </div>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">

            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">
                Quick Actions
              </h2>
            </div>

            <div className="p-4 space-y-2">

              {quickActions.map((action) => {

                const Icon = action.icon;

                return (
                  <button
                    key={action.label}
                    onClick={() =>
                      navigate(action.path)
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${action.color}`}
                  >

                    <Icon className="h-4 w-4 shrink-0" />

                    {action.label}

                  </button>
                );
              })}

            </div>

            {/* Panchayat assignment */}
            <div className="px-5 py-4 border-t border-gray-100">

              <div className="text-xs text-gray-500 space-y-2">

                <div className="flex justify-between">

                  <span>
                    Panchayats with Admin
                  </span>

                  <span className="font-semibold text-gray-700">
                    {panchayatsWithAdmin} /{" "}
                    {totalPanchayats}
                  </span>

                </div>

                <div className="w-full bg-gray-100 rounded-full h-1.5">

                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${assignedPercentage}%`,
                    }}
                  />

                </div>

                <p className="text-gray-400">
                  {panchayatsWithoutAdmin === 0
                    ? "All panchayats have an admin assigned"
                    : `${panchayatsWithoutAdmin} panchayat${
                        panchayatsWithoutAdmin > 1
                          ? "s"
                          : ""
                      } have no admin assigned`}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </SuperAdminLayout>
  );
}