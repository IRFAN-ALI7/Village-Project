import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  User,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
} from "lucide-react";

import SuperAdminLayout from "../../../components/super-admin/layout/SuperAdminLayout";
import API_URL from "../../../config/api";

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-50 last:border-0 gap-1">
      <span className="sm:w-36 text-xs font-bold text-gray-400 uppercase tracking-wide">
        {label}
      </span>

      <span className="text-sm text-gray-800 font-medium">
        {value !== null &&
        value !== undefined &&
        value !== ""
          ? value
          : "—"}
      </span>
    </div>
  );
}

export default function PanchayatDetails() {
  const { panchayatCode } = useParams();

  const navigate = useNavigate();

  const [panchayat, setPanchayat] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ============================================================
  // AUTH
  // ============================================================

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("superAdmin");

    navigate("/super-admin/login", {
      replace: true,
    });
  };

  // ============================================================
  // FETCH DETAILS
  // ============================================================

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/super-admin/panchayats/${panchayatCode}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load Panchayat"
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to load Panchayat"
        );
      }

      setPanchayat(data.data);
    } catch (error) {
      console.error(
        "Panchayat details error:",
        error
      );

      setError(
        error.message ||
          "Unable to load Panchayat"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD
  // ============================================================

  useEffect(() => {
    fetchDetails();
  }, [panchayatCode]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <SuperAdminLayout
        breadcrumbs={[
          {
            label: "Panchayats",
            path: "/super-admin/panchayats",
          },
          {
            label: "Loading...",
          },
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">

            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

            <p className="text-sm text-gray-500 mt-4">
              Loading Panchayat details...
            </p>

          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  // ============================================================
  // ERROR / NOT FOUND
  // ============================================================

  if (error || !panchayat) {
    return (
      <SuperAdminLayout
        breadcrumbs={[
          {
            label: "Panchayats",
            path: "/super-admin/panchayats",
          },
          {
            label: "Not Found",
          },
        ]}
      >
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">

          <AlertTriangle className="h-12 w-12 mb-3 text-gray-300" />

          <p className="text-lg font-semibold text-gray-700">
            Panchayat not found
          </p>

          <p className="text-sm mt-1 text-center max-w-md">
            {error ||
              "The requested Panchayat does not exist."}
          </p>

          <div className="flex items-center gap-2 mt-5">

            <button
              onClick={() =>
                navigate(
                  "/super-admin/panchayats"
                )
              }
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Panchayats
            </button>

            <button
              onClick={fetchDetails}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>

          </div>

        </div>
      </SuperAdminLayout>
    );
  }

  const admin = panchayat.admin;

  return (
    <SuperAdminLayout
      breadcrumbs={[
        {
          label: "Panchayats",
          path: "/super-admin/panchayats",
        },
        {
          label:
            panchayat.panchayat,
        },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-5">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          onClick={() =>
            navigate(
              "/super-admin/panchayats"
            )
          }
          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Panchayats
        </button>

        {/* =================================================
            PANCHAYAT CARD
        ================================================= */}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-6">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MapPin className="h-7 w-7 text-white" />
              </div>

              <div>

                <h1 className="text-xl font-bold text-white">
                  {panchayat.panchayat}
                </h1>

                <p className="text-indigo-200 text-sm">
                  {panchayat.subDistrict ||
                    "—"}
                  {" · "}
                  {panchayat.district ||
                    "—"}
                  {" · "}
                  {panchayat.state ||
                    "—"}
                </p>

              </div>

            </div>

          </div>

          <div className="px-5 py-4">

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              Location Hierarchy
            </h3>

            <div className="divide-y divide-gray-50">

              <InfoRow
                label="State"
                value={
                  panchayat.state
                }
              />

              <InfoRow
                label="State Code"
                value={
                  panchayat.stateCode
                }
              />

              <InfoRow
                label="District"
                value={
                  panchayat.district
                }
              />

              <InfoRow
                label="District Code"
                value={
                  panchayat.districtCode
                }
              />

              <InfoRow
                label="Sub-District"
                value={
                  panchayat.subDistrict
                }
              />

              <InfoRow
                label="Sub-District Code"
                value={
                  panchayat.subDistrictCode
                }
              />

              <InfoRow
                label="Panchayat"
                value={
                  panchayat.panchayat
                }
              />

              <InfoRow
                label="Panchayat Code"
                value={
                  panchayat.panchayatCode
                }
              />

            </div>
          </div>
        </div>

        {/* =================================================
            ASSIGNED ADMIN
        ================================================= */}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <User className="h-4 w-4 text-indigo-600" />

              <h2 className="font-bold text-gray-900">
                Assigned Admin
              </h2>

            </div>

            {!admin && (
              <button
                onClick={() =>
                  navigate(
                    "/super-admin/admins/create"
                  )
                }
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg"
              >
                <Plus className="h-3.5 w-3.5" />
                Assign Admin
              </button>
            )}

          </div>

          {admin ? (
            <div className="p-5">

              {/* ADMIN HEADER */}

              <div className="flex items-center gap-4 mb-4">

                {admin.profilePhoto ? (
                  <img
                    src={
                      admin.profilePhoto
                    }
                    alt={admin.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-lg font-bold">
                    {admin.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>
                )}

                <div>

                  <p className="font-bold text-gray-900">
                    {admin.name}
                  </p>

                  <div className="flex items-center gap-1.5 mt-0.5">

                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        admin.status ===
                        "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >

                      {admin.status ===
                      "active" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}

                      {admin.status ===
                      "active"
                        ? "Active"
                        : "Inactive"}

                    </span>

                  </div>

                </div>

              </div>

              {/* ADMIN CONTACT */}

              <div className="space-y-2">

                <div className="flex items-center gap-2 text-sm text-gray-600">

                  <Mail className="h-4 w-4 text-gray-400" />

                  <span>
                    {admin.email ||
                      "—"}
                  </span>

                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">

                  <Phone className="h-4 w-4 text-gray-400" />

                  <span>
                    {admin.phone ||
                      "—"}
                  </span>

                </div>

              </div>

              {/* ADMIN ACTIONS */}

              <div className="mt-4 flex gap-2">

                <button
                  onClick={() =>
                    navigate(
                      `/super-admin/admins/${admin.id}`
                    )
                  }
                  className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg"
                >
                  View Admin Profile
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/super-admin/admins/${admin.id}/edit`
                    )
                  }
                  className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg"
                >
                  Edit Admin
                </button>

              </div>

            </div>
          ) : (
            <div className="p-8 flex flex-col items-center text-center">

              <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-3">

                <AlertTriangle className="h-7 w-7 text-orange-400" />

              </div>

              <p className="font-semibold text-gray-700 mb-1">
                Admin Not Assigned
              </p>

              <p className="text-sm text-gray-400 mb-4">
                No admin is currently responsible for this Panchayat.
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/super-admin/admins/create"
                  )
                }
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
              >
                <Plus className="h-4 w-4" />
                Create & Assign Admin
              </button>

            </div>
          )}

        </div>

      </div>
    </SuperAdminLayout>
  );
}