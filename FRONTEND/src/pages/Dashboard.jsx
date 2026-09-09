import { useEffect, useState } from "react";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import Weather from "../components/dashboard/Weather";

import {
  FileText,
  ClipboardList,
  Gift,
  TrendingUp,
  Megaphone,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [dashboard, setDashboard] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    myComplaints: 0,
    activeSchemes: 0,
    totalNotices: 0,
    registeredUsers: 0,
  });

  // =========================================================
  // GET USER PROFILE
  // =========================================================

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const res = await fetch(`${API_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data);
        } else {
          console.log("USER API ERROR:", data);
        }
      } catch (error) {
        console.log("USER API ERROR:", error);
      }
    };

    fetchUser();
  }, [navigate]);

  // =========================================================
  // GET DASHBOARD DATA
  // =========================================================

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/user/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Dashboard API:", data);
        setDashboard(data);
      } else {
        console.log("Dashboard API ERROR:", data);
      }
    } catch (error) {
      console.log("Dashboard API ERROR:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =========================================================
  // DASHBOARD ACTION CARDS
  // =========================================================

  const stats = [
    {
      id: 1,
      title: "File a Complaint",
      description:
        "Submit your grievances and issues to the authorities",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      count: "Register Now",
      path: "/complaint",
    },
    {
      id: 2,
      title: "My Complaints",
      description:
        "Track status of your submitted complaints",
      icon: ClipboardList,
      color: "from-orange-500 to-orange-600",
      count: `${dashboard.myComplaints} Active`,
      path: "/my-complaints",
    },
    {
      id: 3,
      title: "Government Schemes",
      description:
        "Explore and apply for government welfare schemes",
      icon: Gift,
      color: "from-green-500 to-green-600",
      count: `${dashboard.activeSchemes} Available`,
      path: "/schemes",
    },
    {
      id: 4,
      title: "Notice Board",
      description:
        "View latest announcements and village notices",
      icon: Megaphone,
      color: "from-red-500 to-red-600",
      count: `${dashboard.totalNotices} New`,
      path: "/notices",
    },
  ];

  // =========================================================
  // QUICK STATS
  // =========================================================

  const quickStats = [
    {
      label: "Total Complaints",
      value: dashboard.totalComplaints,
      trend: "Submitted",
      icon: TrendingUp,
    },
    {
      label: "Resolved",
      value: dashboard.resolvedComplaints,
      trend: "Completed",
      icon: ClipboardList,
    },
    {
      label: "Active Schemes",
      value: dashboard.activeSchemes,
      trend: "Available",
      icon: Gift,
    },
  ];

  // =========================================================
  // CONTACT HELP
  // =========================================================

  const handleContactHelp = () => {
    alert(
      "📞 Village Helpline:\n\n" +
        "Phone: 1800-XXX-XXXX\n" +
        "Email: help@smartvillage.gov.in\n" +
        "Timings: 9:00 AM - 6:00 PM (Mon-Sat)\n\n" +
        "You can also visit our office at Village Panchayat Office during working hours."
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <DashboardNavbar pageTitle="User Dashboard" />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">

          {/* =================================================
              WELCOME
          ================================================== */}

          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 mb-8 shadow-xl border border-white/50 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome,{" "}
              <span className="text-green-600">
                {user?.name || "User"}
              </span>
            </h1>

            <p className="text-gray-600 text-lg">
              Here's what's happening in your village today
            </p>
          </div>

          {/* =================================================
              QUICK STATS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {quickStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        {stat.label}
                      </p>

                      <p className="text-3xl font-bold text-gray-800 mt-2">
                        {stat.value}
                      </p>

                      <p className="text-sm text-green-600 font-semibold mt-1">
                        {stat.trend}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-blue-500 p-4 rounded-xl">
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

           {/* =================================================
              WEATHER
          ================================================== */}

          <div className="mb-8">
            <Weather />
          </div>

          {/* =================================================
              ADDITIONAL INFO
          ================================================== */}

          {/* =================================================
              MAIN ACTION CARDS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.id}
                  onClick={() => navigate(stat.path)}
                  className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >

                  <div
                    className={`bg-gradient-to-r ${stat.color} p-6 text-white`}
                  >
                    <div className="flex justify-between items-start mb-4">

                      <Icon className="h-10 w-10" />

                      <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        <span className="text-xs font-semibold">
                          {stat.count}
                        </span>
                      </div>

                    </div>

                    <h3 className="text-xl font-bold mb-2">
                      {stat.title}
                    </h3>
                  </div>

                  <div className="p-6">

                    <p className="text-gray-700 text-sm mb-4">
                      {stat.description}
                    </p>

                    <button
                      className={`w-full bg-gradient-to-r ${stat.color} text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg text-sm`}
                    >
                      Open
                    </button>

                  </div>
                </div>
              );
            })}

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VILLAGE STATISTICS */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">

              <h3 className="text-xl font-bold mb-4">
                Village Statistics
              </h3>

              <div className="space-y-3">

                <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <span>Total Households</span>
                  <span className="font-bold text-2xl">
                    456
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <span>Registered Users</span>
                  <span className="font-bold text-2xl">
                    {dashboard.registeredUsers}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <span>Active Schemes</span>
                  <span className="font-bold text-2xl">
                    {dashboard.activeSchemes}
                  </span>
                </div>

              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl">

              <h3 className="text-xl font-bold mb-4">
                Quick Actions
              </h3>

              <div className="space-y-2">

                <button
                  onClick={() => navigate("/certificates")}
                  className="w-full bg-white/20 backdrop-blur-sm py-3 px-4 rounded-lg hover:bg-white/30 transition-all text-left font-semibold"
                >
                  📋 Apply for Certificate
                </button>

                <button
                  onClick={() => navigate("/schemes")}
                  className="w-full bg-white/20 backdrop-blur-sm py-3 px-4 rounded-lg hover:bg-white/30 transition-all text-left font-semibold"
                >
                  💰 Check Scheme Eligibility
                </button>

                <button
                  onClick={handleContactHelp}
                  className="w-full bg-white/20 backdrop-blur-sm py-3 px-4 rounded-lg hover:bg-white/30 transition-all text-left font-semibold"
                >
                  📞 Contact Helpline
                </button>

              </div>

            </div>

          </div>

        </div>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <DashboardFooter />

    </div>
  );
}