import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Clock,
  MapPin,
  Pin,
  User,
  Mail,
  Phone,
  Building2,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import SuperAdminLayout from "../../../components/super-admin/layout/SuperAdminLayout";
import API_URL from "../../../config/api";

const categoryColor = {
  General: "bg-gray-100 text-gray-700",
  Administrative: "bg-blue-100 text-blue-700",
  Technical: "bg-purple-100 text-purple-700",
  Security: "bg-red-100 text-red-700",
  Training: "bg-green-100 text-green-700",
  Emergency: "bg-orange-100 text-orange-700",
};

export default function NoticeDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // AUTH TOKEN
  // =====================================================
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // FETCH NOTICE
  // =====================================================
  const fetchNotice = async () => {
    try {
      setLoading(true);

      if (!id) {
        toast.error("Invalid notice ID");
        navigate("/super-admin/notices");
        return;
      }

      const token = getToken();

      if (!token) {
        navigate("/super-admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/super-admin/notices/${id}`,
        {
          method: "GET",
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
        throw new Error(
          result.message || "Failed to fetch notice"
        );
      }

      setNotice(result.data);
    } catch (error) {
      console.error("Fetch notice details error:", error);

      toast.error(
        error.message || "Failed to fetch notice"
      );

      navigate("/super-admin/notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [id]);

  // =====================================================
  // DELETE NOTICE
  // =====================================================
  const handleDelete = async () => {
    if (!id || deleting) return;

    try {
      setDeleting(true);

      const token = getToken();

      if (!token) {
        navigate("/super-admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/super-admin/notices/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("superAdmin");

        navigate("/super-admin/login");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete notice"
        );
      }

      toast.success("Notice deleted successfully");

      navigate("/super-admin/notices");
    } catch (error) {
      console.error("Delete notice error:", error);

      toast.error(
        error.message || "Failed to delete notice"
      );
    } finally {
      setDeleting(false);
      setDeleteModal(false);
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
      month: "long",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT CREATED DATE
  // =====================================================
  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <SuperAdminLayout
        breadcrumbs={[
          {
            label: "Notices",
            path: "/super-admin/notices",
          },
          {
            label: "Notice Details",
          },
        ]}
      >
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center">
            <div className="h-9 w-9 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />

            <p className="text-sm text-gray-500">
              Loading notice...
            </p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  // =====================================================
  // NOTICE NOT FOUND
  // =====================================================
  if (!notice) {
    return null;
  }

  return (
    <SuperAdminLayout
      breadcrumbs={[
        {
          label: "Notices",
          path: "/super-admin/notices",
        },
        {
          label: "Notice Details",
        },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-5">
        {/* =================================================
            BACK
        ================================================= */}
        <button
          type="button"
          onClick={() =>
            navigate("/super-admin/notices")
          }
          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notices
        </button>

        {/* =================================================
            NOTICE HEADER
        ================================================= */}
        <div
          className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
            notice.isPinned
              ? "border-indigo-200"
              : "border-gray-100"
          }`}
        >
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Bell className="h-5 w-5 text-white" />
                </div>

                <div>
                  <h1 className="text-xl font-bold text-white">
                    {notice.title}
                  </h1>

                  <p className="text-indigo-100 text-xs mt-1">
                    Notice Details
                  </p>
                </div>
              </div>

              {notice.isPinned && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-full shrink-0">
                  <Pin className="h-3 w-3" />
                  Pinned
                </span>
              )}
            </div>
          </div>

          {/* =================================================
              NOTICE INFORMATION
          ================================================= */}
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  categoryColor[notice.category] ??
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {notice.category}
              </span>

              <span className="text-xs text-gray-400">
                To:
              </span>

              <span className="text-xs font-semibold text-gray-700">
                {notice.audience}
              </span>
            </div>

            {/* DATE / TIME / LOCATION */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CalendarDays className="h-4 w-4 text-indigo-600 shrink-0" />

                <div>
                  <p className="text-xs text-gray-400">
                    Notice Date
                  </p>

                  <p className="text-sm font-semibold text-gray-700">
                    {formatDate(notice.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-4 w-4 text-indigo-600 shrink-0" />

                <div>
                  <p className="text-xs text-gray-400">
                    Time
                  </p>

                  <p className="text-sm font-semibold text-gray-700">
                    {notice.time || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />

                <div>
                  <p className="text-xs text-gray-400">
                    Location
                  </p>

                  <p className="text-sm font-semibold text-gray-700">
                    {notice.location || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* VALID UPTO */}
            <div className="mb-6 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-amber-600" />

                <p className="text-sm text-amber-800">
                  Valid upto:{" "}
                  <span className="font-semibold">
                    {formatDate(notice.validUpto)}
                  </span>
                </p>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-900 mb-2">
                Description
              </h2>

              <p className="text-sm text-gray-600 leading-6 whitespace-pre-wrap">
                {notice.description}
              </p>
            </div>

            {/* FULL DETAILS */}
            {notice.fullDetails && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-gray-900 mb-2">
                  Full Details
                </h2>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 leading-6 whitespace-pre-wrap">
                    {notice.fullDetails}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            AUDIENCE / SELECTED ADMIN
        ================================================= */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">
              Audience
            </h2>
          </div>

          <div className="p-5">
            {notice.audience === "All Admins" ||
            notice.audience === "all" ? (
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-800">
                    All Admins
                  </p>

                  <p className="text-xs text-gray-500 mt-0.5">
                    This notice was sent to all active
                    administrators.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center">
                    {notice.selectedAdmin?.profilePhoto ? (
                      <img
                        src={
                          notice.selectedAdmin
                            .profilePhoto
                        }
                        alt={
                          notice.selectedAdmin.name
                        }
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-indigo-600" />
                    )}
                  </div>

                  <div>
                    <p className="text-base font-bold text-gray-900">
                      {notice.selectedAdmin?.name ||
                        "Selected Admin"}
                    </p>

                    <p className="text-xs text-gray-500">
                      Selected Administrator
                    </p>
                  </div>
                </div>

                {notice.selectedAdmin && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400" />

                      <div>
                        <p className="text-xs text-gray-400">
                          Email
                        </p>

                        <p className="text-sm font-medium text-gray-700 break-all">
                          {notice.selectedAdmin.email ||
                            "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-4 w-4 text-gray-400" />

                      <div>
                        <p className="text-xs text-gray-400">
                          Phone
                        </p>

                        <p className="text-sm font-medium text-gray-700">
                          {notice.selectedAdmin.phone ||
                            "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg sm:col-span-2">
                      <Building2 className="h-4 w-4 text-gray-400" />

                      <div>
                        <p className="text-xs text-gray-400">
                          Panchayat
                        </p>

                        <p className="text-sm font-medium text-gray-700">
                          {notice.selectedAdmin.panchayat ||
                            "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            CREATED INFO + ACTIONS
        ================================================= */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400">
                Created At
              </p>

              <p className="text-sm font-medium text-gray-700 mt-1">
                {formatDateTime(notice.createdAt)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDeleteModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Notice
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          DELETE CONFIRMATION
      =================================================== */}
      {deleteModal && (
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
                type="button"
                onClick={() => {
                  if (!deleting) {
                    setDeleteModal(false);
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
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-2.5 rounded-lg font-semibold text-sm"
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteModal(false)
                  }
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