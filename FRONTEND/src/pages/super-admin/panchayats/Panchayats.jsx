import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  ChevronDown,
  Eye,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import SuperAdminLayout from "../../../components/super-admin/layout/SuperAdminLayout";
import API_URL from "../../../config/api";

const PAGE_SIZE = 20;

const STATE_CODE = 20;

export default function Panchayats() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);

  const [summary, setSummary] = useState({
    total: 0,
    assigned: 0,
    unassigned: 0,
  });

  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);

  const [search, setSearch] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [filterAssigned, setFilterAssigned] = useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // TOKEN / AUTH
  // ============================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("superAdmin");

    navigate("/super-admin/login", {
      replace: true,
    });
  };

  // ============================================================
  // FETCH DISTRICTS
  // ============================================================

  const fetchDistricts = async () => {
    try {
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      setLocationLoading(true);

      const response = await fetch(
        `${API_URL}/api/locations/states/${STATE_CODE}/districts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch districts"
        );
      }

      setDistricts(data.data || []);
    } catch (error) {
      console.error("District fetch error:", error);

      setError(
        error.message || "Unable to load districts"
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // ============================================================
  // FETCH SUB-DISTRICTS
  // ============================================================

  const fetchSubDistricts = async (districtCode) => {
    try {
      if (!districtCode) {
        setSubDistricts([]);
        return;
      }

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      setLocationLoading(true);

      const response = await fetch(
        `${API_URL}/api/locations/districts/${districtCode}/subdistricts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch sub-districts"
        );
      }

      setSubDistricts(data.data || []);
    } catch (error) {
      console.error(
        "Sub-district fetch error:",
        error
      );

      setSubDistricts([]);

      setError(
        error.message ||
          "Unable to load sub-districts"
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // ============================================================
  // FETCH PANCHAYATS
  // ============================================================

  const fetchPanchayats = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (filterDistrict) {
        const selectedDistrict = districts.find(
          (district) =>
            String(district.districtCode) ===
            String(filterDistrict)
        );

        if (selectedDistrict?.districtName) {
          params.set(
            "district",
            selectedDistrict.districtName
          );
        }
      }

      if (filterSub) {
        const selectedSubDistrict =
          subDistricts.find(
            (sub) =>
              String(sub.subDistrictCode) ===
              String(filterSub)
          );

        if (
          selectedSubDistrict?.subDistrictName
        ) {
          params.set(
            "subDistrict",
            selectedSubDistrict.subDistrictName
          );
        }
      }

      if (filterAssigned) {
        params.set(
          "assigned",
          filterAssigned
        );
      }

      const queryString = params.toString();

      const url =
        `${API_URL}/super-admin/panchayats` +
        (queryString
          ? `?${queryString}`
          : "");

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch Panchayats"
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch Panchayats"
        );
      }

      setRows(data.data || []);

      setSummary(
        data.summary || {
          total: 0,
          assigned: 0,
          unassigned: 0,
        }
      );
    } catch (error) {
      console.error(
        "Panchayat fetch error:",
        error
      );

      setError(
        error.message ||
          "Unable to load Panchayats"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchDistricts();
  }, []);

  // ============================================================
  // LOAD SUB-DISTRICTS WHEN DISTRICT CHANGES
  // ============================================================

  useEffect(() => {
    setFilterSub("");

    if (filterDistrict) {
      fetchSubDistricts(filterDistrict);
    } else {
      setSubDistricts([]);
    }
  }, [filterDistrict]);

  // ============================================================
  // LOAD PANCHAYATS / FILTER CHANGE
  // ============================================================

  useEffect(() => {
    setPage(1);

    const timer = setTimeout(() => {
      fetchPanchayats();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    search,
    filterDistrict,
    filterSub,
    filterAssigned,
    districts,
    subDistricts,
  ]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.max(
    1,
    Math.ceil(rows.length / PAGE_SIZE)
  );

  const safePage = Math.min(
    page,
    totalPages
  );

  const paginated = useMemo(() => {
    const start =
      (safePage - 1) * PAGE_SIZE;

    const end =
      safePage * PAGE_SIZE;

    return rows.slice(start, end);
  }, [rows, safePage]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <SuperAdminLayout
        breadcrumbs={[
          {
            label: "Panchayats",
          },
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

            <p className="text-sm text-gray-500 mt-4">
              Loading Panchayats...
            </p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error && rows.length === 0) {
    return (
      <SuperAdminLayout
        breadcrumbs={[
          {
            label: "Panchayats",
          },
        ]}
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />

            <h2 className="font-bold text-gray-900 mt-3">
              Unable to load Panchayats
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              {error}
            </p>

            <button
              onClick={() =>
                fetchPanchayats()
              }
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

  return (
    <SuperAdminLayout
      breadcrumbs={[
        {
          label: "Panchayats",
        },
      ]}
    >
      <div className="max-w-7xl mx-auto space-y-5">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Panchayats
            </h1>

            <p className="text-sm text-gray-500">
              {summary.assigned} of{" "}
              {summary.total} panchayats
              have an assigned admin
            </p>
          </div>

          <button
            onClick={() =>
              fetchPanchayats(true)
            }
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

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">
              {summary.total}
            </p>

            <p className="text-sm text-gray-500 mt-0.5">
              Total Panchayats
            </p>

            <div className="h-1 w-8 rounded-full mt-2 bg-indigo-600" />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">
              {summary.assigned}
            </p>

            <p className="text-sm text-gray-500 mt-0.5">
              Admin Assigned
            </p>

            <div className="h-1 w-8 rounded-full mt-2 bg-green-600" />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">
              {summary.unassigned}
            </p>

            <p className="text-sm text-gray-500 mt-0.5">
              No Admin
            </p>

            <div className="h-1 w-8 rounded-full mt-2 bg-orange-500" />
          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search panchayat, district, sub-district or admin..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

            {/* DISTRICT */}

            <div className="relative">
              <select
                value={filterDistrict}
                onChange={(e) => {
                  setFilterDistrict(
                    e.target.value
                  );
                  setFilterSub("");
                }}
                disabled={locationLoading}
                className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  All Districts
                </option>

                {districts.map(
                  (district) => (
                    <option
                      key={
                        district.districtCode
                      }
                      value={
                        district.districtCode
                      }
                    >
                      {
                        district.districtName
                      }
                    </option>
                  )
                )}
              </select>

              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* SUB-DISTRICT */}

            <div className="relative">
              <select
                value={filterSub}
                onChange={(e) =>
                  setFilterSub(
                    e.target.value
                  )
                }
                disabled={
                  !filterDistrict ||
                  locationLoading
                }
                className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="">
                  All Sub-Districts
                </option>

                {subDistricts.map(
                  (sub) => (
                    <option
                      key={
                        sub.subDistrictCode
                      }
                      value={
                        sub.subDistrictCode
                      }
                    >
                      {
                        sub.subDistrictName
                      }
                    </option>
                  )
                )}
              </select>

              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* ASSIGNMENT STATUS */}

            <div className="relative">
              <select
                value={filterAssigned}
                onChange={(e) =>
                  setFilterAssigned(
                    e.target.value
                  )
                }
                className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="">
                  All Status
                </option>

                <option value="assigned">
                  Admin Assigned
                </option>

                <option value="unassigned">
                  No Admin
                </option>
              </select>

              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "District",
                    "Sub-District",
                    "Panchayat",
                    "Assigned Admin",
                    "Admin Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">

                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-gray-400"
                    >
                      No Panchayats found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors"
                    >

                      {/* DISTRICT */}

                      <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                        {row.district || "—"}
                      </td>

                      {/* SUB-DISTRICT */}

                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {row.subDistrict || "—"}
                      </td>

                      {/* PANCHAYAT */}

                      <td className="px-4 py-3 text-gray-900 font-semibold whitespace-nowrap">
                        {row.panchayat || "—"}
                      </td>

                      {/* ADMIN */}

                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.admin ? (
                          <div className="flex items-center gap-1.5">

                            {row.admin.profilePhoto ? (
                              <img
                                src={
                                  row.admin
                                    .profilePhoto
                                }
                                alt={
                                  row.admin.name
                                }
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold">
                                {row.admin.name
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </div>
                            )}

                            <span className="text-gray-700 text-sm">
                              {row.admin.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      {/* ADMIN STATUS */}

                      <td className="px-4 py-3">
                        {row.admin ? (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              row.admin.status ===
                              "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.admin.status ===
                            "active" ? (
                              <UserCheck className="h-3 w-3" />
                            ) : (
                              <UserX className="h-3 w-3" />
                            )}

                            {row.admin.status ===
                            "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">
                            —
                          </span>
                        )}
                      </td>

                      {/* ACTION */}

                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            navigate(
                              `/super-admin/panchayats/${row.panchayatCode}`
                            )
                          }
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="View details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">

            <p className="text-xs text-gray-500">
              Showing{" "}
              {rows.length === 0
                ? 0
                : (safePage - 1) *
                    PAGE_SIZE +
                  1}
              –
              {Math.min(
                safePage * PAGE_SIZE,
                rows.length
              )}{" "}
              of {rows.length} panchayats
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">

                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.max(1, p - 1)
                    )
                  }
                  disabled={safePage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                <span className="px-3 text-xs text-gray-500">
                  Page {safePage} of{" "}
                  {totalPages}
                </span>

                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(
                        totalPages,
                        p + 1
                      )
                    )
                  }
                  disabled={
                    safePage ===
                    totalPages
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

              </div>
            )}

          </div>
        </div>

      </div>
    </SuperAdminLayout>
  );
}