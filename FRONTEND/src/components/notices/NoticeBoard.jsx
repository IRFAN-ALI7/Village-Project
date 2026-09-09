import { useState, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  Calendar,
  Megaphone,
  Droplet,
  Users,
  Gift,
  Info,
  Pin,
  Clock,
  MapPin,
  ChevronRight,
  X,
  Filter,
  Search,
} from "lucide-react";
import API_URL from "../../config/api";

export default function NoticeBoard() {
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [allNotices, setAllNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // FETCH USER PANCHAYAT NOTICES
  // ----------------------------------------------------
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/user/notices`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load notices");
        }

        setAllNotices(
          Array.isArray(data.data) ? data.data : []
        );
      } catch (err) {
        console.error("Fetch user notices error:", err);

        setError(
          err.message || "Unable to load notices"
        );

        setAllNotices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // ----------------------------------------------------
  // FILTER + SEARCH
  // ----------------------------------------------------
  const filteredNotices = allNotices
    .filter(
      (notice) =>
        filterType === "all" ||
        notice.category === filterType
    )
    .filter((notice) => {
      const query = searchQuery.trim().toLowerCase();

      if (!query) return true;

      return (
        (notice.title || "")
          .toLowerCase()
          .includes(query) ||
        (notice.description || "")
          .toLowerCase()
          .includes(query) ||
        (notice.fullDetails || "")
          .toLowerCase()
          .includes(query) ||
        (notice.location || "")
          .toLowerCase()
          .includes(query)
      );
    });

  // ----------------------------------------------------
  // NOTICE STYLE
  // ----------------------------------------------------
  const getNoticeStyle = (type) => {
    const styles = {
      urgent: {
        gradient: "from-red-500 to-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: AlertTriangle,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        badge: "bg-red-100 text-red-800",
        label: "Urgent",
      },

      meeting: {
        gradient: "from-blue-500 to-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: Users,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        badge: "bg-blue-100 text-blue-800",
        label: "Meeting",
      },

      scheme: {
        gradient: "from-green-500 to-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
        icon: Gift,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        badge: "bg-green-100 text-green-800",
        label: "Scheme",
      },

      service: {
        gradient: "from-orange-500 to-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        icon: Droplet,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        badge: "bg-orange-100 text-orange-800",
        label: "Service",
      },

      general: {
        gradient: "from-purple-500 to-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-200",
        icon: Info,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        badge: "bg-purple-100 text-purple-800",
        label: "General",
      },
    };

    return styles[type] || styles.general;
  };

  // ----------------------------------------------------
  // DATE FORMAT
  // ----------------------------------------------------
  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return dateStr;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ----------------------------------------------------
  // NOTICE CARD
  // ----------------------------------------------------
  const NoticeCard = ({ notice }) => {
    const style = getNoticeStyle(notice.category);
    const Icon = style.icon;

    return (
      <div
        className={`${style.bg} border-2 ${style.border} rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden`}
        onClick={() => setSelectedNotice(notice)}
      >
        {/* PIN */}
        {notice.isPinned && (
          <div className="absolute top-3 right-3">
            <Pin className="h-5 w-5 text-red-500 fill-red-500" />
          </div>
        )}

        <div className="flex items-start space-x-4">
          {/* ICON */}
          <div
            className={`${style.iconBg} p-3 rounded-lg shrink-0`}
          >
            <Icon
              className={`h-6 w-6 ${style.iconColor}`}
            />
          </div>

          {/* CONTENT */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="font-bold text-gray-800 text-lg mb-1 break-words">
                  {notice.title}
                </h3>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}
                >
                  {style.label}
                </span>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
              {notice.description}
            </p>

            <div className="space-y-2">
              {/* DATE */}
              {notice.date && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 shrink-0" />

                  <span className="font-semibold">
                    {formatDate(notice.date)}
                  </span>
                </div>
              )}

              {/* TIME */}
              {notice.time && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 shrink-0" />

                  <span>{notice.time}</span>
                </div>
              )}

              {/* LOCATION */}
              {notice.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0" />

                  <span>{notice.location}</span>
                </div>
              )}

              {/* VALID UPTO */}
              {notice.validUpto && (
                <div className="bg-white/60 px-3 py-1.5 rounded-lg inline-block">
                  <span className="text-xs font-semibold text-gray-700">
                    Valid till:{" "}
                    {formatDate(notice.validUpto)}
                  </span>
                </div>
              )}
            </div>

            {/* READ FULL */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNotice(notice);
              }}
              className="mt-4 text-blue-600 font-semibold text-sm flex items-center space-x-1 hover:text-blue-700 transition-all"
            >
              <span>Read Full Notice</span>

              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pb-10">

      {/* ------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------ */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Megaphone className="h-8 w-8 md:h-10 md:w-10 shrink-0" />

              <h1 className="text-2xl md:text-4xl font-bold">
                Notice Board
              </h1>
            </div>

            <p className="text-orange-100 text-sm md:text-lg">
              Stay updated with latest village announcements
              and notifications
            </p>
          </div>

          <Bell className="h-12 w-12 md:h-16 md:w-16 opacity-20 shrink-0" />
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* SEARCH + FILTER */}
      {/* ------------------------------------------------ */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          {/* FILTER */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none cursor-pointer outline-none"
            >
              <option value="all">
                All Notices
              </option>

              <option value="urgent">
                Urgent
              </option>

              <option value="meeting">
                Meetings
              </option>

              <option value="scheme">
                Government Schemes
              </option>

              <option value="service">
                Services
              </option>

              <option value="general">
                General
              </option>
            </select>
          </div>
        </div>

        {/* ------------------------------------------------ */}
        {/* STATS */}
        {/* ------------------------------------------------ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">

          {/* TOTAL */}
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`bg-gray-100 text-gray-800 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
              filterType === "all"
                ? "ring-2 ring-offset-2 ring-orange-500"
                : "hover:shadow-md"
            }`}
          >
            <div className="text-2xl font-bold">
              {allNotices.length}
            </div>

            <div className="text-xs">
              Total
            </div>
          </button>

          {/* URGENT */}
          <button
            type="button"
            onClick={() => setFilterType("urgent")}
            className={`bg-red-100 text-red-800 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
              filterType === "urgent"
                ? "ring-2 ring-offset-2 ring-orange-500"
                : "hover:shadow-md"
            }`}
          >
            <div className="text-2xl font-bold">
              {
                allNotices.filter(
                  (n) => n.category === "urgent"
                ).length
              }
            </div>

            <div className="text-xs">
              Urgent
            </div>
          </button>

          {/* MEETINGS */}
          <button
            type="button"
            onClick={() => setFilterType("meeting")}
            className={`bg-blue-100 text-blue-800 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
              filterType === "meeting"
                ? "ring-2 ring-offset-2 ring-orange-500"
                : "hover:shadow-md"
            }`}
          >
            <div className="text-2xl font-bold">
              {
                allNotices.filter(
                  (n) => n.category === "meeting"
                ).length
              }
            </div>

            <div className="text-xs">
              Meetings
            </div>
          </button>

          {/* SCHEMES */}
          <button
            type="button"
            onClick={() => setFilterType("scheme")}
            className={`bg-green-100 text-green-800 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
              filterType === "scheme"
                ? "ring-2 ring-offset-2 ring-orange-500"
                : "hover:shadow-md"
            }`}
          >
            <div className="text-2xl font-bold">
              {
                allNotices.filter(
                  (n) => n.category === "scheme"
                ).length
              }
            </div>

            <div className="text-xs">
              Schemes
            </div>
          </button>

          {/* SERVICES */}
          <button
            type="button"
            onClick={() => setFilterType("service")}
            className={`bg-orange-100 text-orange-800 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
              filterType === "service"
                ? "ring-2 ring-offset-2 ring-orange-500"
                : "hover:shadow-md"
            }`}
          >
            <div className="text-2xl font-bold">
              {
                allNotices.filter(
                  (n) => n.category === "service"
                ).length
              }
            </div>

            <div className="text-xs">
              Services
            </div>
          </button>

          {/* GENERAL */}
          <button
            type="button"
            onClick={() => setFilterType("general")}
            className={`bg-purple-100 text-purple-800 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
              filterType === "general"
                ? "ring-2 ring-offset-2 ring-orange-500"
                : "hover:shadow-md"
            }`}
          >
            <div className="text-2xl font-bold">
              {
                allNotices.filter(
                  (n) => n.category === "general"
                ).length
              }
            </div>

            <div className="text-xs">
              General
            </div>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* LOADING */}
      {/* ------------------------------------------------ */}
      {loading && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-500 font-semibold">
            Loading notices...
          </p>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* ERROR */}
      {/* ------------------------------------------------ */}
      {!loading && error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />

          <p className="text-red-700 font-semibold">
            {error}
          </p>

          <p className="text-red-500 text-sm mt-2">
            Please refresh the page and try again.
          </p>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* ALL NOTICES */}
      {/* ------------------------------------------------ */}
      {!loading && !error && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Megaphone className="h-6 w-6 text-orange-600" />

            <h2 className="text-2xl font-bold text-gray-800">
              All Notices
            </h2>
          </div>

          {filteredNotices.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-12 text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />

              <p className="text-gray-500 text-lg font-semibold">
                No notices found
              </p>

              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* FULL NOTICE MODAL */}
      {/* ------------------------------------------------ */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* MODAL HEADER */}
            <div
              className={`bg-gradient-to-r ${
                getNoticeStyle(
                  selectedNotice.category
                ).gradient
              } text-white p-5 md:p-6 rounded-t-2xl`}
            >
              <div className="flex items-start justify-between gap-4">

                <div className="flex-1 min-w-0">

                  <div className="flex items-center flex-wrap gap-3 mb-3">

                    {(() => {
                      const Icon =
                        getNoticeStyle(
                          selectedNotice.category
                        ).icon;

                      return (
                        <Icon className="h-8 w-8 shrink-0" />
                      );
                    })()}

                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                      {
                        getNoticeStyle(
                          selectedNotice.category
                        ).label
                      }
                    </span>

                    {selectedNotice.isPinned && (
                      <Pin className="h-5 w-5 fill-white" />
                    )}
                  </div>

                  <h2 className="text-2xl font-bold mb-3 break-words">
                    {selectedNotice.title}
                  </h2>

                  <div className="flex flex-wrap gap-3 text-sm">

                    {selectedNotice.date && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 shrink-0" />

                        <span>
                          {formatDate(
                            selectedNotice.date
                          )}
                        </span>
                      </div>
                    )}

                    {selectedNotice.time && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 shrink-0" />

                        <span>
                          {selectedNotice.time}
                        </span>
                      </div>
                    )}

                    {selectedNotice.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 shrink-0" />

                        <span>
                          {selectedNotice.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedNotice(null)
                  }
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all shrink-0"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="p-5 md:p-6">

              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {selectedNotice.fullDetails ||
                    selectedNotice.description ||
                    "No additional details available."}
                </div>
              </div>

              {selectedNotice.validUpto && (
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <div className="flex items-center space-x-2">

                    <AlertTriangle className="h-5 w-5 text-yellow-600" />

                    <p className="text-sm font-semibold text-yellow-800">
                      Valid till:{" "}
                      {formatDate(
                        selectedNotice.validUpto
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedNotice(null)
                  }
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-all font-semibold"
                >
                  Print Notice
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}