import { useState,useEffect } from 'react';
import { Search, Filter, Eye, Edit, CheckCircle, XCircle, Clock, Download, Calendar, MapPin, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API_URL from '../../config/api';

export default function ComplaintsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const [complaints, setComplaints] = useState([]);

  useEffect(()=> {
    const fetchComplaints = async()=> {
      try{
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/complaints`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if(res.ok){
          setComplaints(data);
        }else{
          console.log(data.message);
        }
      }catch(err){
        console.log(err);
      }
    }
    fetchComplaints();
  },[])

  const filteredComplaints = complaints.filter(c => 
    (filterStatus === 'all' || c.status === filterStatus) &&
    (c.userId?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
     c.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentComplaints = filteredComplaints.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const statusCounts = {
    all: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    'in-progress': complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badges[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
      medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
    };
    const badge = badges[priority];
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

   const handleUpdateStatus = async() => {
    if (!newStatus) {
      alert('Please select a status.');
      return;
    }

    if ((newStatus === 'rejected' || newStatus === 'resolved') && !statusReason.trim()) {
      alert(`Please provide a reason for ${newStatus === 'rejected' ? 'rejection' : 'resolution'}.`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/status-update/${selectedComplaint._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          reasons: statusReason,
        }),
      }
    );
    const data = await res.json();
    if(!res.ok){
      toast.success(data.message);
      return;
    }
     setComplaints(complaints.map(c => 
      c._id === selectedComplaint?._id
        ? { ...c, 
          status: newStatus,
           statusReason: statusReason || c.statusReason
           }
        : c
    ));
    toast.success(`Complaint ${selectedComplaint?.complaintId} status updated to ${newStatus} successfully!`);
    setSelectedComplaint(null);
    setNewStatus('');
    setStatusReason('');
    
    }catch(err){
      console.log(err);
    }
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusReason(complaint.statusReason || '');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Complaint Management</h2>
        
        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, name, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {Object.entries(statusCounts).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`p-3 rounded-lg font-semibold text-sm transition-all ${
                filterStatus === key ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Ward</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentComplaints.map((complaint) => (
                <tr key={complaint.complaintId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-blue-600">{complaint.complaintId}</td>
                  <td className="px-4 py-3 font-semibold">{complaint.userId?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{complaint.category}</td>
                  <td className="px-4 py-3">{complaint.wardNo}</td>
                  <td className="px-4 py-3">{getStatusBadge(complaint.status)}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button onClick={() => handleViewComplaint(complaint)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                        <CheckCircle className="h-4 w-4" />
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredComplaints.length)} of {filteredComplaints.length} complaints
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

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Complaint Details</h2>
                <button
                  onClick={() => {
                    setSelectedComplaint(null);
                    setNewStatus('');
                    setStatusReason('');
                  }}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Complaint Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Complaint ID</p>
                  <p className="text-lg font-bold text-blue-600">{selectedComplaint.complaintId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Status</p>
                  <div>{getStatusBadge(selectedComplaint.status)}</div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Type</p>
                  <p className="font-semibold">{selectedComplaint.complaintType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Category</p>
                  <p className="font-semibold">{selectedComplaint.category}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Priority</p>
                  <div>{getPriorityBadge(selectedComplaint.priority)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Date Submitted</p>
                  <p className="font-semibold flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN')}</span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Ward Number</p>
                  <p className="font-semibold">Ward {selectedComplaint.wardNo}</p>
                </div>
                {selectedComplaint.landmark && (
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">Landmark</p>
                    <p className="font-semibold flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedComplaint.landmark}</span>
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">User Name</p>
                  <p className="font-semibold">{selectedComplaint.userId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Phone Number</p>
                  <p className="font-semibold">{selectedComplaint.userId?.mobile}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-2">Description</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Images Section */}
              {selectedComplaint.photos && selectedComplaint.photos.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-3 flex items-center space-x-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>Images ({selectedComplaint.photos.length})</span>
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedComplaint.photos.map((photo, index) => (
                      <a
                        key={index}
                        href={photo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all cursor-pointer"
                      >
                        <img
                          src={photo}
                          alt={`Complaint image ${index + 1}`}
                          className="w-full h-24 object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Status Reason (if exists) */}
              {selectedComplaint.statusReason && (
                <div className={`border-l-4 p-4 rounded ${
                  selectedComplaint.status === 'resolved' 
                    ? 'bg-green-50 border-green-500' 
                    : selectedComplaint.status === 'rejected'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-blue-50 border-blue-500'
                }`}>
                  <p className={`text-sm font-semibold mb-1 ${
                    selectedComplaint.status === 'resolved'
                      ? 'text-green-800'
                      : selectedComplaint.status === 'rejected'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}>
                    {selectedComplaint.status === 'resolved' ? 'Resolution Details' :
                     selectedComplaint.status === 'rejected' ? 'Rejection Reason' :
                     'Status Update'}
                  </p>
                  <p className={`text-sm ${
                    selectedComplaint.status === 'resolved'
                      ? 'text-green-700'
                      : selectedComplaint.status === 'rejected'
                      ? 'text-red-700'
                      : 'text-blue-700'
                  }`}>
                    {selectedComplaint.statusReason}
                  </p>
                </div>
              )}

              {/* Status Update Section */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-bold text-gray-800 text-lg">Update Status</h3>
                
                <div>
                  <label className="block text-sm text-gray-700 font-semibold mb-2">
                    Change Status <span className="text-red-600">*</span>
                  </label>
                  <select 
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {(newStatus === 'rejected' || newStatus === 'resolved' || newStatus === 'in-progress') && (
                  <div>
                    <label className="block text-sm text-gray-700 font-semibold mb-2">
                      {newStatus === 'rejected' ? 'Reason for Rejection' : 
                       newStatus === 'resolved' ? 'Resolution Details' : 
                       'Status Update Message'} <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                      rows={4}
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder={
                        newStatus === 'rejected' 
                          ? 'Enter the reason for rejecting this complaint...' 
                          : newStatus === 'resolved'
                          ? 'Describe how the complaint was resolved...'
                          : 'Provide an update on the complaint status...'
                      }
                      required
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <button 
                  onClick={handleUpdateStatus}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Update Status</span>
                </button>
                <button 
                  onClick={() => {
                    setSelectedComplaint(null);
                    setNewStatus('');
                    setStatusReason('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}