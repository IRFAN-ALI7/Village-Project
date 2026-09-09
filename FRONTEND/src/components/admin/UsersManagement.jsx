import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  User as UserIcon,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import API_URL from '../../config/api';
import toast from "react-hot-toast";
import axios from 'axios';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [panchayats, setPanchayats] = useState([]);
  const [villages, setVillages] = useState([]);
  const [postOffices, setPostOffices] = useState([]);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [originalEmail, setOriginalEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      setUsers(
        data.map((user) => ({
          ...user,
          id: user._id,
          phone: user.mobile,
          joined: user.createdAt,
        }))
      );
    } catch (error) {
      console.error("Users fetch error:", error);

      toast.error(
        error.response?.data?.message ||
        "Users fetch error."
      );
    } finally {
      setLoading(false);
    }
  };

  // States
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/locations/states`
        );

        setStates(response.data.data || []);
      } catch (error) {
        console.error("States fetch error:", error);
        toast.error("States load nahi ho paaye.");
      }
    };

    fetchStates();
  }, []);

  // Districts
  useEffect(() => {
    if (!selectedUser?.state) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/locations/states/${selectedUser.state}/districts`
        );

        setDistricts(response.data.data || []);
      } catch (error) {
        console.error("Districts fetch error:", error);
        setDistricts([]);
      }
    };

    fetchDistricts();
  }, [selectedUser?.state]);

  // Sub-Districts
  useEffect(() => {
    if (!selectedUser?.district) {
      setSubDistricts([]);
      return;
    }

    const fetchSubDistricts = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/locations/districts/${selectedUser.district}/subdistricts`
        );

        setSubDistricts(response.data.data || []);
      } catch (error) {
        console.error("SubDistricts fetch error:", error);
        setSubDistricts([]);
      }
    };

    fetchSubDistricts();
  }, [selectedUser?.district]);

  // Panchayats
  useEffect(() => {
    if (!selectedUser?.subDistrict) {
      setPanchayats([]);
      return;
    }

    const fetchPanchayats = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/locations/subdistricts/${selectedUser.subDistrict}/panchayats`
        );

        setPanchayats(response.data.data || []);
      } catch (error) {
        console.error("Panchayats fetch error:", error);
        setPanchayats([]);
      }
    };

    fetchPanchayats();
  }, [selectedUser?.subDistrict]);

  // Villages
  useEffect(() => {
    if (!selectedUser?.subDistrict || !selectedUser?.panchayat) {
      setVillages([]);
      return;
    }

    const fetchVillages = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/locations/subdistricts/${selectedUser.subDistrict}/panchayats/${selectedUser.panchayat}/villages`
        );

        setVillages(response.data.data || []);
      } catch (error) {
        console.error("Villages fetch error:", error);
        setVillages([]);
      }
    };

    fetchVillages();
  }, [selectedUser?.subDistrict, selectedUser?.panchayat]);

  // Post Offices
  useEffect(() => {
    if (!selectedUser?.pincode) {
      setPostOffices([]);
      return;
    }

    const fetchPostOffices = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/locations/pincodes/${selectedUser.pincode}/postoffices`
        );

        setPostOffices(response.data.data || []);
      } catch (error) {
        console.error("Post Offices fetch error:", error);
        setPostOffices([]);
      }
    };

    fetchPostOffices();
  }, [selectedUser?.pincode]);

  // Location Setter
  const setLocation = (field) => (value) => {
    if (field === "state") {
      return;
    }

    if (field === "district") {
      return;
    }

    if (field === "subDistrict") {
      return;
    }

    if (field === "panchayat") {
      return;
    }

    if (field === "village") {
      const village = villages.find(
        (item) =>
          String(item.villageCode) === String(value)
      );

      setSelectedUser((prev) => ({
        ...prev,
        village: value,
        pincode: village?.pincode || prev.pincode || "",
        postOffice: "",
      }));

      return;
    }

    if (field === "postOffice") {
      setSelectedUser((prev) => ({
        ...prev,
        postOffice: value,
      }));

      return;
    }

    setSelectedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleViewClick = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser({
      ...user,
      phone: user.phone || user.mobile || "",
    });

    setOriginalEmail(user.email || "");
    setEmailVerified(true);
    setOtp("");
    setShowEditModal(true);
  };

  const handleEmailChange = (value) => {
    setSelectedUser((prev) => ({
      ...prev,
      email: value,
    }));

    const newEmail = value.trim().toLowerCase();
    const currentEmail = originalEmail.trim().toLowerCase();

    if (newEmail === currentEmail) {
      setEmailVerified(true);
    } else {
      setEmailVerified(false);
    }
  };

  const handleRequestEmailVerification = async () => {
    if (!selectedUser?.email) {
      toast.error("Please enter an email address.");
      return;
    }

    const newEmail = selectedUser.email.trim().toLowerCase();
    const currentEmail = originalEmail.trim().toLowerCase();

    if (newEmail === currentEmail) {
      setEmailVerified(true);
      toast.success("This is already the current email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setEmailChangeLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/admin/users/${selectedUser._id}/request-email-change`,
        {
          email: newEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOtp("");
      setShowOtpModal(true);

      toast.success(
        response.data.message ||
        "OTP has been sent to the new email address."
      );
    } catch (error) {
      console.error("Email verification request error:", error);

      toast.error(
        error.response?.data?.message ||
        "OTP send nahi ho paaya."
      );
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error("OTP must be 6 digits.");
      return;
    }

    try {
      setOtpLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/admin/users/${selectedUser._id}/verify-email-change`,
        {
          otp: otp.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmailVerified(true);
      setOriginalEmail(selectedUser.email.trim().toLowerCase());
      setShowOtpModal(false);
      setOtp("");

      toast.success(
        response.data.message ||
        "Email verified successfully."
      );
    } catch (error) {
      console.error("Email OTP verification error:", error);

      toast.error(
        error.response?.data?.message ||
        "Invalid or expired OTP."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setShowOtpModal(false);
    setSelectedUser(null);
    setOtp("");
    setEmailVerified(false);
    setOriginalEmail("");
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !selectedUser.name || !selectedUser.phone) {
      toast.error("Please fill all required fields!");
      return;
    }

    if (!/^\d{10}$/.test(selectedUser.phone)) {
      toast.error("Phone number must be 10 digits.");
      return;
    }

    const currentEmail = originalEmail.trim().toLowerCase();
    const enteredEmail = (selectedUser.email || "").trim().toLowerCase();

    if (!enteredEmail) {
      toast.error("Email is required.");
      return;
    }

    if (enteredEmail !== currentEmail && !emailVerified) {
      toast.error("Please verify the new email address with OTP.");
      return;
    }

    if (!selectedUser.village) {
      toast.error("Please select Village.");
      return;
    }

    if (!selectedUser.postOffice) {
      toast.error("Please select Post Office.");
      return;
    }

    if (!selectedUser.policeStation?.trim()) {
      toast.error("Please enter Police Station.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/admin/users/${selectedUser._id}`,
        {
          name: selectedUser.name,
          mobile: selectedUser.phone,
          email: enteredEmail,
          address: selectedUser.address,

          state: selectedUser.state,
          district: selectedUser.district,
          subDistrict: selectedUser.subDistrict,
          panchayat: selectedUser.panchayat,

          village: selectedUser.village,
          pincode: selectedUser.pincode,
          postOffice: selectedUser.postOffice,
          policeStation: selectedUser.policeStation,

          status: selectedUser.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data.user;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id
            ? {
                ...user,
                ...updatedUser,
                id: updatedUser._id,
                phone: updatedUser.mobile,
                joined: updatedUser.createdAt,
              }
            : user
        )
      );

      setShowEditModal(false);
      setShowOtpModal(false);
      setSelectedUser(null);
      setOtp("");
      setEmailVerified(false);
      setOriginalEmail("");

      toast.success(
        response.data.message ||
        "User updated successfully!"
      );
    } catch (error) {
      console.error("Update user error:", error);

      toast.error(
        error.response?.data?.message ||
        "User update error."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId) => {
    setDeleteUserId(userId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteUserId === null) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${API_URL}/admin/users/${deleteUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const remainingUsers = users.filter(
        (user) => user.id !== deleteUserId
      );

      setUsers(remainingUsers);

      setShowDeleteModal(false);
      setDeleteUserId(null);

      const newTotalPages = Math.ceil(
        remainingUsers.length / itemsPerPage
      );

      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }

      toast.success(
        response.data.message ||
        "User deleted successfully!"
      );
    } catch (error) {
      console.error("Delete user error:", error);

      toast.error(
        error.response?.data?.message ||
        "User delete error."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    (u.phone || "")
      .includes(searchQuery) ||
    (u.village || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const totalPages = Math.ceil(
    filteredUsers.length / itemsPerPage
  );

  const getStateName = (stateValue) => {
    return (
      states.find(
        (state) =>
          String(state.stateCode) === String(stateValue)
      )?.stateName ||
      stateValue ||
      "—"
    );
  };

  const getDistrictName = (districtValue) => {
    return (
      districts.find(
        (district) =>
          String(district.districtCode) ===
          String(districtValue)
      )?.districtName ||
      districtValue ||
      "—"
    );
  };

  const getSubDistrictName = (subDistrictValue) => {
    return (
      subDistricts.find(
        (item) =>
          String(item.subDistrictCode) ===
          String(subDistrictValue)
      )?.subDistrictName ||
      subDistrictValue ||
      "—"
    );
  };

  const getPanchayatName = (panchayatValue) => {
    return (
      panchayats.find(
        (item) =>
          String(item.panchayatCode) ===
          String(panchayatValue)
      )?.panchayatName ||
      panchayatValue ||
      "—"
    );
  };

  const getVillageName = (villageValue) => {
    return (
      villages.find(
        (item) =>
          String(item.villageCode) ===
          String(villageValue)
      )?.villageName ||
      villageValue ||
      "—"
    );
  };

  const getPostOfficeName = (postOfficeValue) => {
    return (
      postOffices.find(
        (item) =>
          String(item.officeName) ===
          String(postOfficeValue)
      )?.officeName ||
      postOfficeValue ||
      "—"
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Users Management
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <p className="text-3xl font-bold mb-1">
              {users.length}
            </p>
            <p className="text-blue-100">
              Total Users
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <p className="text-3xl font-bold mb-1">
              {
                users.filter(
                  (u) => u.status === 'active'
                ).length
              }
            </p>
            <p className="text-green-100">
              Active Users
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <p className="text-3xl font-bold mb-1">
              {
                users.filter(
                  (u) => u.status === 'inactive'
                ).length
              }
            </p>
            <p className="text-orange-100">
              Inactive Users
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-3xl font-bold mb-1">
              {
                users.filter(
                  (u) =>
                    new Date(u.joined).getMonth() ===
                    new Date().getMonth()
                ).length
              }
            </p>
            <p className="text-purple-100">
              New This Month
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

            <input
              type="text"
              placeholder="Search users by name, phone, or village..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Name
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Phone
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Village
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Panchayat
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Joined
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {user.name}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {user.phone}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {user.village}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {user.panchayat}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {new Date(
                      user.joined
                    ).toLocaleDateString('en-IN')}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleViewClick(user)
                        }
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleEditClick(user)
                        }
                        className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteClick(user.id)
                        }
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {currentUsers.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-500">
              No users found.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 mt-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}–
              {Math.min(
                startIndex + itemsPerPage,
                filteredUsers.length
              )}{' '}
              of {filteredUsers.length} users
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  setCurrentPage((p) => p - 1)
                }
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from(
                { length: totalPages },
                (_, i) => i + 1
              ).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 &&
                    page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() =>
                        setCurrentPage(page)
                      }
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }

                if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span
                      key={page}
                      className="px-2 text-gray-400"
                    >
                      ...
                    </span>
                  );
                }

                return null;
              })}

              <button
                onClick={() =>
                  setCurrentPage((p) => p + 1)
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  User Details
                </h2>

                <button
                  onClick={() =>
                    setShowViewModal(false)
                  }
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">
                      Full Name
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {selectedUser.name || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">
                      Mobile Number
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {selectedUser.phone || '—'}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 font-semibold mb-1">
                      Email Address
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-semibold break-all">
                        {selectedUser.email || '—'}
                      </p>

                      {selectedUser.emailVerified && (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold">
                          <CheckCircle className="h-4 w-4" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">
                    Address Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">
                      Full Address
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {selectedUser.address || '—'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">
                        State
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {getStateName(
                          selectedUser.state
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">
                        District
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {getDistrictName(
                          selectedUser.district
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">
                        Sub-District
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {getSubDistrictName(
                          selectedUser.subDistrict
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">
                        Panchayat
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {getPanchayatName(
                          selectedUser.panchayat
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">
                        Village
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {getVillageName(
                          selectedUser.village
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">
                        Pincode
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {selectedUser.pincode || '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">
                        Post Office
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {getPostOfficeName(
                          selectedUser.postOffice
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">
                        Police Station
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {selectedUser.policeStation || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Joined */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">
                      Status
                    </p>

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        selectedUser.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {(
                        selectedUser.status || ''
                      ).toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">
                      Joined Date
                    </p>

                    <p className="text-gray-900 font-semibold">
                      {selectedUser.joined
                        ? new Date(
                            selectedUser.joined
                          ).toLocaleDateString(
                            'en-IN'
                          )
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  setShowViewModal(false)
                }
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Edit User
                </h2>

                <button
                  onClick={handleCloseEditModal}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Personal Information */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>

                <input
                  type="text"
                  value={selectedUser.name || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone *
                  </label>

                  <input
                    type="tel"
                    value={selectedUser.phone || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        phone: e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10),
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                      <input
                        type="email"
                        value={selectedUser.email || ""}
                        onChange={(e) =>
                          handleEmailChange(
                            e.target.value
                          )
                        }
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {emailVerified ? (
                      <div className="flex items-center gap-1 px-3 bg-green-50 text-green-700 border-2 border-green-200 rounded-lg font-semibold text-sm">
                        <ShieldCheck className="h-5 w-5" />
                        Verified
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={
                          handleRequestEmailVerification
                        }
                        disabled={
                          emailChangeLoading
                        }
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {emailChangeLoading
                          ? "Sending..."
                          : "Verify"}
                      </button>
                    )}
                  </div>

                  {!emailVerified && (
                    <p className="text-xs text-orange-600 mt-2">
                      New email address must be verified with OTP before updating.
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>

                <textarea
                  value={selectedUser.address || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      address: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              {/* State, District & Sub-District */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State
                  </label>

                  <div className="relative">
                    <select
                      value={
                        selectedUser.state || ""
                      }
                      disabled
                      className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    >
                      {selectedUser.state ? (
                        <option
                          value={selectedUser.state}
                        >
                          Jharkhand
                        </option>
                      ) : (
                        <option value="">
                          Jharkhand
                        </option>
                      )}
                    </select>

                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    District
                  </label>

                  <div className="relative">
                    <select
                      value={
                        selectedUser.district ||
                        ""
                      }
                      disabled
                      className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    >
                      <option value="">
                        Select District
                      </option>

                      {selectedUser.district &&
                        !districts.some(
                          (district) =>
                            String(
                              district.districtCode
                            ) ===
                            String(
                              selectedUser.district
                            )
                        ) && (
                          <option
                            value={
                              selectedUser.district
                            }
                          >
                            {
                              selectedUser.district
                            }
                          </option>
                        )}

                      {districts.map((district) => (
                        <option
                          key={
                            district.districtCode
                          }
                          value={
                            district.districtCode
                          }
                        >
                          {district.districtName}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sub-District
                  </label>

                  <div className="relative">
                    <select
                      value={
                        selectedUser.subDistrict ||
                        ""
                      }
                      disabled
                      className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    >
                      <option value="">
                        Select Sub-District
                      </option>

                      {selectedUser.subDistrict &&
                        !subDistricts.some(
                          (item) =>
                            String(
                              item.subDistrictCode
                            ) ===
                            String(
                              selectedUser.subDistrict
                            )
                        ) && (
                          <option
                            value={
                              selectedUser.subDistrict
                            }
                          >
                            {
                              selectedUser.subDistrict
                            }
                          </option>
                        )}

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
                            {
                              subDistrict.subDistrictName
                            }
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Panchayat, Village & Pincode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Panchayat
                  </label>

                  <div className="relative">
                    <select
                      value={
                        selectedUser.panchayat ||
                        ""
                      }
                      disabled
                      className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    >
                      <option value="">
                        Select Panchayat
                      </option>

                      {selectedUser.panchayat &&
                        !panchayats.some(
                          (item) =>
                            String(
                              item.panchayatCode
                            ) ===
                            String(
                              selectedUser.panchayat
                            )
                        ) && (
                          <option
                            value={
                              selectedUser.panchayat
                            }
                          >
                            {
                              selectedUser.panchayat
                            }
                          </option>
                        )}

                      {panchayats.map(
                        (panchayat) => (
                          <option
                            key={
                              panchayat.panchayatCode
                            }
                            value={
                              panchayat.panchayatCode
                            }
                          >
                            {
                              panchayat.panchayatName
                            }
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Village *
                  </label>

                  <div className="relative">
                    <select
                      value={
                        selectedUser.village ||
                        ""
                      }
                      onChange={(e) =>
                        setLocation("village")(
                          e.target.value
                        )
                      }
                      disabled={
                        !selectedUser.panchayat
                      }
                      className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        Select Village
                      </option>

                      {selectedUser.village &&
                        !villages.some(
                          (item) =>
                            String(
                              item.villageCode
                            ) ===
                            String(
                              selectedUser.village
                            )
                        ) && (
                          <option
                            value={
                              selectedUser.village
                            }
                          >
                            {
                              selectedUser.village
                            }
                          </option>
                        )}

                      {villages.map((village) => (
                        <option
                          key={
                            village.villageCode
                          }
                          value={
                            village.villageCode
                          }
                        >
                          {village.villageName}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode
                  </label>

                  <input
                    type="text"
                    value={
                      selectedUser.pincode || ""
                    }
                    readOnly
                    placeholder="Auto-filled from village"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Post Office & Police Station */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Post Office *
                  </label>

                  <div className="relative">
                    <select
                      value={
                        selectedUser.postOffice ||
                        ""
                      }
                      onChange={(e) =>
                        setLocation("postOffice")(
                          e.target.value
                        )
                      }
                      disabled={
                        !selectedUser.pincode
                      }
                      className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        Select Post Office
                      </option>

                      {selectedUser.postOffice &&
                        !postOffices.some(
                          (item) =>
                            String(
                              item.officeName
                            ) ===
                            String(
                              selectedUser.postOffice
                            )
                        ) && (
                          <option
                            value={
                              selectedUser.postOffice
                            }
                          >
                            {
                              selectedUser.postOffice
                            }
                          </option>
                        )}

                      {postOffices.map(
                        (postOffice) => (
                          <option
                            key={
                              postOffice.postOfficeCode ||
                              postOffice._id ||
                              postOffice.officeName
                            }
                            value={
                              postOffice.officeName
                            }
                          >
                            {
                              postOffice.officeName
                            }
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Police Station *
                  </label>

                  <input
                    type="text"
                    value={
                      selectedUser.policeStation ||
                      ""
                    }
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        policeStation:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>

                <select
                  value={
                    selectedUser.status || "active"
                  }
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleUpdateUser}
                  disabled={loading}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Updating..."
                    : "Update User"}
                </button>

                <button
                  onClick={handleCloseEditModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    Verify Email
                  </h2>

                  <p className="text-blue-100 text-sm mt-1">
                    Enter the OTP sent to the new email.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowOtpModal(false)
                  }
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />

                  <div>
                    <p className="text-sm text-blue-700 font-semibold">
                      OTP sent to
                    </p>

                    <p className="text-blue-900 font-bold break-all">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter 6-Digit OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="Enter OTP"
                autoFocus
                className="w-full px-4 py-3 text-center text-xl tracking-[0.4em] border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex space-x-3 mt-5">
                <button
                  onClick={handleVerifyOtp}
                  disabled={
                    otpLoading ||
                    otp.length !== 6
                  }
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {otpLoading
                    ? "Verifying..."
                    : "Verify OTP"}
                </button>

                <button
                  onClick={() =>
                    setShowOtpModal(false)
                  }
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                OTP is valid for a limited time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Confirm Delete
                </h2>

                <button
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />

                  <div>
                    <p className="text-red-800 font-semibold mb-1">
                      Warning!
                    </p>

                    <p className="text-red-700 text-sm">
                      This will permanently delete the user and all associated data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Deleting..."
                    : "Yes, Delete"}
                </button>

                <button
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}