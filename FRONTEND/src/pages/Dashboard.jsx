import { useEffect, useState } from 'react';
import  UserSidebar  from '../components/dashboard/UserSidebar';
import  DashboardFooter  from '../components/dashboard/DashboardFooter';
import { FileText, ClipboardList, Gift, TrendingUp, Users, Bell, Megaphone, Menu, PhoneCall, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [user, setUser] = useState();
  const [dashboard, setDashboard] = useState({
  totalComplaints: 0,
  resolvedComplaints: 0,
  myComplaints: 0,
  activeSchemes: 0,
  totalNotices: 0,
  registeredUsers: 0,
});

     useEffect(()=> {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/user/me`,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data=> {
        setUser(data);
    });
  },[]);

  const fetchDashboardData = async()=> {
    const token = localStorage.getItem("token");

    try {

      const res = await fetch(`${API_URL}/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      const data = await res.json();
      if(res.ok){
        setDashboard(data);
      }else {
        console.log(data.message);
      }
    }catch(error){
      console.log(error);
    }
  }

  useEffect(()=> {
    fetchDashboardData();
  }, []);

  const notifications = [
    { id: 1, title: 'New Scheme Available', message: 'PM-KISAN Yojana registration is now open', time: '2 hours ago', unread: true },
    { id: 2, title: 'Complaint Update', message: 'Your complaint #1234 has been resolved', time: '5 hours ago', unread: true },
    { id: 3, title: 'Village Meeting', message: 'Community meeting scheduled for tomorrow', time: '1 day ago', unread: false },
    { id: 4, title: 'New Notice', message: 'Water supply maintenance notice', time: '2 days ago', unread: false },
  ];

  const stats = [
    {
      id: 1,
      title: 'File a Complaint',
      description: 'Submit your grievances and issues to the authorities',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      count: 'Register Now',
      path: '/complaint',
    },
    {
      id: 2,
      title: 'My Complaints',
      description: 'Track status of your submitted complaints',
      icon: ClipboardList,
      color: 'from-orange-500 to-orange-600',
      count: `${dashboard.myComplaints} Active`,
      path: '/my-complaints',
    },
    {
      id: 3,
      title: 'Government Schemes',
      description: 'Explore and apply for government welfare schemes',
      icon: Gift,
      color: 'from-green-500 to-green-600',
      count: `${dashboard.activeSchemes} Available`,
      path: '/schemes',
    },
    {
      id: 4,
      title: 'Notice Board',
      description: 'View latest announcements and village notices',
      icon: Megaphone,
      color: 'from-red-500 to-red-600',
      count: `${dashboard.totalNotices} New`,
      path: '/notices',
    },
  ];

  const recentActivity = [
    { id: 1, title: 'New Scheme: PM-KISAN Yojana', time: '2 hours ago', icon: Gift, description: 'PM-KISAN Yojana registration is now open for all eligible farmers. Apply now to receive financial assistance.', type: 'scheme' },
    { id: 2, title: 'Complaint #1234 resolved', time: '5 hours ago', icon: ClipboardList, description: 'Your complaint regarding street light repair has been successfully resolved by the authorities.', type: 'complaint' },
    { id: 3, title: 'Community meeting scheduled', time: '1 day ago', icon: Users, description: 'Village community meeting scheduled for tomorrow at 5 PM at the Panchayat office.', type: 'meeting' },
  ];

  // Complete activity history for "View All" modal
  const allActivities = [
    { id: 1, title: 'New Scheme: PM-KISAN Yojana', time: '2 hours ago', icon: Gift, description: 'PM-KISAN Yojana registration is now open for all eligible farmers. Apply now to receive financial assistance.', type: 'scheme', status: 'new' },
    { id: 2, title: 'Complaint #1234 resolved', time: '5 hours ago', icon: ClipboardList, description: 'Your complaint regarding street light repair has been successfully resolved by the authorities.', type: 'complaint', status: 'completed' },
    { id: 3, title: 'Community meeting scheduled', time: '1 day ago', icon: Users, description: 'Village community meeting scheduled for tomorrow at 5 PM at the Panchayat office.', type: 'meeting', status: 'upcoming' },
    { id: 4, title: 'Certificate application approved', time: '1 day ago', icon: FileText, description: 'Your income certificate application has been approved and is ready for download.', type: 'certificate', status: 'completed' },
    { id: 5, title: 'New Notice: Water Supply', time: '2 days ago', icon: Megaphone, description: 'Water supply will be interrupted tomorrow from 10 AM to 2 PM for maintenance work.', type: 'notice', status: 'important' },
    { id: 6, title: 'Scheme application submitted', time: '3 days ago', icon: Gift, description: 'Your application for Pradhan Mantri Awas Yojana has been submitted successfully.', type: 'scheme', status: 'pending' },
    { id: 7, title: 'Complaint #1230 in progress', time: '3 days ago', icon: ClipboardList, description: 'Your complaint about road repair is currently being reviewed by the department.', type: 'complaint', status: 'in-progress' },
    { id: 8, title: 'Village fair announcement', time: '4 days ago', icon: Users, description: 'Annual village fair will be organized next week. All villagers are invited to participate.', type: 'event', status: 'upcoming' },
    { id: 9, title: 'Tax payment reminder', time: '5 days ago', icon: TrendingUp, description: 'Reminder: Property tax payment deadline is approaching. Please clear your dues.', type: 'reminder', status: 'important' },
    { id: 10, title: 'New development project', time: '1 week ago', icon: Users, description: 'New road development project approved for the village. Work will begin next month.', type: 'development', status: 'new' },
  ];

  const quickStats = [
  {
    label: "Total Complaints",
    value: dashboard.totalComplaints,
    trend: "+12%",
    icon: TrendingUp,
  },
  {
    label: "Resolved",
    value: dashboard.resolvedComplaints,
    trend: "+8%",
    icon: ClipboardList,
  },
  {
    label: "Active Schemes",
    value: dashboard.activeSchemes,
    trend: "New",
    icon: Gift,
  },
];

  const handleContactHelp = () => {
    alert('📞 Village Helpline:\n\nPhone: 1800-XXX-XXXX\nEmail: help@smartvillage.gov.in\nTimings: 9:00 AM - 6:00 PM (Mon-Sat)\n\nYou can also visit our office at Village Panchayat Office during working hours.');
  };

  const handleActivityClick = (activity) => {
    alert(`📋 ${activity.title}\n\n${activity.description}\n\n⏰ ${activity.time}`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'new': { color: 'bg-green-100 text-green-700', text: 'New' },
      'completed': { color: 'bg-blue-100 text-blue-700', text: 'Completed' },
      'upcoming': { color: 'bg-purple-100 text-purple-700', text: 'Upcoming' },
      'pending': { color: 'bg-yellow-100 text-yellow-700', text: 'Pending' },
      'in-progress': { color: 'bg-orange-100 text-orange-700', text: 'In Progress' },
      'important': { color: 'bg-red-100 text-red-700', text: 'Important' },
    };
    return badges[status] || { color: 'bg-gray-100 text-gray-700', text: status };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      {/* Top Navbar with Hamburger */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                User Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="h-6 w-6 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="hidden md:flex items-center space-x-3 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  RK
                </div>
                <span className="font-semibold text-gray-800">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <UserSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 mb-8 shadow-xl border border-white/50 text-center" >
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome, <span className="text-green-600">{user?.name}</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Here's what's happening in your village today
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                      <p className="text-sm text-green-600 font-semibold mt-1">{stat.trend}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-blue-500 p-4 rounded-xl">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.id}
                  onClick={() => navigate(stat.path)}
                  className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                    <div className="flex justify-between items-start mb-4">
                      <Icon className="h-10 w-10" />
                      <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        <span className="text-xs font-semibold">{stat.count}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{stat.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 text-sm mb-4">{stat.description}</p>
                    <button className={`w-full bg-gradient-to-r ${stat.color} text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg text-sm`}>
                      Open
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
              <button 
                onClick={() => setShowAllActivities(true)}
                className="text-green-600 font-semibold hover:text-green-700 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    onClick={() => handleActivityClick(activity)}
                    className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-all cursor-pointer border border-white/30"
                  >
                    <div className="bg-gradient-to-br from-green-100 to-blue-100 p-3 rounded-lg">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.time}</p>
                    </div>
                    <Bell className="h-5 w-5 text-gray-400" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-4">Village Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <span>Total Households</span>
                  <span className="font-bold text-2xl">456</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <span>Registered Users</span>
                  <span className="font-bold text-2xl">{dashboard.registeredUsers}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <span>Active Schemes</span>
                  <span className="font-bold text-2xl">{dashboard.activeSchemes}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/certificates')}
                  className="w-full bg-white/20 backdrop-blur-sm py-3 px-4 rounded-lg hover:bg-white/30 transition-all text-left font-semibold"
                >
                  📋 Apply for Certificate
                </button>
                <button 
                  onClick={() => navigate('/schemes')}
                  className="w-full bg-white/20 backdrop-blur-sm py-3 px-4 rounded-lg hover:bg-white/30 transition-all text-left font-semibold"
                >
                  💰 Check Scheme Eligibility
                </button>
                <button 
                  onClick={handleContactHelp}
                  className="w-full bg-white/20 backdrop-blur-sm py-3 px-4 rounded-lg hover:bg-white/30 transition-all text-left font-semibold"
                >
                  📞 Contact Helpline
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DashboardFooter />

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed top-20 right-4 md:right-8 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-6 w-6" />
              <h3 className="text-lg font-bold">Notifications</h3>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">
                {notifications.filter(n => n.unread).length} New
              </span>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                  notification.unread ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    notification.unread 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`font-semibold text-gray-800 ${
                        notification.unread ? 'font-bold' : ''
                      }`}>
                        {notification.title}
                      </h4>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => {
                setShowNotifications(false);
                navigate('/notices');
              }}
              className="w-full text-center text-green-600 font-semibold hover:text-green-700 transition-colors text-sm"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}

      {/* Notification Overlay */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* All Activities Modal */}
      {showAllActivities && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white p-6 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">All Activities</h2>
                    <p className="text-sm text-white/90">Complete activity history and updates</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllActivities(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                <div className="space-y-4">
                  {allActivities.map((activity) => {
                    const Icon = activity.icon;
                    const badge = getStatusBadge(activity.status);
                    return (
                      <div
                        key={activity.id}
                        onClick={() => handleActivityClick(activity)}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Icon */}
                          <div className="bg-gradient-to-br from-green-100 to-blue-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                            <Icon className="h-6 w-6 text-green-600" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-gray-800 text-lg group-hover:text-green-600 transition-colors">
                                {activity.title}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color} whitespace-nowrap ml-2`}>
                                {badge.text}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                              {activity.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Bell className="h-3.5 w-3.5" />
                                <span>{activity.time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full font-medium">
                                  {activity.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Info */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-gray-700 text-center">
                    📊 Showing <span className="font-bold text-green-600">{allActivities.length}</span> activities • Stay updated with your village activities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}