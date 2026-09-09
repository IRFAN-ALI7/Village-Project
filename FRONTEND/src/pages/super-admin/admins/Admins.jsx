import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import SuperAdminLayout from "../../../components/super-admin/layout/SuperAdminLayout";
import API_URL from "../../../config/api";

const STATE_CODE = 20;

// =====================================================
// HELPERS
// =====================================================

const getAdminId = (admin) => admin?._id || admin?.id;

// =====================================================
// STATUS BADGE
// =====================================================

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
        status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function Admins() {
  const navigate = useNavigate();

  // ===================================================
  // ADMIN DATA
  // ===================================================

  const [admins, setAdmins] = useState([]);

  // ===================================================
  // LOCATION DATA
  // ===================================================

  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [panchayats, setPanchayats] = useState([]);

  // ===================================================
  // FILTERS
  // ===================================================

  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubDistrict, setSelectedSubDistrict] =
    useState("");
  const [selectedPanchayat, setSelectedPanchayat] =
    useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // ===================================================
  // LOADING / ERROR
  // ===================================================

  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");

  // ===================================================
  // MODALS
  // ===================================================

  const [deleteAdmin, setDeleteAdmin] = useState(null);
  const [statusAdmin, setStatusAdmin] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  // =====================================================
  // FETCH ADMINS
  // =====================================================

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/super-admin/admins`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch admins"
        );
      }

      setAdmins(data.admins || []);
    } catch (error) {
      console.error("Fetch admins error:", error);

      setError(
        error.message || "Failed to fetch admins"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH DISTRICTS
  // =====================================================

  const fetchDistricts = async () => {
    try {
      setLocationLoading(true);

      const response = await fetch(
        `${API_URL}/api/locations/states/${STATE_CODE}/districts`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch districts"
        );
      }

      setDistricts(data.data || []);
    } catch (error) {
      console.error(
        "Fetch districts error:",
        error
      );

      setError(
        error.message || "Failed to fetch districts"
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchAdmins();
    fetchDistricts();
  }, []);

  // =====================================================
  // FETCH SUB-DISTRICTS
  // =====================================================

  useEffect(() => {
    if (!selectedDistrict) {
      setSubDistricts([]);
      return;
    }

    const fetchSubDistricts = async () => {
      try {
        setLocationLoading(true);

        const response = await fetch(
          `${API_URL}/api/locations/districts/${selectedDistrict}/subdistricts`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch sub-districts"
          );
        }

        setSubDistricts(data.data || []);
      } catch (error) {
        console.error(
          "Fetch sub-districts error:",
          error
        );

        setSubDistricts([]);

        setError(
          error.message ||
            "Failed to fetch sub-districts"
        );
      } finally {
        setLocationLoading(false);
      }
    };

    fetchSubDistricts();
  }, [selectedDistrict]);

  // =====================================================
  // FETCH PANCHAYATS
  // =====================================================

  useEffect(() => {
    if (!selectedSubDistrict) {
      setPanchayats([]);
      return;
    }

    const fetchPanchayats = async () => {
      try {
        setLocationLoading(true);

        const response = await fetch(
          `${API_URL}/api/locations/subdistricts/${selectedSubDistrict}/panchayats`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch panchayats"
          );
        }

        setPanchayats(data.data || []);
      } catch (error) {
        console.error(
          "Fetch panchayats error:",
          error
        );

        setPanchayats([]);

        setError(
          error.message ||
            "Failed to fetch panchayats"
        );
      } finally {
        setLocationLoading(false);
      }
    };

    fetchPanchayats();
  }, [selectedSubDistrict]);

  // =====================================================
  // FILTER ADMINS
  // =====================================================

  const filteredAdmins = admins.filter((admin) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      admin.name?.toLowerCase().includes(query) ||
      admin.email?.toLowerCase().includes(query) ||
      admin.phone?.toLowerCase().includes(query);

    const matchesDistrict =
      !selectedDistrict ||
      Number(admin.districtCode) ===
        Number(selectedDistrict);

    const matchesSubDistrict =
      !selectedSubDistrict ||
      Number(admin.subDistrictCode) ===
        Number(selectedSubDistrict);

    const matchesPanchayat =
      !selectedPanchayat ||
      Number(admin.panchayatCode) ===
        Number(selectedPanchayat);

    const matchesStatus =
      !selectedStatus ||
      admin.status === selectedStatus;

    return (
      matchesSearch &&
      matchesDistrict &&
      matchesSubDistrict &&
      matchesPanchayat &&
      matchesStatus
    );
  });

  // =====================================================
  // DISTRICT CHANGE
  // =====================================================

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);

    setSelectedSubDistrict("");
    setSelectedPanchayat("");

    setSubDistricts([]);
    setPanchayats([]);
  };

  // =====================================================
  // SUB-DISTRICT CHANGE
  // =====================================================

  const handleSubDistrictChange = (value) => {
    setSelectedSubDistrict(value);

    setSelectedPanchayat("");
    setPanchayats([]);
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    setSearch("");
    setSelectedDistrict("");
    setSelectedSubDistrict("");
    setSelectedPanchayat("");
    setSelectedStatus("");

    setSubDistricts([]);
    setPanchayats([]);
  };

  // =====================================================
  // TOGGLE ADMIN STATUS
  // =====================================================

  const handleToggleStatus = async () => {
    if (!statusAdmin) return;

    try {
      setActionLoading(true);
      setError("");

      const adminId = getAdminId(statusAdmin);

      const newStatus =
        statusAdmin.status === "active"
          ? "inactive"
          : "active";

      const response = await fetch(
        `${API_URL}/super-admin/admins/${adminId}/status`,
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
        throw new Error(
          data.message ||
            "Failed to update admin status"
        );
      }

      if (data.admin) {
        setAdmins((previousAdmins) =>
          previousAdmins.map((admin) =>
            getAdminId(admin) === adminId
              ? data.admin
              : admin
          )
        );
      } else {
        await fetchAdmins();
      }

      setStatusAdmin(null);
    } catch (error) {
      console.error(
        "Toggle admin status error:",
        error
      );

      setError(
        error.message ||
          "Failed to update admin status"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // DELETE ADMIN
  // =====================================================

  const handleDeleteAdmin = async () => {
    if (!deleteAdmin) return;

    try {
      setActionLoading(true);
      setError("");

      const adminId = getAdminId(deleteAdmin);

      const response = await fetch(
        `${API_URL}/super-admin/admins/${adminId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete admin"
        );
      }

      setAdmins((previousAdmins) =>
        previousAdmins.filter(
          (admin) =>
            getAdminId(admin) !== adminId
        )
      );

      setDeleteAdmin(null);
    } catch (error) {
      console.error(
        "Delete admin error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete admin"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <SuperAdminLayout
      breadcrumbs={[
        {
          label: "Admins",
        },
      ]}
    >
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ============================================= */}
        {/* HEADER */}
        {/* ============================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admins
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage all Panchayat administrators
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/super-admin/admins/create"
              )
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />

            Create Admin
          </button>

        </div>

        {/* ============================================= */}
        {/* ERROR */}
        {/* ============================================= */}

        {error && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 hover:bg-red-100 rounded p-1"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        )}

        {/* ============================================= */}
        {/* FILTER BOX */}
        {/* ============================================= */}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">

          {/* SEARCH */}

          <div className="relative mb-4">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name, email or phone..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

          </div>

          {/* FILTERS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* DISTRICT */}

            <div className="relative">

              <select
                value={selectedDistrict}
                onChange={(e) =>
                  handleDistrictChange(
                    e.target.value
                  )
                }
                disabled={locationLoading && !districts.length}
                className="w-full appearance-none px-3 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              >
                <option value="">
                  All Districts
                </option>

                {districts.map((district) => (
                  <option
                    key={district.districtCode}
                    value={district.districtCode}
                  >
                    {district.districtName}
                  </option>
                ))}
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

            </div>

            {/* SUB DISTRICT */}

            <div className="relative">

              <select
                value={selectedSubDistrict}
                onChange={(e) =>
                  handleSubDistrictChange(
                    e.target.value
                  )
                }
                disabled={!selectedDistrict}
                className="w-full appearance-none px-3 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  All Sub-Districts
                </option>

                {subDistricts.map(
                  (subDistrict) => (
                    <option
                      key={
                        subDistrict.subDistrictCode
                      }
                      value={
                        subDistrict.subDistrictCode
                      }
                    >
                      {subDistrict.subDistrictName}
                    </option>
                  )
                )}
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

            </div>

            {/* PANCHAYAT */}

            <div className="relative">

              <select
                value={selectedPanchayat}
                onChange={(e) =>
                  setSelectedPanchayat(
                    e.target.value
                  )
                }
                disabled={!selectedSubDistrict}
                className="w-full appearance-none px-3 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  All Panchayats
                </option>

                {panchayats.map((panchayat) => (
                  <option
                    key={panchayat.panchayatCode}
                    value={panchayat.panchayatCode}
                  >
                    {panchayat.panchayatName}
                  </option>
                ))}
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

            </div>

            {/* STATUS */}

            <div className="relative">

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value
                  )
                }
                className="w-full appearance-none px-3 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">
                  All Statuses
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

            </div>

          </div>

          {/* CLEAR */}

          {(search ||
            selectedDistrict ||
            selectedSubDistrict ||
            selectedPanchayat ||
            selectedStatus) && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear Filters
            </button>
          )}

        </div>

        {/* ============================================= */}
        {/* TABLE */}
        {/* ============================================= */}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">
              Loading admins...
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 border-b border-gray-100">

                  <tr>

                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                      Admin
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                      Email
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                      Phone
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                      District
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                      Sub-District
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                      Panchayat
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                      Status
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-14 text-center text-sm text-gray-500"
                      >
                        No admins found.
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((admin) => {

                      const adminId =
                        getAdminId(admin);

                      return (
                        <tr
                          key={adminId}
                          className="hover:bg-gray-50 transition-colors"
                        >

                          {/* ADMIN */}

                          <td className="px-4 py-3">

                            <div className="flex items-center gap-3">

                              {admin.profilePhoto ? (
                                <img
                                  src={
                                    admin.profilePhoto
                                  }
                                  alt={admin.name}
                                  className="w-9 h-9 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                  {admin.name
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                                </div>
                              )}

                              <div>
                                <p className="font-semibold text-gray-900 whitespace-nowrap">
                                  {admin.name}
                                </p>

                                <p className="text-xs text-gray-400">
                                  Admin
                                </p>
                              </div>

                            </div>

                          </td>

                          {/* EMAIL */}

                          <td className="px-4 py-3 text-sm text-gray-600">
                            {admin.email}
                          </td>

                          {/* PHONE */}

                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {admin.phone}
                          </td>

                          {/* DISTRICT */}

                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {admin.district || "—"}
                          </td>

                          {/* SUB DISTRICT */}

                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {admin.subDistrict || "—"}
                          </td>

                          {/* PANCHAYAT */}

                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {admin.panchayat || "—"}
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-3">
                            <StatusBadge
                              status={admin.status}
                            />
                          </td>

                          {/* ACTIONS */}

                          <td className="px-4 py-3">

                            <div className="flex items-center gap-1.5">

                              {/* VIEW */}

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/super-admin/admins/${adminId}`
                                  )
                                }
                                title="View Admin"
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* EDIT */}

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/super-admin/admins/${adminId}/edit`
                                  )
                                }
                                title="Edit Admin"
                                className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* STATUS */}

                              <button
                                type="button"
                                onClick={() =>
                                  setStatusAdmin(
                                    admin
                                  )
                                }
                                title={
                                  admin.status ===
                                  "active"
                                    ? "Deactivate Admin"
                                    : "Activate Admin"
                                }
                                className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                              >
                                {admin.status ===
                                "active" ? (
                                  <ToggleRight className="w-4 h-4" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4" />
                                )}
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteAdmin(
                                    admin
                                  )
                                }
                                title="Delete Admin"
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    })
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* RESULT COUNT */}

        {!loading && (
          <p className="text-xs text-gray-400">
            Showing {filteredAdmins.length} of{" "}
            {admins.length} admins
          </p>
        )}

      </div>

      {/* ================================================= */}
      {/* STATUS MODAL */}
      {/* ================================================= */}

      {statusAdmin && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">

            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mx-auto mb-4">

              {statusAdmin.status ===
              "active" ? (
                <ToggleRight className="w-6 h-6 text-indigo-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-indigo-600" />
              )}

            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center">
              {statusAdmin.status ===
              "active"
                ? "Deactivate Admin?"
                : "Activate Admin?"}
            </h3>

            <p className="text-sm text-gray-500 text-center mt-2">
              {statusAdmin.status ===
              "active"
                ? `${statusAdmin.name} will no longer be able to access the admin panel.`
                : `${statusAdmin.name} will regain access to the admin panel.`}
            </p>

            <div className="flex gap-3 mt-6">

              <button
                type="button"
                onClick={() =>
                  setStatusAdmin(null)
                }
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50 ${
                  statusAdmin.status ===
                  "active"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {actionLoading
                  ? "Updating..."
                  : statusAdmin.status ===
                    "active"
                  ? "Deactivate"
                  : "Activate"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* DELETE MODAL */}
      {/* ================================================= */}

      {deleteAdmin && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">

            <div className="bg-red-600 px-5 py-4 text-white flex items-center justify-between">

              <div className="flex items-center gap-2">

                <AlertTriangle className="w-5 h-5" />

                <h3 className="font-bold">
                  Delete Admin
                </h3>

              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteAdmin(null)
                }
                className="p-1 rounded hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            <div className="p-5">

              <p className="text-sm text-gray-700">
                Are you sure you want to delete{" "}
                <strong>
                  {deleteAdmin.name}
                </strong>
                ?
              </p>

              <p className="text-xs text-gray-500 mt-2">
                This action cannot be undone.
              </p>

              <div className="flex gap-3 mt-6">

                <button
                  type="button"
                  onClick={() =>
                    setDeleteAdmin(null)
                  }
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAdmin}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {actionLoading
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}
    </SuperAdminLayout>
  );
}