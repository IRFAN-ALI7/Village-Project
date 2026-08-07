import { useState, useEffect, useRef } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import  UserSidebar  from './UserSidebar';
import axios from "axios";
import API_URL from "../../config/api";


export default function DashboardNavbar({ pageTitle = 'Smart Village Portal' }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

 const [notifications, setNotifications] = useState([]);
 const [user, setUser] = useState(null);
 const unreadCount = notifications.filter(n => !n.isRead).length;

 const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API_URL}/activity/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setNotifications(res.data.activities);

  } catch (error) {
    console.log(error.response?.data?.message || error.message);
  }
};
const fetchUser = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setUser(res.data);
  } catch (error) {
    console.log(error.response?.data?.message || error.message);
  }
};

const markNotificationAsRead = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await axios.patch(
      `${API_URL}/activity/read/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setNotifications((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, isRead: true }
          : item
      )
    );

  } catch (error) {
    console.log(error.response?.data?.message || error.message);
  }
};

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
  fetchNotifications();
  fetchUser();
}, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-r from-green-600 to-blue-600 shadow-lg z-50">
        <div className="h-full px-4 md:px-8 flex items-center justify-between">

          {/* Left: Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
          >
            <Menu className="h-6 w-6 text-white" />
          </button>

          {/* Center: Title */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-white text-xl md:text-2xl font-bold whitespace-nowrap">
              {pageTitle}
            </h1>
          </div>

          {/* Right: Bell + Avatar */}
          <div className="flex items-center space-x-4">

            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm relative"
              >
                <Bell className="h-6 w-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4">
                    <h3 className="font-bold text-lg">Notifications</h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                  {notifications.slice(0, 5).map((n) => (
                         <div
                     key={n._id}
                      onClick={async () => {
                      await markNotificationAsRead(n._id);
                      setShowNotifications(false);
                       navigate(n.route);
                       }}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                         !n.isRead ? "bg-blue-50" : ""
                            }`}
                            >
                          <p
                 className={`text-sm ${
                   !n.isRead
                     ? "font-semibold text-gray-800"
                     : "text-gray-600"
                }`}
                 >
                  {n.title}
                 </p>

              <p className="text-xs text-gray-500 mt-1">
                {n.description}
               </p>

               <p className="text-xs text-gray-400 mt-2">
                 {new Date(n.createdAt).toLocaleString()}
               </p>
              </div>
                      ))}
                  </div>
                  <div className="p-3 text-center border-t">
                    <button
                      onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                      className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

{/* Avatar only — no dropdown */}
<div className="h-10 w-10 rounded-full overflow-hidden shadow-lg bg-gray-200">
  {user?.profileImage ? (
    <img
      src={user.profileImage}
      alt={user.name || "User"}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="h-full w-full flex items-center justify-center text-gray-600 font-bold">
      {user?.name?.charAt(0)?.toUpperCase() || "U"}
    </div>
  )}
</div>

          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      {/* Sidebar — available on every page */}
      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
