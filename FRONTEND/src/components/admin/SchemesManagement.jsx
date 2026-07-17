import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Gift, X, Edit, ChevronLeft, ChevronRight, Search, Calendar, Link as LinkIcon, Users, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';

export default function SchemesManagement() {
  const [schemes, setSchemes] = useState([]);
    
   useEffect(()=> {
    fetchSchemes();
   }, []);

   const fetchSchemes = async()=> {
    try{
      const res = await fetch(`${API_URL}/schemes/all`, {
        method: 'GET', 
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await res.json();
      setSchemes(data.data);
    }catch(err){
      console.log(err);
    }
   };


  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Filters and Search
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [newScheme, setNewScheme] = useState({
    name: '',
    category: '',
    status: 'active',
    officialLink: '',
    image: '',
    startDate: '',
    endDate: '',
    description: '',
    eligibility: '',
    documents: '',
  });

  // Filter and search logic
  const filteredSchemes = schemes.filter((scheme) => {
    if (filterCategory !== 'all' && scheme.category !== filterCategory) return false;
    if (filterStatus !== 'all' && scheme.status !== filterStatus) return false;
    if (startDateFilter && scheme.startDate && new Date(scheme.startDate) < new Date(startDateFilter)) return false;
    if (endDateFilter && scheme.startDate && new Date(scheme.startDate) > new Date(endDateFilter)) return false;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!scheme._id.toLowerCase().includes(search) && !scheme.name.toLowerCase().includes(search)) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSchemes = filteredSchemes.slice(startIndex, endIndex);

  const statusCounts = {
    total: schemes.length,
    active: schemes.filter(s => s.status === 'active').length,
    inactive: schemes.filter(s => s.status === 'inactive').length,
  };

  const handleAddScheme = async() => {
    if (!newScheme.name || !newScheme.category || !newScheme.officialLink || !newScheme.description || !newScheme.eligibility || !newScheme.documents) {
      alert('Please fill all required fields!');
      return;
    }

   const formData = new FormData();
   formData.append('name', newScheme.name);
    formData.append('category', newScheme.category);
    formData.append('status', newScheme.status);
    formData.append('officialLink', newScheme.officialLink);
    if(newScheme.image instanceof File){
      formData.append('image', newScheme.image);
    }
  if(newScheme.startDate){
    formData.append('startDate', newScheme.startDate);
  }
  if(newScheme.endDate){
    formData.append('endDate', newScheme.endDate);
  }
    formData.append('description', newScheme.description);
    formData.append('eligibility', newScheme.eligibility);
    formData.append('documents', newScheme.documents);

    try{
    const res = await fetch(`${API_URL}/schemes/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData
    });
    const data = await res.json();
    console.log(data);

    if(res.ok) {
      setSchemes([...schemes, data.scheme]);
      setShowAddModal(false);
      setNewScheme({
      name: '',
      category: '',
      status: 'active',
      officialLink: '',
      image: '',
      startDate: '',
      endDate: '',
      description: '',
      eligibility: '',
      documents: '',
    });
    toast.success(data.message || "Scheme added");
  } else {   
     toast.error(data.message || "Failed to add scheme");
  }
}catch(error) {
  console.error("Error adding scheme:", error);
  toast.error("An error occurred while adding the scheme. Please try again.");
}
  };

  const handleEditScheme = async() => {
    if (!selectedScheme) return;
    const formData = new FormData();
    formData.append('name', selectedScheme.name);
    formData.append('category', selectedScheme.category);
    formData.append('status', selectedScheme.status);
    formData.append('officialLink', selectedScheme.officialLink);
    if(selectedScheme.image instanceof File){
      formData.append('image', selectedScheme.image);
    }
  if(selectedScheme.startDate){
    formData.append('startDate', selectedScheme.startDate);
  }
  if(selectedScheme.endDate){
    formData.append('endDate', selectedScheme.endDate);
  }
    formData.append('description', selectedScheme.description);
    formData.append('eligibility', selectedScheme.eligibility);
    formData.append('documents', selectedScheme.documents);

    try{
    const res = await fetch(`${API_URL}/schemes/update/${selectedScheme._id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData
    });
    const data = await res.json();

    if(res.ok) {
      setSchemes(schemes.map(s => s._id === selectedScheme._id ? selectedScheme : s));
      setShowEditModal(false);
      setSelectedScheme(null);
     toast.success(data.message);
    } else {
      toast.error(data.message || "Failed to update scheme");
    }
  } catch(error) {
    console.error("Error updating scheme:", error);
    toast.error("An error occurred while updating the scheme. Please try again.");
  }
  };

  const handleDeleteScheme = async(schemeId) => {
   const confirmDelete = window.confirm("Are you sure you want to delete this scheme?");
   if(!confirmDelete) return;
    try{
      const res = await fetch(`${API_URL}/schemes/delete/${schemeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      const data = await res.json();

      if(res.ok) {
        setSchemes(schemes.filter(s => s._id !== schemeId));
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to delete scheme");
      }
    } catch(error) {
      console.error("Error deleting scheme:", error);
      toast.error("An error occurred while deleting the scheme. Please try again.");
    }
  };

  const handleViewScheme = (scheme) => {
    setSelectedScheme(scheme);
    setShowViewModal(true);
  };

  const handleEditClick = (scheme) => {
    setSelectedScheme({...scheme});
    setShowEditModal(true);
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>;
    else if (status === 'inactive') return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Inactive</span>;
    return null;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
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
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Schemes Management</h2>
            <p className="text-gray-600 text-sm mt-1">Manage government schemes and programs</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Scheme</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.total}</p>
                <p className="text-sm text-gray-600">Total Schemes</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Gift className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.active}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.inactive}</p>
                <p className="text-sm text-gray-600">Inactive</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Categories</option>
                <option value="Housing">Housing</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Social Welfare">Social Welfare</option>
                <option value="Employment">Employment</option>
                <option value="Women Empowerment">Women Empowerment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Start Date From</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => { setStartDateFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Start Date To</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => { setEndDateFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Search by Name or ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Search..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Scheme Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Official Link</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentSchemes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No schemes found matching your filters</td>
                  </tr>
                ) : (
                  currentSchemes.map((scheme) => (
                    <tr key={scheme._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{scheme.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{scheme.category}</td>
                      <td className="px-6 py-4">{getStatusBadge(scheme.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {scheme.startDate ? new Date(scheme.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={scheme.officialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <LinkIcon className="h-4 w-4" />
                          <span>Visit</span>
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewScheme(scheme)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-semibold transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditClick(scheme)}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs font-semibold transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteScheme(scheme._id)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-semibold transition-colors"
                          >
                            Delete
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
          {filteredSchemes.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(endIndex, filteredSchemes.length)}</span> out of{' '}
                  <span className="font-semibold">{filteredSchemes.length}</span> results
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

      {/* Add New Scheme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Add New Scheme</h2>
                <button onClick={() => setShowAddModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Scheme Name <span className="text-red-600">*</span></label>
                  <input type="text" value={newScheme.name} onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })} placeholder="Enter scheme name" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category <span className="text-red-600">*</span></label>
                  <select value={newScheme.category} onChange={(e) => setNewScheme({ ...newScheme, category: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="">Select Category</option>
                    <option value="Housing">Housing</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Social Welfare">Social Welfare</option>
                    <option value="Employment">Employment</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status <span className="text-red-600">*</span></label>
                  <select value={newScheme.status} onChange={(e) => setNewScheme({ ...newScheme, status: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Official Link <span className="text-red-600">*</span></label>
                  <input type="url" value={newScheme.officialLink} onChange={(e) => setNewScheme({ ...newScheme, officialLink: e.target.value })} placeholder="https://example.gov.in" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Scheme Image <span className="text-gray-500 text-xs">(Optional)</span></label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setNewScheme({
                         ...newScheme, image: file 
                        });
                      }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {newScheme.image && (
                    <div className="mt-2">
                      <img src={newScheme.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date <span className="text-gray-500 text-xs">(Optional)</span></label>
                  <input type="date" value={newScheme.startDate} onChange={(e) => setNewScheme({ ...newScheme, startDate: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date <span className="text-gray-500 text-xs">(Optional)</span></label>
                  <input type="date" value={newScheme.endDate} onChange={(e) => setNewScheme({ ...newScheme, endDate: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea value={newScheme.description} onChange={(e) => setNewScheme({ ...newScheme, description: e.target.value })} placeholder="Enter scheme description" rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Eligibility Criteria</label>
                <textarea value={newScheme.eligibility} onChange={(e) => setNewScheme({ ...newScheme, eligibility: e.target.value })} placeholder="Enter eligibility criteria" rows={2} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Required Documents</label>
                <textarea value={newScheme.documents} onChange={(e) => setNewScheme({ ...newScheme, documents: e.target.value })} placeholder="Enter required documents" rows={2} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button onClick={handleAddScheme} className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all font-semibold">Add Scheme</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Scheme Modal */}
      {showEditModal && selectedScheme && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Edit Scheme</h2>
                <button onClick={() => setShowEditModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Scheme Name <span className="text-red-600">*</span></label>
                  <input type="text" value={selectedScheme.name} onChange={(e) => setSelectedScheme({ ...selectedScheme, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category <span className="text-red-600">*</span></label>
                  <select value={selectedScheme.category} onChange={(e) => setSelectedScheme({ ...selectedScheme, category: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="Housing">Housing</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Social Welfare">Social Welfare</option>
                    <option value="Employment">Employment</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status <span className="text-red-600">*</span></label>
                  <select value={selectedScheme.status} onChange={(e) => setSelectedScheme({ ...selectedScheme, status: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Official Link <span className="text-red-600">*</span></label>
                  <input type="url" value={selectedScheme.officialLink} onChange={(e) => setSelectedScheme({ ...selectedScheme, officialLink: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Scheme Image <span className="text-gray-500 text-xs">(Optional)</span></label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSelectedScheme({ ...selectedScheme, image: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {selectedScheme.image && (
                    <div className="mt-2">
                      <img src={selectedScheme.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date <span className="text-gray-500 text-xs">(Optional)</span></label>
                  <input type="date" value={selectedScheme.startDate || ''} onChange={(e) => setSelectedScheme({ ...selectedScheme, startDate: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date <span className="text-gray-500 text-xs">(Optional)</span></label>
                  <input type="date" value={selectedScheme.endDate || ''} onChange={(e) => setSelectedScheme({ ...selectedScheme, endDate: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea value={selectedScheme.description || ''} onChange={(e) => setSelectedScheme({ ...selectedScheme, description: e.target.value })} rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Eligibility Criteria</label>
                <textarea value={selectedScheme.eligibility || ''} onChange={(e) => setSelectedScheme({ ...selectedScheme, eligibility: e.target.value })} rows={2} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Required Documents</label>
                <textarea value={selectedScheme.documents || ''} onChange={(e) => setSelectedScheme({ ...selectedScheme, documents: e.target.value })} rows={2} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button onClick={handleEditScheme} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all font-semibold">Update Scheme</button>
                <button onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Scheme Modal */}
      {showViewModal && selectedScheme && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Gift className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedScheme.name}</h2>
                  </div>
                </div>
                <button onClick={() => setShowViewModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Category</p>
                    <p className="text-gray-800 font-bold">{selectedScheme.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Status</p>
                    {getStatusBadge(selectedScheme.status)}
                  </div>
                  {selectedScheme.startDate && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">Start Date</p>
                      <p className="text-gray-800">{new Date(selectedScheme.startDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  )}
                  {selectedScheme.endDate && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">End Date</p>
                      <p className="text-gray-800">{new Date(selectedScheme.endDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Official Link</p>
                    <a href={selectedScheme.officialLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium break-all">{selectedScheme.officialLink}</a>
                  </div>
                </div>
              </div>
              {selectedScheme.description && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedScheme.description}</p>
                </div>
              )}
              {selectedScheme.eligibility && (
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Eligibility Criteria</h3>
                  <p className="text-gray-700">{selectedScheme.eligibility}</p>
                </div>
              )}
              {selectedScheme.documents && (
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Required Documents</h3>
                  <p className="text-gray-700">{selectedScheme.documents}</p>
                </div>
              )}
              <div className="flex space-x-3 pt-4">
                <button onClick={() => setShowViewModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
