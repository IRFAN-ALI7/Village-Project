import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, X, AlertTriangle, User as UserIcon, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API_URL from '../../config/api';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);

  
  useEffect (()=> {
    const fetchUsers = async()=> {
      try{
     const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      const data = await res.json();
      if(res.ok){
        setUsers(data);
        console.log(data);
      }else{
        console.log(data.message);
      }
    }catch(err){
      console.log(err);
    }
  };
  fetchUsers();
  },[]);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewClick = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async() => {
    if (!selectedUser ||
       !selectedUser.name ||
       !selectedUser.mobile ||
       !selectedUser.address ||
       !selectedUser.village ||
       !selectedUser.wardNo ||
       !selectedUser.postOffice ||
       !selectedUser.policeStation ||
       !selectedUser.district ||
       !selectedUser.state ||
       !selectedUser.pincode
    ) {
      toast.error('Please fill all required fields!');
      return;
    };
      try{
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/users/${selectedUser._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(selectedUser)
        });
        const data = await res.json();
        if (res.ok) {
           setUsers(users.map(u => u._id === selectedUser._id ? selectedUser : u));
           setShowEditModal(false);
           setSelectedUser(null);
          toast.success(data.message);
        }else{
          toast.error(data.message);
        }
      }catch(err){
        console.log(err);
      }
    };
  


  const handleDeleteClick = (id) => {
    setDeleteUserId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async() => {
    if (deleteUserId == null) return;
    try{
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/users/${deleteUserId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter(u => u._id !== deleteUserId));
        setShowDeleteModal(false);
        setDeleteUserId(null);
        toast.success(data.message);
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.mobile.includes(searchQuery)
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Users Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <p className="text-3xl font-bold mb-1">{users.length}</p>
            <p className="text-blue-100">Total Users</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <p className="text-3xl font-bold mb-1">{users.filter(u => u.status === 'active').length}</p>
            <p className="text-green-100">Active Users</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <p className="text-3xl font-bold mb-1">{users.filter(u => u.status === 'inactive').length}</p>
            <p className="text-orange-100">Inactive Users</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-3xl font-bold mb-1">{users.filter(u => new Date(u.joined).getMonth() === new Date().getMonth()).length}</p>
            <p className="text-purple-100">New This Month</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Ward</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600">{user.mobile}</td>
                  <td className="px-4 py-3"> {user.wardNo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewClick(user)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(user._id)}
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 mt-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
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

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">User Details</h2>
                <button onClick={() => setShowViewModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">Full Name</p>
                    <p className="text-gray-900 font-semibold">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">Mobile Number</p>
                    <p className="text-gray-900 font-semibold">{selectedUser.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">Email Address</p>
                    <p className="text-gray-900 font-semibold">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">Ward Number</p>
                    <p className="text-gray-900 font-semibold">{selectedUser.wardNo}</p>
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">Address Information</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">Full Address</p>
                    <p className="text-gray-900 font-semibold">{selectedUser.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">Village</p>
                      <p className="text-gray-900 font-semibold">{selectedUser.village}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">Post Office</p>
                      <p className="text-gray-900 font-semibold">{selectedUser.postOffice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">Police Station</p>
                      <p className="text-gray-900 font-semibold">{selectedUser.policeStation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">District</p>
                      <p className="text-gray-900 font-semibold">{selectedUser.district}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">State</p>
                      <p className="text-gray-900 font-semibold">{selectedUser.state}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold mb-1">Pincode</p>
                      <p className="text-gray-900 font-semibold">{selectedUser.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">Joined Date</p>
                    <p className="text-gray-900 font-semibold">{new Date(selectedUser.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button onClick={() => setShowViewModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Edit User</h2>
                <button onClick={() => setShowEditModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={selectedUser.mobile}
                    onChange={(e) => setSelectedUser({ ...selectedUser, mobile: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Village</label>
                  <input
                    type="text"
                    value={selectedUser.village}
                    onChange={(e) => setSelectedUser({ ...selectedUser, village: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ward Number</label>
                  <input
                    type="text"
                    value={selectedUser.wardNo}
                    onChange={(e) => setSelectedUser({ ...selectedUser, wardNo: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea
                  value={selectedUser.address}
                  onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Post Office</label>
                  <input
                    type="text"
                    value={selectedUser.postOffice}
                    onChange={(e) => setSelectedUser({ ...selectedUser, postOffice: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Police Station</label>
                  <input
                    type="text"
                    value={selectedUser.policeStation}
                    onChange={(e) => setSelectedUser({ ...selectedUser, policeStation: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
                  <input
                    type="text"
                    value={selectedUser.district}
                    onChange={(e) => setSelectedUser({ ...selectedUser, district: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={selectedUser.state}
                    onChange={(e) => setSelectedUser({ ...selectedUser, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    value={selectedUser.pincode}
                    onChange={(e) => setSelectedUser({ ...selectedUser, pincode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedUser.status}
                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button onClick={handleUpdateUser} className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold">
                  Update User
                </button>
                <button onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Confirm Delete</h2>
                <button onClick={() => setShowDeleteModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-semibold mb-1">Warning!</p>
                    <p className="text-red-700 text-sm">This will permanently delete the user and all associated data.</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button onClick={handleDeleteConfirm} className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold">
                  Yes, Delete
                </button>
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">
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