import { useState, useEffect } from 'react';
import { Award, CheckCircle, Clock, XCircle, Eye, X, FileText, ThumbsUp, ThumbsDown, Download, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';

export default function CertificatesManagement() {
  const [certificates, setCertificates] = useState([]);

  useEffect(()=> {
    fetchCertificates();
  },[]);

  const fetchCertificates = async()=> {
    const token = localStorage.getItem("token");
    try{
      const res = await fetch(`${API_URL}/admin/certificates`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
        });
        const data = await res.json();
        if(res.ok){
          setCertificates(data.data);
        } else{
          console.log(data.message);
        }
    }catch(err){
      console.log(err.message);
    }
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filters and Search
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter and search logic
  const filteredCertificates = certificates.filter((cert) => {
    // Filter by type
    if (filterType !== 'all' && cert.type !== filterType) return false;

    // Filter by status
    if (filterStatus !== 'all' && cert.status !== filterStatus) return false;

    // Filter by date range
    if (startDate && new Date(cert.appliedDate) < new Date(startDate)) return false;
    if (endDate && new Date(cert.appliedDate) > new Date(endDate)) return false;

    // Search by name or ID
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (
        !cert.certificateId.toLowerCase().includes(search) &&
        !cert.applicantName.toLowerCase().includes(search)
      ) {
        return false;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCertificates = filteredCertificates.slice(startIndex, endIndex);

  const statusCounts = {
    total: certificates.length,
    pending: certificates.filter(c => c.status === 'pending').length,
    approved: certificates.filter(c => c.status === 'approved').length,
    rejected: certificates.filter(c => c.status === 'rejected').length,
  };

  const handleApprove = async(id) => {
    try{
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/certificates/approve/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if(res.ok){
        toast.success(data.message);
        fetchCertificates();
        setShowViewModal(false)
      }else{
        toast.error(data.message);
      }
    }catch(err){
      console.log(err);
    }
  };

  const handleReject = async(id) => {
    setSelectedCertificate(certificates.find(c => c._id === id) || null);
    setShowViewModal(false);
    setShowRejectModal(true);
  };

  const confirmReject = async() => {
    if (!selectedCertificate || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try{
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/certificates/reject/${selectedCertificate._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            reason: rejectionReason
          })
      });
      const data = await res.json();
      if(res.ok){
        toast.success(data.message);
        fetchCertificates();
         setShowRejectModal(false);
         setRejectionReason('');
         setSelectedCertificate(null);
      }else{
        toast.error(data.message);
      }
    }catch(err){
      console.log(err);
    }
  };

  const handleViewDetails = (cert) => {
    setSelectedCertificate(cert);
    setShowViewModal(true);
  };

  const handleShowReason = (cert) => {
    setSelectedCertificate(cert);
    setShowReasonModal(true);
  };

  const handleDownload = async(cert) => {
    try{
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/certificates/download/${cert._id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        },
      }
    );
    if(res.ok){
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document .createElement("a");
    a.href = url;
    a.download = `${cert.certificateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success(cert.type + ' downloaded successfully!');
    }else{
      const data = await res.json();
      toast.error(data.message);
    }
  }catch(err){
    console.log(err);
    toast.error("Download failed");
  }
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

  const getStatusBadge = (status) => {
    if (status === 'pending') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>;
    } else if (status === 'approved') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Approved</span>;
    } else if (status === 'rejected') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rejected</span>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Certificate Applications</h2>
            <p className="text-gray-600 text-sm mt-1">Manage and review certificate requests</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.total}</p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Certificate Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Certificate Type</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Income Certificate">Income Certificate</option>
                <option value="Caste Certificate">Caste Certificate</option>
                <option value="Residential Certificate">Residential Certificate</option>
                <option value="Birth Certificate">Birth Certificate</option>
                <option value="Death Certificate">Death Certificate</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Search by Name or ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Application ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Certificate Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Applicant Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Applied Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No certificates found matching your filters
                    </td>
                  </tr>
                ) : (
                  currentCertificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{cert.certificateId}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{cert.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{cert.applicantName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(cert.appliedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-6 py-4">{getStatusBadge(cert.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(cert)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-semibold transition-colors"
                          >
                            View
                          </button>

                          {cert.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(cert._id)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-semibold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(cert._id)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-semibold transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {cert.status === 'approved' && (
                            <button
                              onClick={() => handleDownload(cert)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-semibold transition-colors flex items-center space-x-1"
                            >
                              <Download className="h-3 w-3" />
                              <span>Download</span>
                            </button>
                          )}

                          {cert.status === 'rejected' && (
                            <button
                              onClick={() => handleShowReason(cert)}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-semibold transition-colors"
                            >
                              Reason
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredCertificates.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(endIndex, filteredCertificates.length)}</span> out of{' '}
                  <span className="font-semibold">{filteredCertificates.length}</span> results
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={'px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1 ' + (currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300')}
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
                        className={'min-w-[40px] h-10 rounded-lg font-semibold transition-all ' + (page === currentPage ? 'bg-blue-600 text-white shadow-lg' : page === '...' ? 'bg-transparent text-gray-400 cursor-default' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300')}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={'px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1 ' + (currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300')}
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Certificate Details Modal */}
      {showViewModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Certificate Application Details</h2>
                    <p className="text-white/80 text-sm">Application ID: {selectedCertificate.certificateId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Certificate Information */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Certificate Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Certificate Type</p>
                    <p className="text-gray-800 font-bold">{selectedCertificate.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Application ID</p>
                    <p className="text-blue-600 font-bold">{selectedCertificate.certificateId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Status</p>
                    {getStatusBadge(selectedCertificate.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Application Date</p>
                    <p className="text-gray-800">{new Date(selectedCertificate.appliedDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  {selectedCertificate.issueDate && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">Approved Date</p>
                      <p className="text-green-600 font-bold">{new Date(selectedCertificate.issueDate).toLocaleString('en-IN')}</p>
                    </div>
                  )}
                  {selectedCertificate.rejectionReason && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 font-semibold mb-1">Rejection Reason</p>
                      <p className="text-red-600 font-semibold">{selectedCertificate.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Applied By Section */}
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Applied By</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Applicant Name</p>
                    <p className="text-gray-800 font-bold">{selectedCertificate.userId?.name}</p>
                  </div>
                  {selectedCertificate.userId && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">Email Address</p>
                      <p className="text-gray-800">{selectedCertificate.userId?.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Phone Number</p>
                    <p className="text-gray-800">{selectedCertificate.userId?.mobile}</p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Full Name</p>
                    <p className="text-gray-800 font-bold">{selectedCertificate.applicantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Father's Name</p>
                    <p className="text-gray-800">{selectedCertificate.fatherName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Date of Birth</p>
                    <p className="text-gray-800">{new Date(selectedCertificate.dateOfBirth).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Gender</p>
                    <p className="text-gray-800 capitalize">{selectedCertificate.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Phone Number</p>
                    <p className="text-gray-800">{selectedCertificate.phoneNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Address</p>
                    <p className="text-gray-800">{selectedCertificate.address}</p>
                  </div>
                </div>
              </div>

              {/* Certificate Specific Details */}
              {(selectedCertificate.annualIncome || selectedCertificate.placeOfBirth || selectedCertificate.deceasedName || selectedCertificate.casteCategory || selectedCertificate.yearsOfResidence) && (
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Certificate Specific Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Income Certificate */}
                    {selectedCertificate.annualIncome && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 font-semibold mb-1">Annual Income</p>
                          <p className="text-gray-800 font-bold">{selectedCertificate.annualIncome}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-semibold mb-1">Occupation</p>
                          <p className="text-gray-800">{selectedCertificate.occupation}</p>
                        </div>
                      </>
                    )}

                    {/* Birth Certificate */}
                    {selectedCertificate.placeOfBirth && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 font-semibold mb-1">Place of Birth</p>
                          <p className="text-gray-800">{selectedCertificate.placeOfBirth}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-semibold mb-1">Birth Location</p>
                          <p className="text-gray-800 capitalize">{selectedCertificate.birthLocation}</p>
                        </div>
                      </>
                    )}

                    {/* Death Certificate */}
                    {selectedCertificate.deceasedName && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 font-semibold mb-1">Deceased Person's Name</p>
                          <p className="text-gray-800 font-bold">{selectedCertificate.deceasedName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-semibold mb-1">Date of Death</p>
                          <p className="text-gray-800">{selectedCertificate.dateOfDeath ? new Date(selectedCertificate.dateOfDeath).toLocaleDateString('en-IN') : 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 font-semibold mb-1">Cause of Death</p>
                          <p className="text-gray-800">{selectedCertificate.causeOfDeath}</p>
                        </div>
                      </>
                    )}

                    {/* Caste Certificate */}
                    {selectedCertificate.casteCategory && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Caste Category</p>
                        <p className="text-gray-800 font-bold">{selectedCertificate.casteCategory}</p>
                      </div>
                    )}

                    {/* Residential Certificate */}
                    {selectedCertificate.yearsOfResidence && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Years of Residence</p>
                        <p className="text-gray-800 font-bold">{selectedCertificate.yearsOfResidence} years</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document Details */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Document Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Aadhaar Number</p>
                    <p className="text-gray-800 font-mono">{selectedCertificate.aadhaarNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">PAN Number</p>
                    <p className="text-gray-800 font-mono">{selectedCertificate.panNumber || 'Not Provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Purpose of Certificate</p>
                    <p className="text-gray-800">{selectedCertificate.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                {selectedCertificate.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedCertificate._id)}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center space-x-2"
                    >
                      <ThumbsUp className="h-5 w-5" />
                      <span>Approve Certificate</span>
                    </button>
                    <button
                      onClick={() => handleReject(selectedCertificate._id)}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center space-x-2"
                    >
                      <ThumbsDown className="h-5 w-5" />
                      <span>Reject Certificate</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Certificate Modal */}
      {showRejectModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <XCircle className="h-8 w-8" />
                <h2 className="text-2xl font-bold">Reject Certificate</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Application ID:</span> {selectedCertificate.certificateId}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Applicant:</span> {selectedCertificate.applicantName}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Type:</span> {selectedCertificate.type}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  placeholder="Please provide a clear reason for rejection..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={confirmReject}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Rejection Reason Modal */}
      {showReasonModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">Rejection Reason</h2>
                </div>
                <button
                  onClick={() => setShowReasonModal(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Application ID:</span> {selectedCertificate.certificateId}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Applicant:</span> {selectedCertificate.applicantName}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Type:</span> {selectedCertificate.type}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Rejection:
                </label>
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <p className="text-gray-800">{selectedCertificate.rejectionReason || 'No reason provided'}</p>
                </div>
              </div>

              <button
                onClick={() => setShowReasonModal(false)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}