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
      setNewNotice({
       title: '',
        category: 'general',
        date: null,
        time: '',
        location: '',
        description: '',
        fullDetails: '',
        isPinned: false,
           });
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
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex-1">Notices Management</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl hover:shadow-lg transition-all font-semibold text-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
            <span>Create New Notice</span>
          </button>
        </div>

        {/* ── Notice Cards ── */}
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Megaphone className="h-5 w-5 text-orange-600 shrink-0" />
                    <h3 className="font-bold text-base md:text-lg text-gray-800 leading-tight">{notice.title}</h3>
                    {notice.isPinned && <Pin className="h-4 w-4 text-red-600 fill-red-600 shrink-0" />}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {getTypeBadge(notice.category)}
                    <span className="text-xs text-gray-500">Posted: {new Date(notice.date).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{notice.description}</p>
                </div>

                {/* Action buttons — row on mobile, column on sm */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => { setSelectedNotice(notice); setShowEditModal(true); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sm:hidden">Edit</span>
                  </button>
                  <button
                   onClick={() => { 
                    setDeleteNoticeId(notice._id); 
                    setShowDeleteModal(true); 
                     }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sm:hidden">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-5 py-4 rounded-t-2xl sticky top-0 flex items-center justify-between">
              <h2 className="text-lg md:text-2xl font-bold">Create New Notice</h2>
              <button onClick={() => setShowCreateModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notice Title <span className="text-red-600">*</span></label>
                <input type="text" value={newNotice.title} onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })} placeholder="Enter notice title" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notice Type <span className="text-red-600">*</span></label>
                  <select value={newNotice.category} onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="general">General</option>
                    <option value="urgent">Urgent</option>
                    <option value="meeting">Meeting</option>
                    <option value="scheme">Scheme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notice Date <span className="text-red-600">*</span></label>
                  <input type="date" value={newNotice.date} onChange={(e) => setNewNotice({ ...newNotice, date: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Description <span className="text-red-600">*</span></label>
                <textarea value={newNotice.description} onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })} placeholder="Enter short description" rows={2} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Details</label>
                <textarea value={newNotice.fullDetails} onChange={(e) => setNewNotice({ ...newNotice, fullDetails: e.target.value })} placeholder="Enter full notice details" rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={newNotice.isPinned} onChange={(e) => setNewNotice({ ...newNotice, isPinned: e.target.checked })} className="h-4 w-4 text-green-600 rounded" />
                <span className="text-sm font-semibold text-gray-700">Pin this notice (show at top)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={handleCreateNotice} className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl hover:shadow-lg font-semibold text-sm">Create Notice</button>
                <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-semibold text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && selectedNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-4 rounded-t-2xl sticky top-0 flex items-center justify-between">
              <h2 className="text-lg md:text-2xl font-bold">Edit Notice</h2>
              <button onClick={() => setShowEditModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notice Title</label>
                <input type="text" value={selectedNotice.title} onChange={(e) => setSelectedNotice({ ...selectedNotice, title: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notice Type</label>
                  <select value={selectedNotice.category} onChange={(e) => setSelectedNotice({ ...selectedNotice, category: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="general">General</option>
                    <option value="urgent">Urgent</option>
                    <option value="meeting">Meeting</option>
                    <option value="scheme">Scheme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notice Date</label>
                  <input type="date" value={selectedNotice.date} onChange={(e) => setSelectedNotice({ ...selectedNotice, date: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Description</label>
                <textarea value={selectedNotice.description} onChange={(e) => setSelectedNotice({ ...selectedNotice, description: e.target.value })} rows={2} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Details</label>
                <textarea value={selectedNotice.fullDetails} onChange={(e) => setSelectedNotice({ ...selectedNotice, fullDetails: e.target.value })} rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={selectedNotice.isPinned} onChange={(e) => setSelectedNotice({ ...selectedNotice, isPinned: e.target.checked })} className="h-4 w-4 text-blue-600 rounded" />
                <span className="text-sm font-semibold text-gray-700">Pin this notice</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdateNotice} className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold text-sm">Update Notice</button>
                <button onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-semibold text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-lg md:text-2xl font-bold">Confirm Delete</h2>
              <button onClick={() => setShowDeleteModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-5 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-800 font-semibold text-sm">Are you sure you want to delete this notice? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleDeleteConfirm} className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 font-semibold text-sm">Yes, Delete</button>
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-semibold text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
