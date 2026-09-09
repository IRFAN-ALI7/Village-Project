import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
  ArrowLeft,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";

import SuperAdminLayout from "../../../components/super-admin/layout/SuperAdminLayout";
import API_URL from "../../../config/api";

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-50 last:border-0 gap-1">
      <span className="sm:w-40 text-xs font-bold text-gray-400 uppercase tracking-wide">
        {label}
      </span>

      <span className="text-sm text-gray-800 font-medium">
        {value || "—"}
      </span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  // =====================================================
  // GET ADMIN
  // =====================================================

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/super-admin/admins/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admin");
      }

      setAdmin(data.admin);
    } catch (err) {
      console.error("Fetch admin error:", err);
      setError(err.message || "Failed to fetch admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, [id]);

  // =====================================================
  // TOGGLE STATUS
  // =====================================================

  const handleToggle = async () => {
    if (!admin) return;

    try {
      setActionLoading(true);

      const newStatus =
        admin.status === "active" ? "inactive" : "active";

      const response = await fetch(
        `${API_URL}/super-admin/admins/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setAdmin(data.admin || { ...admin, status: newStatus });
      setShowToggle(false);
    } catch (err) {
      console.error("Toggle error:", err);
      setError(err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async () => {
    try {
      setActionLoading(true);

      const response = await fetch(
        `${API_URL}/super-admin/admins/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete admin");
      }

      navigate("/super-admin/admins");
    } catch (err) {
      console.error("Delete admin error:", err);
      setError(err.message || "Failed to delete admin");
      setShowDelete(false);
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SuperAdminLayout
        breadcrumbs={[
          { label: "Admins", path: "/super-admin/admins" },
          { label: "Loading..." },
        ]}
      >
        <div className="flex justify-center py-24 text-gray-500">
          Loading admin...
        </div>
      </SuperAdminLayout>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!admin) {
    return (
      <SuperAdminLayout
        breadcrumbs={[
          { label: "Admins", path: "/super-admin/admins" },
          { label: "Not Found" },
        ]}
      >
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">

          <AlertTriangle className="h-12 w-12 mb-3 text-gray-300" />

          <p className="text-lg font-semibold">
            Admin not found
          </p>

          {error && (
            <p className="text-sm text-red-500 mt-2">
              {error}
            </p>
          )}

          <button
            onClick={() => navigate("/super-admin/admins")}
            className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-700"
          >
            Back to Admins
          </button>

        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout
      breadcrumbs={[
        {
          label: "Admins",
          path: "/super-admin/admins",
        },
        {
          label: admin.name,
        },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex justify-between">
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* BACK */}
        <button
          onClick={() => navigate("/super-admin/admins")}
          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admins
        </button>

        {/* PROFILE */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-6">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">

                {admin.profilePhoto ? (
                  <img
                    src={admin.profilePhoto}
                    alt={admin.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                    {admin.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}

              </div>

              <div className="min-w-0 flex-1">

                <h1 className="text-xl font-bold text-white">
                  {admin.name}
                </h1>

                <p className="text-indigo-200 text-sm">
                  {admin.panchayat} · {admin.district}
                </p>

                <div className="flex items-center gap-2 mt-1.5">

                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                      admin.status === "active"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {admin.status === "active" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}

                    {admin.status === "active"
                      ? "Active"
                      : "Inactive"}
                  </span>

                  {admin.emailVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                      <CheckCircle className="h-3 w-3" />
                      Email Verified
                    </span>
                  )}

                </div>
              </div>

            </div>
          </div>

          {/* ACTIONS */}
          <div className="px-5 py-3 bg-indigo-50 flex flex-wrap gap-2 border-b border-gray-100">

            <button
              onClick={() =>
                navigate(`/super-admin/admins/${id}/edit`)
              }
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </button>

            <button
              onClick={() => setShowToggle(true)}
              className={`flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg ${
                admin.status === "active"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {admin.status === "active" ? (
                <ToggleRight className="h-3.5 w-3.5" />
              ) : (
                <ToggleLeft className="h-3.5 w-3.5" />
              )}

              {admin.status === "active"
                ? "Deactivate"
                : "Activate"}
            </button>

            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>

          </div>

          {/* CONTACT */}
          <div className="p-5">

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
              Contact Information
            </h3>

            <div className="space-y-3">

              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                {admin.email}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" />
                {admin.phone}
              </div>

            </div>
          </div>
        </div>

        {/* LOCATION */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-600" />
            <h2 className="font-bold text-gray-900">
              Panchayat Assignment
            </h2>
          </div>

          <div className="px-5 divide-y divide-gray-50">

            <InfoRow
              label="State"
              value={admin.state}
            />

            <InfoRow
              label="State Code"
              value={admin.stateCode}
            />

            <InfoRow
              label="District"
              value={`${admin.district} (${admin.districtCode})`}
            />

            <InfoRow
              label="Sub-District"
              value={`${admin.subDistrict} (${admin.subDistrictCode})`}
            />

            <InfoRow
              label="Panchayat"
              value={`${admin.panchayat} (${admin.panchayatCode})`}
            />

          </div>
        </div>

        {/* ACCOUNT */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">

            <Calendar className="h-4 w-4 text-indigo-600" />

            <h2 className="font-bold text-gray-900">
              Account Information
            </h2>

          </div>

          <div className="px-5 divide-y divide-gray-50">

            <InfoRow
              label="Role"
              value="Admin"
            />

            <InfoRow
              label="Account Status"
              value={
                admin.status === "active"
                  ? "Active"
                  : "Inactive"
              }
            />

            <InfoRow
              label="Email Verified"
              value={
                admin.emailVerified
                  ? "Yes"
                  : "No (pending)"
              }
            />

            <InfoRow
              label="Joined On"
              value={formatDate(admin.createdAt)}
            />

            <InfoRow
              label="Last Login"
              value={formatDate(admin.lastLogin)}
            />

          </div>
        </div>
      </div>

      {/* TOGGLE MODAL */}
      {showToggle && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6">

            <h3 className="font-bold text-gray-900 text-lg mb-2">
              {admin.status === "active"
                ? "Deactivate Admin?"
                : "Activate Admin?"}
            </h3>

            <p className="text-gray-600 text-sm mb-5">
              {admin.status === "active"
                ? `${admin.name} will lose system access.`
                : `${admin.name} will regain system access.`}
            </p>

            <div className="flex gap-3">

              <button
                onClick={handleToggle}
                disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm text-white ${
                  admin.status === "active"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-green-600 hover:bg-green-700"
                } disabled:opacity-50`}
              >
                {actionLoading
                  ? "Updating..."
                  : admin.status === "active"
                  ? "Deactivate"
                  : "Activate"}
              </button>

              <button
                onClick={() => setShowToggle(false)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">

            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-5 rounded-t-2xl flex items-center justify-between">

              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />

                <h3 className="font-bold">
                  Delete Admin
                </h3>
              </div>

              <button
                onClick={() => setShowDelete(false)}
                className="hover:bg-white/20 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            <div className="p-5">

              <p className="text-gray-700 text-sm mb-1 font-semibold">
                Are you sure you want to delete {admin.name}?
              </p>

              <p className="text-gray-500 text-xs mb-5">
                This action cannot be undone. User data will not
                be affected.
              </p>

              <div className="flex gap-3">

                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
                >
                  {actionLoading
                    ? "Deleting..."
                    : "Delete"}
                </button>

                <button
                  onClick={() => setShowDelete(false)}
                  disabled={actionLoading}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold text-sm"
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