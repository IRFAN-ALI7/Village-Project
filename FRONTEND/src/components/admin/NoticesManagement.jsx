import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Megaphone, Pin, X, AlertTriangle } from 'lucide-react';
import axios from "axios";
import toast from 'react-hot-toast';
import API_URL from '../../config/api';

export default function NoticesManagement() {
  const [notices, setNotices] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [deleteNoticeId, setDeleteNoticeId] = useState(null);

  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'general',
    date: null,
    time: "",
    location: "",
    isPinned: false,
    description: '',
    fullDetails: '',
  });

  const handleCreateNotice = async() => {
    if (!newNotice.title || !newNotice.description || !newNotice.fullDetails || !newNotice.category) {
      toast.error('Please fill all required fields!');
      return;
    }

    try{
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/notices`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${token}`
      },
      body: JSON.stringify(newNotice)
    });
     const data = await res.json();
     if(res.ok){
      toast.success(data.message);
    setShowCreateModal(false);
     }else{
      toast.error(data.message);
     }
    }catch(err){
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchNotices = async()=> {
      try{
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/notices`,  {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setNotices(res.data.notices);
      }catch(err){
        console.log(err);
      }
    }
    fetchNotices();
  }, []);

  const handleEditClick = (notice) => {
    setSelectedNotice(notice);
    setShowEditModal(true);
  };

  const handleUpdateNotice = async() => {
    if (!selectedNotice ||
       !selectedNotice.title || 
       !selectedNotice.description || 
       !selectedNotice.category ||
        !selectedNotice.fullDetails) {
      toast.error('Please fill all required fields!');
      return;
    }

    try{
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/api/notices/${selectedNotice._id}`,
        selectedNotice,
         {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setNotices(notices.map(n => n._id === selectedNotice._id ? res.data.notice : n));
    setShowEditModal(false);
    setSelectedNotice(null);
    alert(res.data.message);
    }catch(err){
      console.log(err);
    }
  };

  const handleDeleteClick = (noticeId) => {
    setDeleteNoticeId(noticeId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async() => {
    if (deleteNoticeId !== null) {
      try{
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/api/notices/${deleteNoticeId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setNotices(notices.filter(n => n._id !== deleteNoticeId));
      setShowDeleteModal(false);
      setDeleteNoticeId(null);
      toast.success('Notice deleted successfully!');
      }catch(err){
        console.log(err);
      }
    }
  };

  const getTypeBadge = (category) => {
    const badges = {
      urgent: 'bg-red-100 text-red-800',
      meeting: 'bg-blue-100 text-blue-800',
      scheme: 'bg-green-100 text-green-800',
      general: 'bg-purple-100 text-purple-800',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${badges[category]}`}>{category?.toUpperCase()}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Notices Management</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Notice</span>
          </button>
        </div>

        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Megaphone className="h-6 w-6 text-orange-600" />
                    <h3 className="font-bold text-lg text-gray-800">{notice.title}</h3>
                    {notice.isPinned && <Pin className="h-5 w-5 text-red-600 fill-red-600" />}
                  </div>
                  <div className="flex items-center space-x-4 mb-3">
                    {getTypeBadge(notice.category)}
                    {notice.date && (
                      <span className="text-sm text-gray-600">
                        Posted: {new Date(notice.date).toLocaleDateString('en-IN')}
                        </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm">{notice.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditClick(notice)}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(notice._id)}
                    className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create New Notice</h2>
                <button onClick={() => setShowCreateModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notice Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="Enter notice title"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notice Type <span className="text-red-600">*</span>
                </label>
                <select
                  value={newNotice.category}
                  onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="general">General</option>
                  <option value="urgent">Urgent</option>
                  <option value="meeting">Meeting</option>
                  <option value="scheme">Scheme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notice Date <span className="text-red-600">(optional)</span>
                </label>
                <input
                  type="date"
                  value={newNotice.date}
                  onChange={(e) => setNewNotice({ ...newNotice, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notice Time <span className="text-red-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newNotice.time}
                  onChange={(e) => setNewNotice({ ...newNotice, time: e.target.value })}
                  placeholder='10:00 AM - 2:00 PM'
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notice Location <span className="text-red-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newNotice.location}
                  onChange={(e) => setNewNotice({ ...newNotice, location: e.target.value })}
                  placeholder="Enter notice location"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={newNotice.description}
                  onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
                  placeholder="Enter short description"
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Details  <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={newNotice.fullDetails}
                  onChange={(e) => setNewNotice({ ...newNotice, fullDetails: e.target.value })}
                  placeholder="Enter full notice details"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={newNotice.isPinned}
                  onChange={(e) => setNewNotice({ ...newNotice, isPinned: e.target.checked })}
                  className="h-4 w-4 text-green-600 rounded"
                />
                <label htmlFor="pinNotice" className="text-sm font-semibold text-gray-700">
                  Pin this notice (show at top)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button onClick={handleCreateNotice} className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg hover:shadow-lg font-semibold">
                  Create Notice
                </button>
                <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notice Modal */}
      {showEditModal && selectedNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Edit Notice</h2>
                <button onClick={() => setShowEditModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notice Title</label>
                <input
                  type="text"
                  value={selectedNotice.title}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notice Type</label>
                <select
                  value={selectedNotice.category}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="urgent">Urgent</option>
                  <option value="meeting">Meeting</option>
                  <option value="scheme">Scheme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notice Date</label>
                <input
                  type="date"
                  value={selectedNotice.date}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notice Time</label>
                <input
                  type="text"
                  value={selectedNotice.time}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, time: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notice Location</label>
                <input
                  type="text"
                  value={selectedNotice.location}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                <textarea
                  value={selectedNotice.description}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Details</label>
                <textarea
                  value={selectedNotice.fullDetails}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, fullDetails: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="editPinNotice"
                  checked={selectedNotice.isPinned}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, isPinned: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="editPinNotice" className="text-sm font-semibold text-gray-700">
                  Pin this notice
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button onClick={handleUpdateNotice} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
                  Update Notice
                </button>
                <button onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">
                  Cancel
                </button>
              </div>
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
                  <p className="text-red-800 font-semibold">Are you sure you want to delete this notice?</p>
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
