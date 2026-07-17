import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Home,
  Building2,
  TrendingUp,
  MapPin,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import API_URL from '../../config/api';

export default function DashboardContent() {
  const navigate = useNavigate();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [totalComplaints, setTotalComplaints] = useState(0);

  const [adminName, setAdminName] = useState("");
  useEffect(()=> {
    const name = localStorage.getItem("adminName");
    if(name){
      setAdminName(name);
    }
  },[]);

  const stats = [
    {
      title: 'Total Users',
      value: '1,245',
      change: '+12%',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Villages',
      value: '8',
      change: 'In Panchayat',
      icon: MapPin,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Households',
      value: '3,456',
      change: '+5%',
      icon: Home,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Total Complaints',
      value: '324',
      change: '+8%',
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  const complaintStats = [
    {
      title: 'Pending',
      value: '45',
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'In Progress',
      value: '89',
      icon: AlertCircle,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Resolved',
      value: '178',
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Rejected',
      value: '12',
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

    useEffect(()=> {
    const fetchRecentComplaint = async()=> {
      try{
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/recent-complaints`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if(res.ok){
        console.log(data);
        setRecentComplaints(data.recentComplaints);
        setTotalComplaints(data.total);
      }else{
        console.log(data.message);
      }
    }catch(err){
      console.log(err);
    }
    }
    fetchRecentComplaint();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending' },
      'in-progress': { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'In Progress' },
      resolved: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Resolved' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Rejected' },
    };
    const badge = badges[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
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
      <span className={`px-2 py-0.5 rounded text-xs font-bold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2 text-center">Welcome Back, {adminName}</h2>
        <p className="text-white/90 text-lg text-center">Here's what's happening in Rampur Gram Panchayat today</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-4 rounded-xl`}>
                  <Icon className={`h-8 w-8 ${stat.iconColor}`} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-green-600 font-semibold mt-1">{stat.change}</p>
                </div>
              </div>
              <p className="text-gray-600 font-semibold">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Complaint Statistics */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Complaint Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {complaintStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={`${stat.bgColor} rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <p className="text-gray-600 font-semibold text-sm">{stat.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
          <h3 className="text-2xl font-bold text-white">Recent Complaints</h3>
          <p className="text-white/80 text-sm mt-1">Latest complaints submitted by villagers</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Ward
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
              {recentComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-blue-600">{complaint.complaintId}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">{complaint.userId?.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{complaint.category}</span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <span className="text-sm text-gray-600 line-clamp-1">{complaint.description}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">{complaint.wardNo}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(complaint.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(complaint.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {new Date(complaint.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all font-semibold text-sm flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">Showing {recentComplaints.length} of {totalComplaints} complaints</p>
          <button 
            onClick={() => navigate('/admin/complaints')}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            View All Complaints
          </button>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
          <Building2 className="h-12 w-12 mb-4 opacity-80" />
          <p className="text-4xl font-bold mb-2">12</p>
          <p className="text-white/90 font-semibold">Active Schemes</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <FileText className="h-12 w-12 mb-4 opacity-80" />
          <p className="text-4xl font-bold mb-2">156</p>
          <p className="text-white/90 font-semibold">Certificates Issued</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <TrendingUp className="h-12 w-12 mb-4 opacity-80" />
          <p className="text-4xl font-bold mb-2">94%</p>
          <p className="text-white/90 font-semibold">Resolution Rate</p>
        </div>
      </div>

      {/* View Complaint Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Complaint Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Complaint ID</p>
                  <p className="text-lg font-bold text-blue-600">{selectedComplaint.complaintId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Status</p>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">User Name</p>
                  <p className="font-semibold text-gray-800">{selectedComplaint.userId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Category</p>
                  <p className="font-semibold text-gray-800">{selectedComplaint.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Priority</p>
                  {getPriorityBadge(selectedComplaint.priority)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Ward Number</p>
                  <p className="font-semibold text-gray-800">{selectedComplaint.wardNo}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-2">Description</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedComplaint.description}</p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-all font-semibold">
                  Mark as Resolved
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
    </div>
  );
}