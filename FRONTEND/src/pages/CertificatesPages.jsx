import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Award, FileText, ArrowLeft, Download, CheckCircle, Clock, XCircle, Trash2, ChevronLeft, ChevronRight, Users, IndianRupee, Baby, Heart, MapPin, Eye, X, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../config/api';


export default function CertificatesPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Filters and Search
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [myCertificates, setMyCertificates] = useState([]);

  useEffect(()=> {
    fetchCertificate();
  }, []);
  
  const fetchCertificate = async()=> {
    try{
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/certificates/my-certificates`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if(res.ok){
        setMyCertificates(data.data);
      }else{
        toast.error(data.message);
      }
    }catch(err){
      toast.error("Server error");
    };
  };

  const certificateTypes = [
    {
      id: 'income',
      name: 'Income Certificate',
      icon: IndianRupee,
      color: 'from-green-500 to-green-600',
      description: 'Get income certificate for various purposes',
    },
    {
      id: 'caste',
      name: 'Caste Certificate',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      description: 'Apply for caste certificate',
    },
    {
      id: 'residential',
      name: 'Residential Certificate',
      icon: MapPin,
      color: 'from-blue-500 to-blue-600',
      description: 'Get residential proof',
    },
    {
      id: 'birth',
      name: 'Birth Certificate',
      icon: Baby,
      color: 'from-pink-500 to-pink-600',
      description: 'Apply for birth certificate',
    },
    {
      id: 'death',
      name: 'Death Certificate',
      icon: Heart,
      color: 'from-gray-500 to-gray-600',
      description: 'Apply for death certificate',
    },
  ];

  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    address: '',
    certificateType: '',
    aadhaarNumber: '',
    purpose: '',
  });

  const handleApply = (typeName) => {
    setFormData({ ...formData, certificateType: typeName });
    setShowForm(true);
  };

  // Filter and search logic
  const filteredCertificates = myCertificates.filter((cert) => {
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

    const handleSubmit = async(e) => {
    e.preventDefault();

    const newCertificate = {
      type: formData.certificateType,
      applicantName: formData.name,
      fatherName: formData.fatherName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phoneNumber: formData.phoneNumber,
      address: formData.address,

      annualIncome: formData.annualIncome,
      occupation: formData.occupation,
      
      placeOfBirth: formData.placeOfBirth,
      birthLocation: formData.birthLocation,
      
      deceasedName: formData.deceasedName,
      dateOfDeath: formData.dateOfDeath,
      causeOfDeath: formData.causeOfDeath,

      casteCategory: formData.casteCategory,

      yearsOfResidence: formData.yearsOfResidence,

      aadhaarNumber: formData.aadhaarNumber,
      panNumber: formData.panNumber,
      purpose: formData.purpose,
    };

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/certificates/create`, {
      method: "POST",
      headers:  {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newCertificate)
    });
    const data = await res.json();
    if(res.ok){
    setMyCertificates([data.data, ...myCertificates]);
    toast.success(data.message);
    setShowForm(false);
    setFormData({
      name: '',
      fatherName: '',
      dateOfBirth: '',
      gender: '',
      phoneNumber: '',
      address: '',
      certificateType: '',
      aadhaarNumber: '',
      purpose: '',
    });
  }else{
    toast.error(data.message);
  }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            <CheckCircle className="h-4 w-4" />
            <span>Approved</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
            <Clock className="h-4 w-4" />
            <span>Pending</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            <XCircle className="h-4 w-4" />
            <span>Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleViewCertificate = (cert) => {
    setSelectedCertificate(cert);
    setShowViewModal(true);
  };

  const handleTrackStatus = (cert) => {
    setSelectedCertificate(cert);
    setShowTrackModal(true);
  };

  const handleShowReason = (cert) => {
    setSelectedCertificate(cert);
    setShowReasonModal(true);
  };

  const handleDeleteCertificate = async(id) => {
    if (!window.confirm('Are you sure you want to delete'))
      return;
     
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/certificates/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if(res.ok){
      setMyCertificates(myCertificates.filter(cert => cert._id !== id));
      toast.success(data.message);
    }else{
      toast.error(data.message);
    }
  };

  const handleDownloadCertificate = async(cert) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <Award className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Certificates Portal</h1>
              <p className="text-white/90 text-lg">Apply for various certificates online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showForm ? (
          <>
            {/* Certificate Types */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Apply for Certificate</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {certificateTypes.map((cert) => {
                  const Icon = cert.icon;
                  return (
                    <div
                      key={cert.id}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:transform hover:-translate-y-2 border border-gray-100"
                    >
                      <div className={'inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ' + cert.color + ' rounded-xl mb-4'}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 min-h-[56px]">{cert.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{cert.description}</p>
                      <button
                        onClick={() => handleApply(cert.name)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                      >
                        Apply Now
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* My Certificates */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">My Certificate Applications</h2>

              {/* Filters and Search */}
              <div className="bg-white rounded-xl p-4 mb-6 shadow-md border border-gray-200">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* From Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">From Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* To Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">To Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Certificate ID</th>
                        <th className="px-6 py-4 text-left font-semibold">Certificate Type</th>
                        <th className="px-6 py-4 text-left font-semibold">Applicant Name</th>
                        <th className="px-6 py-4 text-left font-semibold">Applied Date</th>
                        <th className="px-6 py-4 text-left font-semibold">Status</th>
                        <th className="px-6 py-4 text-left font-semibold">Action</th>
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
                            <td className="px-6 py-4 font-semibold text-blue-600">{cert.certificateId}</td>
                            <td className="px-6 py-4 text-gray-800">{cert.type}</td>
                            <td className="px-6 py-4 text-gray-800">{cert.applicantName}</td>
                            <td className="px-6 py-4 text-gray-600">{new Date(cert.appliedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td className="px-6 py-4">{getStatusBadge(cert.status)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewCertificate(cert)}
                                  className="inline-flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View</span>
                                </button>

                                {cert.status === 'approved' && (
                                  <button
                                    onClick={() => handleDownloadCertificate(cert)}
                                    className="inline-flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                                  >
                                    <Download className="h-4 w-4" />
                                    <span>Download</span>
                                  </button>
                                )}

                                {cert.status === 'pending' && (
                                  <span className="inline-flex items-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-semibold">
                                    <Clock className="h-4 w-4" />
                                    <span>Under Process</span>
                                  </span>
                                )}

                                {cert.status === 'rejected' && (
                                  <>
                                    <button
                                      onClick={() => handleShowReason(cert)}
                                      className="inline-flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                                    >
                                      <XCircle className="h-4 w-4" />
                                      <span>Reason</span>
                                    </button>
                                    <button
                                      onClick={() => handleApply(cert.type)}
                                      className="inline-flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                      <span>Reapply</span>
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => handleDeleteCertificate(cert._id)}
                                  className="inline-flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </button>
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
                              className={'min-w-[40px] h-10 rounded-lg font-semibold transition-all ' + (page === currentPage ? 'bg-green-600 text-white shadow-lg' : page === '...' ? 'bg-transparent text-gray-400 cursor-default' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300')}
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
          </>
        ) : (
          /* Dynamic Application Form */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Apply for {formData.certificateType}</h2>
                <p className="text-gray-600">Fill in the details below to submit your application</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Certificate Type Selection */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">Select Certificate Type</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Certificate Type <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.certificateType}
                      onChange={(e) => setFormData({ ...formData, certificateType: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    >
                      <option value="">Select Certificate Type</option>
                      <option value="Income Certificate">Income Certificate</option>
                      <option value="Caste Certificate">Caste Certificate</option>
                      <option value="Residential Certificate">Residential Certificate</option>
                      <option value="Birth Certificate">Birth Certificate</option>
                      <option value="Death Certificate">Death Certificate</option>
                    </select>
                  </div>
                </div>

                {/* Section 1: Basic Information */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter your full name"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Father's Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        required
                        placeholder="Enter father's name"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Gender <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Address <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                        rows={2}
                        placeholder="Enter complete address with village, district, state, pincode"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Certificate Specific Details */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">Certificate Specific Details</h3>

                  {/* Income Certificate Fields */}
                  {formData.certificateType === 'Income Certificate' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Annual Income <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.annualIncome || ''}
                          onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                          required
                          placeholder="e.g., ₹2,50,000"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Occupation <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.occupation || ''}
                          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                          required
                          placeholder="e.g., Farmer, Teacher, Business"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Birth Certificate Fields */}
                  {formData.certificateType === 'Birth Certificate' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Place of Birth <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.placeOfBirth || ''}
                          onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                          required
                          placeholder="City/Village name"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Birth Location <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={formData.birthLocation || ''}
                          onChange={(e) => setFormData({ ...formData, birthLocation: e.target.value })}
                          required
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        >
                          <option value="">Select Location</option>
                          <option value="hospital">Hospital</option>
                          <option value="home">Home</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Death Certificate Fields */}
                  {formData.certificateType === 'Death Certificate' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Deceased Person's Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.deceasedName || ''}
                          onChange={(e) => setFormData({ ...formData, deceasedName: e.target.value })}
                          required
                          placeholder="Enter deceased person's full name"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Date of Death <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.dateOfDeath || ''}
                          onChange={(e) => setFormData({ ...formData, dateOfDeath: e.target.value })}
                          required
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cause of Death <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          value={formData.causeOfDeath || ''}
                          onChange={(e) => setFormData({ ...formData, causeOfDeath: e.target.value })}
                          required
                          rows={2}
                          placeholder="Briefly describe the cause of death"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Caste Certificate Fields */}
                  {formData.certificateType === 'Caste Certificate' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Caste Category <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={formData.casteCategory || ''}
                          onChange={(e) => setFormData({ ...formData, casteCategory: e.target.value })}
                          required
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        >
                          <option value="">Select Category</option>
                          <option value="SC">SC (Scheduled Caste)</option>
                          <option value="ST">ST (Scheduled Tribe)</option>
                          <option value="OBC">OBC (Other Backward Class)</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Residential Certificate Fields */}
                  {formData.certificateType === 'Residential Certificate' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Years of Residence <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.yearsOfResidence || ''}
                          onChange={(e) => setFormData({ ...formData, yearsOfResidence: e.target.value })}
                          required
                          placeholder="Number of years living here"
                          min="0"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Documents */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">Document Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Aadhaar Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.aadhaarNumber}
                        onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                        required
                        maxLength={12}
                        placeholder="12-digit Aadhaar number"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        PAN Number <span className="text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.panNumber || ''}
                        onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                        maxLength={10}
                        placeholder="10-character PAN number"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Purpose */}
                <div className="pb-4">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">Purpose</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Purpose of Certificate <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      required
                      rows={2}
                      placeholder="Please specify the purpose for which you need this certificate (e.g., school admission, scholarship, employment, etc.)"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    Submit Application
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        name: '',
                        fatherName: '',
                        dateOfBirth: '',
                        gender: '',
                        phoneNumber: '',
                        address: '',
                        certificateType: '',
                        aadhaarNumber: '',
                        purpose: '',
                      });
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* View Certificate Modal */}
      {showViewModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Certificate Details</h2>
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
                    <p className="text-sm text-gray-600 font-semibold mb-1">Applied Date</p>
                    <p className="text-gray-800">{new Date(selectedCertificate.appliedDate).toLocaleDateString('en-IN')}</p>
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
                  {selectedCertificate.panNumber && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">PAN Number</p>
                      <p className="text-gray-800 font-mono">{selectedCertificate.panNumber}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Purpose of Certificate</p>
                    <p className="text-gray-800">{selectedCertificate.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleTrackStatus(selectedCertificate);
                  }}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold"
                >
                  Track Status
                </button>
                {selectedCertificate.status === 'approved' && (
                  <button
                    onClick={() => handleDownloadCertificate(selectedCertificate)}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Certificate</span>
                  </button>
                )}
                {selectedCertificate.status === 'rejected' && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleShowReason(selectedCertificate);
                    }}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
                  >
                    View Rejection Reason
                  </button>
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

      {/* Track Status Modal */}
      {showTrackModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Track Application Status</h2>
                    <p className="text-white/80 text-sm">Application ID: {selectedCertificate.certificateId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTrackModal(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Horizontal Progress Tracker */}
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className={'h-full transition-all duration-500 ' + (selectedCertificate.status === 'pending' ? 'bg-yellow-500 w-1/3' : selectedCertificate.status === 'approved' ? 'bg-green-500 w-full' : 'bg-red-500 w-2/3')}
                  ></div>
                </div>

                {/* Status Steps */}
                <div className="relative flex justify-between">
                  {/* Step 1: Application Submitted */}
                  <div className="flex flex-col items-center">
                    <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-3">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-1">Application Submitted</p>
                    <p className="text-xs text-gray-500">{new Date(selectedCertificate.appliedDate).toLocaleDateString('en-IN')}</p>
                  </div>

                  {/* Step 2: Under Review */}
                  <div className="flex flex-col items-center">
                    <div className={'w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-3 ' + (selectedCertificate.status === 'pending' ? 'bg-yellow-500 text-white' : selectedCertificate.status === 'approved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}>
                      {selectedCertificate.status === 'pending' ? <Clock className="h-8 w-8" /> : selectedCertificate.status === 'approved' ? <CheckCircle className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-1">
                      {selectedCertificate.status === 'pending' ? 'Under Review' : selectedCertificate.status === 'approved' ? 'Reviewed' : 'Rejected'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedCertificate.status === 'pending' ? 'Processing...' : 'Completed'}
                    </p>
                  </div>

                  {/* Step 3: Completed */}
                  <div className="flex flex-col items-center">
                    <div className={'w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-3 ' + (selectedCertificate.status === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400')}>
                      <Award className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-1">
                      {selectedCertificate.status === 'approved' ? 'Certificate Issued' : 'Pending Approval'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedCertificate.status === 'approved' ? 'Download Available' : 'Waiting'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Current Status</h3>
                {selectedCertificate.status === 'pending' && (
                  <p className="text-gray-700">
                    Your application is currently under review by our team. You will be notified once the verification process is complete.
                  </p>
                )}
                {selectedCertificate.status === 'approved' && (
                  <p className="text-green-700 font-semibold">
                    Congratulations! Your certificate has been approved and is ready for download. You can download it from the actions menu.
                  </p>
                )}
                {selectedCertificate.status === 'rejected' && (
                  <div>
                    <p className="text-red-700 font-semibold mb-2">
                      Unfortunately, your application has been rejected.
                    </p>
                    {selectedCertificate.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Reason:</p>
                        <p className="text-gray-800">{selectedCertificate.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowTrackModal(false)}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
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

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    handleApply(selectedCertificate.type);
                  }}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold"
                >
                  Reapply
                </button>
                <button
                  onClick={() => setShowReasonModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
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