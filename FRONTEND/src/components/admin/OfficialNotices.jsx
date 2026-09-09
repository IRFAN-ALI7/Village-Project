import { useEffect, useState } from "react";
import {
  Shield,
  Pin,
  Calendar,
  Clock,
  MapPin,
  Tag,
  FileText,
  ChevronRight,
  X,
  Bell,
} from "lucide-react";
import axios from "axios";
import API_URL from "../../config/api";
import toast from "react-hot-toast";

const CATEGORY_STYLE = {
  General: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  },
  Administrative: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Technical: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  Security: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  Training: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  Emergency: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
};

const categoryStyle = {
  bg: "bg-gray-50",
  text: "text-gray-700",
  border: "border-gray-200",
};

function formatDate(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function NoticeCard({ notice, onClick }) {
  const style = CATEGORY_STYLE[notice.category] ?? categoryStyle;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        notice.isPinned ? "border-indigo-200" : "border-gray-100"
      }`}
    >
      <div
        className={`h-1 w-full ${
          notice.isPinned ? "bg-indigo-500" : "bg-gray-200"
        }`}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {notice.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                <Pin className="h-2.5 w-2.5" />
                Pinned
              </span>
            )}

            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}
            >
              {notice.category}
            </span>
          </div>

          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
        </div>

        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2">
          {notice.title}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {notice.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(notice.date)}
          </span>

          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Valid: {formatDate(notice.validUpto)}
          </span>
        </div>
      </div>
    </button>
  );
}

function NoticeDetail({ notice, onClose }) {
  const style = CATEGORY_STYLE[notice.category] ?? categoryStyle;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
      {/* Official Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest">
                Official Notice
              </p>

              <p className="text-white text-xs opacity-70">
                Smart Village Portal — Jharkhand
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {notice.title}
          </h2>
        </div>

        {/* Category + Pinned */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`rounded-xl p-3 border ${style.bg} ${style.border}`}
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Category
            </p>

            <p className={`text-sm font-bold ${style.text}`}>
              {notice.category}
            </p>
          </div>

          <div
            className={`rounded-xl p-3 border ${
              notice.isPinned
                ? "bg-indigo-50 border-indigo-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Pin className="h-3 w-3" />
              Pinned Notice
            </p>

            <p
              className={`text-sm font-bold ${
                notice.isPinned ? "text-indigo-700" : "text-gray-400"
              }`}
            >
              {notice.isPinned ? "Yes — Pinned" : "No"}
            </p>
          </div>
        </div>

        {/* Date + Valid Until */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Notice Date
            </p>

            <p className="text-sm font-bold text-gray-800">
              {formatDate(notice.date)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Valid Until
            </p>

            <p className="text-sm font-bold text-gray-800">
              {formatDate(notice.validUpto)}
            </p>
          </div>
        </div>

        {/* Time + Location */}
        {(notice.time || notice.location) && (
          <div className="grid grid-cols-2 gap-3">
            {notice.time ? (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Time
                </p>

                <p className="text-sm font-bold text-gray-800">
                  {notice.time}
                </p>
              </div>
            ) : (
              <div />
            )}

            {notice.location ? (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </p>

                <p className="text-sm font-bold text-gray-800">
                  {notice.location}
                </p>
              </div>
            ) : (
              <div />
            )}
          </div>
        )}

        <hr className="border-gray-100" />

        {/* Description */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Description
          </p>

          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100 whitespace-pre-line">
            {notice.description}
          </p>
        </div>

        {/* Full Details */}
        {notice.fullDetails && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Full Details
            </p>

            <p className="text-sm text-gray-700 leading-relaxed bg-indigo-50 rounded-xl p-4 border border-indigo-100 whitespace-pre-line">
              {notice.fullDetails}
            </p>
          </div>
        )}

        <hr className="border-gray-100" />

        {/* Footer — Issued By + Published On */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">SA</span>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Issued By
              </p>

              <p className="text-sm font-bold text-gray-800">
                Super Admin
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              Published On
            </p>

            <p className="text-sm font-bold text-gray-800">
              {formatDateTime(notice.createdAt)}
            </p>
          </div>
        </div>

        {/* Official seal line */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />

          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold text-center">
            <Shield className="h-3 w-3 text-indigo-400 shrink-0" />
            Smart Village Portal — Official Communication
          </div>

          <div className="flex-1 h-px bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function OfficialNotices() {
  const [notices, setNotices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOfficialNotices();
  }, []);

  const fetchOfficialNotices = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Admin session not found. Please login again.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/admin/official-notices`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      const receivedNotices =
        data?.data?.notices ||
        data?.data ||
        data?.notices ||
        [];

      setNotices(Array.isArray(receivedNotices) ? receivedNotices : []);

      if (Array.isArray(receivedNotices) && receivedNotices.length > 0) {
        const pinnedNotice =
          receivedNotices.find((notice) => notice.isPinned) ||
          receivedNotices[0];

        setSelected(pinnedNotice);
      } else {
        setSelected(null);
      }
    } catch (err) {
      console.error("Fetch official notices error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to load official notices.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const pinned = notices.filter((notice) => notice.isPinned);
  const others = notices.filter((notice) => !notice.isPinned);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Official Notices
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">
            Notices received from Super Admin
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-700">
          <Bell className="h-3.5 w-3.5" />
          {notices.length} Notices
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center justify-center text-gray-400">
          <div className="h-8 w-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />

          <p className="text-sm">Loading official notices...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm py-16 flex flex-col items-center justify-center text-center px-6">
          <Bell className="h-10 w-10 mb-2 text-red-200" />

          <p className="text-sm font-semibold text-red-600">
            Unable to load official notices
          </p>

          <p className="text-xs text-gray-500 mt-1 max-w-md">
            {error}
          </p>

          <button
            onClick={fetchOfficialNotices}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && notices.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center text-gray-400">
          <Bell className="h-10 w-10 mb-2 text-gray-200" />

          <p className="text-sm font-medium">
            No official notices yet.
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Notices from Super Admin will appear here.
          </p>
        </div>
      )}

      {/* Notices */}
      {!loading && !error && notices.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left — Notice list */}
          <div className="lg:col-span-2 space-y-4">
            {pinned.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1 flex items-center gap-1">
                  <Pin className="h-3 w-3 text-indigo-500" />
                  Pinned
                </p>

                {pinned.map((notice) => (
                  <NoticeCard
                    key={notice._id}
                    notice={notice}
                    onClick={() => setSelected(notice)}
                  />
                ))}
              </div>
            )}

            {others.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">
                  All Notices
                </p>

                {others.map((notice) => (
                  <NoticeCard
                    key={notice._id}
                    notice={notice}
                    onClick={() => setSelected(notice)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right — Notice detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="sticky top-24">
                <NoticeDetail
                  notice={selected}
                  onClose={() => setSelected(null)}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-64 flex flex-col items-center justify-center text-gray-400">
                <FileText className="h-10 w-10 mb-2 text-gray-200" />

                <p className="text-sm font-medium">
                  Select a notice to view
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}