import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, Calendar, ChevronLeft, ChevronRight, MapPin, X, Image as ImageIcon, Trash2, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import API_URL from '../../config/api';

export default function MyComplaints() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const itemsPerPage = 10;
  console.log(complaints);

    // Mock data - replace with actual API call
useEffect(()=> {
  const token = localStorage.getItem("token");
  const fetchData = async()=> {
    try{
      const res = await fetch(`${API_URL}/my-complaints`, {
        method: "GET",
        headers:{
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if(res.ok){
        setComplaints(data);
      }else{
        console.log("something went wrong");
      }
    }catch(err){
      console.log(err);
    }
  }
  fetchData();
},[]);

  const handleDeleteComplaint = async(complaintId) => {
    if (!window.confirm(`Are you sure you want to delete complaint ${complaintId}?`)) return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/complaints/${complaintId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        const data = await res.json();
        if(res.ok){
          alert(data.message);
         setComplaints(complaints.filter(c => c.complaintId !== complaintId));
         setSelectedComplaint(null);
        }else{
          alert(data.message);
        }
      }catch(err){
        console.log(err);
      }
  };

  // Filter and search
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.complaintType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || complaint.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentComplaints = filteredComplaints.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending' },
      'in-progress': { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'In Progress' },
      resolved: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Resolved' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Rejected' },
    };
    const badge = badges[status];

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        {badge.label}
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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const statusCounts = {
    all: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    'in-progress': complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { key: 'all', label: 'Total', color: 'from-purple-500 to-purple-600' },
          { key: 'pending', label: 'Pending', color: 'from-yellow-500 to-yellow-600' },
          { key: 'in-progress', label: 'In Progress', color: 'from-blue-500 to-blue-600' },
          { key: 'resolved', label: 'Resolved', color: 'from-green-500 to-green-600' },
          { key: 'rejected', label: 'Rejected', color: 'from-red-500 to-red-600' },
        ].map((stat) => (
          <div
            key={stat.key}
            onClick={() => setFilterStatus(stat.key)}
            className={`bg-gradient-to-r ${stat.color} p-4 rounded-xl text-white cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${
              filterStatus === stat.key ? 'ring-4 ring-white shadow-xl' : ''
            }`}
          >
            <p className="text-sm font-medium opacity-90">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{statusCounts[stat.key]}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
          <h1 className="text-2xl font-bold mb-4">My Complaints History</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 focus:ring-2 focus:ring-white focus:outline-none"
              />
            </div>
            <button className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg hover:bg-white/30 transition-all flex items-center space-x-2 font-semibold">
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Complaint ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentComplaints.map((complaint) => (
                <tr key={complaint.complaintId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-blue-600">{complaint.complaintId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{complaint.complaintType}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{complaint.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{complaint.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(complaint.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(complaint.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-1 text-sm font-semibold"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDeleteComplaint(complaint.complaintId)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all flex items-center space-x-1 text-sm font-semibold"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Results */}
        {currentComplaints.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No complaints found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(endIndex, filteredComplaints.length)}</span> of{' '}
                <span className="font-semibold">{filteredComplaints.length}</span> results
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...'}
                      className={`min-w-[40px] h-10 rounded-lg font-semibold transition-all ${
                        page === currentPage
                          ? 'bg-green-600 text-white shadow-lg'
                          : page === '...'
                          ? 'bg-transparent text-gray-400 cursor-default'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Complaint Details</h2>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
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
                  <p className="font-semibold">{new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Ward Number</p>
                  <p className="font-semibold">{selectedComplaint.wardNo}</p>
                </div>
                {selectedComplaint.landmark && (
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">Landmark</p>
                    <p className="font-semibold">{selectedComplaint.landmark}</p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-2">Description</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.status === 'resolved' && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-sm font-semibold text-green-800 mb-1">Resolution Update</p>
                  <p className="text-sm text-green-700">
                       {selectedComplaint.statusReason}
                  </p>
                </div>
              )}

              {selectedComplaint.status === 'rejected' && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">
                    {selectedComplaint.statusReason}
                  </p>
                </div>
              )}

               {selectedComplaint.status === 'in-progress' && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm font-semibold text-blue-800 mb-1">In-Progress</p>
                  <p className="text-sm text-blue-700">
                    Our team is actively working to resolve your issue. We appreciate your patience.
                  </p>
                </div>
              )}

              {selectedComplaint.photos && selectedComplaint.photos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 font-semibold mb-2">Images</p>
                  <div className="flex space-x-4">
                    {selectedComplaint.photos.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Complaint ${selectedComplaint.complaintId} Image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => window.open(image, '_blank')}
                          className="absolute top-1 right-1 bg-white/70 hover:bg-white/90 p-1 rounded-full transition-all"
                        >
                          <ImageIcon className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowStatusModal(true)}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all font-semibold"
                >
                  Track Status
                </button>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Tracking Modal */}
      {showStatusModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Track Complaint Status</h2>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-white/90 text-sm mt-2">Complaint ID: {selectedComplaint.complaintId}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Timeline */}
              <div className="space-y-6">
                {/* Pending Status */}
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedComplaint.status === 'pending' || selectedComplaint.status === 'in-progress' || selectedComplaint.status === 'resolved'
                      ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <Clock className={`h-6 w-6 ${
                      selectedComplaint.status === 'pending' || selectedComplaint.status === 'in-progress' || selectedComplaint.status === 'resolved'
                        ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-gray-800">Pending</h3>
                      {selectedComplaint.status === 'pending' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Current</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Complaint has been registered and is waiting for review</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN')} {new Date(selectedComplaint.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {(selectedComplaint.status === 'pending' || selectedComplaint.status === 'in-progress' || selectedComplaint.status === 'resolved') && (
                    <CheckCircle className="h-6 w-6 text-yellow-600" />
                  )}
                </div>

                {/* Connector Line */}
                {(selectedComplaint.status === 'in-progress' || selectedComplaint.status === 'resolved') && (
                  <div className="ml-6 w-0.5 h-8 bg-blue-300"></div>
                )}

                {/* In Progress Status */}
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedComplaint.status === 'in-progress' || selectedComplaint.status === 'resolved'
                      ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <AlertCircle className={`h-6 w-6 ${
                      selectedComplaint.status === 'in-progress' || selectedComplaint.status === 'resolved'
                        ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-gray-800">In Progress</h3>
                      {selectedComplaint.status === 'in-progress' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Current</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedComplaint.status === 'in-progress' || selectedComplaint.status === 'resolved'
                        ? 'Our team is working on resolving your complaint'
                        : 'Complaint will be assigned to relevant department'}
                    </p>
                    {(selectedComplaint.status === 'in-progress' || selectedComplaint.status === 'resolved') && (
                      <p className="text-xs text-gray-500 mt-1">Updated on {new Date(selectedComplaint.inProgressAt).toLocaleString('en-IN')}</p>
                    )}
                  </div>
                  {(selectedComplaint.status === 'in-progress' || selectedComplaint.status === 'resolved') && (
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  )}
                </div>

                {/* Connector Line */}
                {selectedComplaint.status === 'resolved' && (
                  <div className="ml-6 w-0.5 h-8 bg-green-300"></div>
                )}

                {/* Resolved/Rejected Status */}
                {selectedComplaint.status === 'resolved' && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-gray-800">Resolved</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Current</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Your complaint has been successfully resolved!</p>
                      <p className="text-xs text-gray-500 mt-1">Resolved on {new Date(selectedComplaint.resolvedAt).toLocaleString('en-IN')}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                )}

                {selectedComplaint.status === 'rejected' && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-gray-800">Rejected</h3>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Current</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Your complaint was reviewed and rejected</p>
                      <p className="text-xs text-gray-500 mt-1">Rejected on {new Date(selectedComplaint.rejectedAt).toLocaleString('en-IN')}</p>
                    </div>
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                )}
              </div>

              {/* Current Status Info Box */}
              <div className={`rounded-lg p-4 border-l-4 ${
                selectedComplaint.status === 'pending' ? 'bg-yellow-50 border-yellow-500' :
                selectedComplaint.status === 'in-progress' ? 'bg-blue-50 border-blue-500' :
                selectedComplaint.status === 'resolved' ? 'bg-green-50 border-green-500' :
                'bg-red-50 border-red-500'
              }`}>
                <p className={`font-semibold mb-1 ${
                  selectedComplaint.status === 'pending' ? 'text-yellow-800' :
                  selectedComplaint.status === 'in-progress' ? 'text-blue-800' :
                  selectedComplaint.status === 'resolved' ? 'text-green-800' :
                  'text-red-800'
                }`}>
                  {selectedComplaint.status === 'pending' && 'Your complaint is in queue'}
                  {selectedComplaint.status === 'in-progress' && 'Work is in progress'}
                  {selectedComplaint.status === 'resolved' && 'Complaint successfully resolved'}
                  {selectedComplaint.status === 'rejected' && 'Complaint rejected'}
                </p>
                <p className={`text-sm ${
                  selectedComplaint.status === 'pending' ? 'text-yellow-700' :
                  selectedComplaint.status === 'in-progress' ? 'text-blue-700' :
                  selectedComplaint.status === 'resolved' ? 'text-green-700' :
                  'text-red-700'
                }`}>
                  {selectedComplaint.status === 'pending' && 'Our team will review and assign this to the relevant department soon.'}
                  {selectedComplaint.status === 'in-progress' && selectedComplaint.statusReason}
                  {selectedComplaint.status === 'resolved' && selectedComplaint.statusReason}
                  {selectedComplaint.status === 'rejected' &&  selectedComplaint.statusReason}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
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