import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  X,
  AlertTriangle,
  Pin,
  Bell,
} from "lucide-react";
import { toast } from "react-hot-toast";

import SuperAdminLayout from "../../../components/super-admin/layout/SuperAdminLayout";
import API_URL from "../../../config/api";

const CATEGORIES = [
  "General",
  "Administrative",
  "Technical",
  "Security",
  "Training",
  "Emergency",
];

const categoryColor = {
  General: "bg-gray-100 text-gray-700",
  Administrative: "bg-blue-100 text-blue-700",
  Technical: "bg-purple-100 text-purple-700",
  Security: "bg-red-100 text-red-700",
  Training: "bg-green-100 text-green-700",
  Emergency: "bg-orange-100 text-orange-700",
};

export default function Notices() {
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // AUTH TOKEN
  // =====================================================
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // FETCH NOTICES
  // =====================================================
  const fetchNotices = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        navigate("/super-admin/login");
        return;
      }

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (filterCat) {
        params.append("category", filterCat);
      }

      const queryString = params.toString();

      const response = await fetch(
        `${API_URL}/super-admin/notices${
          queryString ? `?${queryString}` : ""
        }`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      // ---------------------------------------------
      // Unauthorized
      // ---------------------------------------------
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("superAdmin");
        navigate("/super-admin/login");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch notices");
      }

      setNotices(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Fetch notices error:", error);

      toast.error(error.message || "Failed to fetch notices");
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH WHEN SEARCH / FILTER CHANGES
  // =====================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotices();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, filterCat]);

  // =====================================================
  // DELETE NOTICE
  // =====================================================
  const handleDelete = async () => {
    if (!deleteId || deleting) return;

    try {
      setDeleting(true);

      const token = getToken();

      if (!token) {
        navigate("/super-admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/super-admin/notices/${deleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("superAdminToken");
        localStorage.removeItem("superAdmin");
        navigate("/super-admin/login");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete notice");
      }

      toast.success("Notice deleted successfully");

      setDeleteId(null);

      // Refresh actual backend data
      await fetchNotices();
    } catch (error) {
      console.error("Delete notice error:", error);
      toast.error(error.message || "Failed to delete notice");
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================
  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <SuperAdminLayout breadcrumbs={[{ label: "Notices" }]}>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Notices
            </h1>

            <p className="text-sm text-gray-500">
              {loading
                ? "Loading notices..."
                : `${notices.length} notices sent to admins`}
            </p>
          </div>

          <button
            onClick={() => navigate("/super-admin/notices/create")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Send Notice
          </button>
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notices…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="appearance-none w-full sm:w-44 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">All Categories</option>

              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center text-gray-400">
            <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />

            <p className="text-sm">Loading notices...</p>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}
        {!loading && notices.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center text-gray-400">
            <Bell className="h-10 w-10 mb-2 text-gray-200" />

            <p className="text-sm">
              {search || filterCat
                ? "No notices found."
                : "No notices have been sent yet."}
            </p>
          </div>
        )}

        {/* =================================================
            NOTICE CARDS
        ================================================= */}
        {!loading && notices.length > 0 && (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                  notice.isPinned
                    ? "border-indigo-200"
                    : "border-gray-100"
                }`}
              >
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* TOP INFO */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {notice.isPinned && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </span>
                      )}

                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          categoryColor[notice.category] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {notice.category}
                      </span>

                      <span className="text-xs text-gray-400">
                        To:{" "}
                        <span className="font-medium text-gray-600">
                          {notice.audience}
                        </span>
                      </span>
                    </div>

                    {/* TITLE */}
                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                      {notice.title}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {notice.description}
                    </p>

                    {/* DATES */}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      <span>
                        Date:{" "}
                        <span className="font-medium text-gray-600">
                          {formatDate(notice.date)}
                        </span>
                      </span>

                      <span>
                        Valid upto:{" "}
                        <span className="font-medium text-gray-600">
                          {formatDate(notice.validUpto)}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() =>
                        navigate(
                          `/super-admin/notices/${notice._id}`
                        )
                      }
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="View"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteId(notice._id)}
                      className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===================================================
          DELETE CONFIRMATION
      =================================================== */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="bg-red-600 text-white p-5 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />

                <h3 className="font-bold">
                  Delete Notice
                </h3>
              </div>

              <button
                onClick={() => {
                  if (!deleting) {
                    setDeleteId(null);
                  }
                }}
                disabled={deleting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-gray-700 text-sm mb-1 font-semibold">
                Delete this notice?
              </p>

              <p className="text-gray-500 text-xs mb-5">
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-2.5 rounded-lg font-semibold text-sm"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>

                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 py-2.5 rounded-lg font-semibold text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}