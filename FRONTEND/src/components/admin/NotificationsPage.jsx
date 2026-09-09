import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from "axios";
import API_URL from '../../config/api';

export default function NotificationsPage() {
 const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);

 const markAsRead = async (id) => {
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

    fetchNotifications();
  } catch (err) {
    console.error(err);
  }
};

 const markAllAsRead = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.patch(
      `${API_URL}/activity/read-all`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchNotifications();
  } catch (err) {
    console.error(err);
  }
};

const deleteNotification = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await axios.delete(
      `${API_URL}/activity/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    toast.success("Notification deleted successfully!");
    fetchNotifications();
  } catch (err) {
    console.error(err);
  }
};

  const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${API_URL}/activity/admin`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setNotifications(res.data.activities);
    setUnreadCount(res.data.unreadCount);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchNotifications();
}, []);

  const getTypeColor = (type) => {
    const colors = {
      complaint: 'bg-red-100 text-red-800',
      user: 'bg-blue-100 text-blue-800',
      certificate: 'bg-green-100 text-green-800',
      scheme: 'bg-purple-100 text-purple-800',
      notice: 'bg-orange-100 text-orange-800',
      feedback: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">All Notifications</h2>
            <p className="text-gray-600 text-sm mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition-all font-semibold text-sm w-full sm:w-auto shrink-0"
            >
              <CheckCheck className="h-4 w-4 shrink-0" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {/* ── Notification Cards ── */}
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`rounded-xl p-4 border-2 transition-all ${!notif.isRead ? 'bg-blue-50 border-blue-200 hover:shadow-md' : 'bg-white border-gray-200 hover:shadow-md'}`}
            >
              <div className="flex items-start gap-3">

                {/* Bell icon */}
                <div className={`p-2.5 rounded-xl shrink-0 ${!notif.isRead ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Bell className={`h-5 w-5 ${!notif.isRead ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>

                {/* Content + badges + detail */}
                <div className="flex-1 min-w-0">

                  {/* Title row with action buttons on right */}
                  <div className="flex items-start gap-2">
                    <h3 className={`font-bold text-sm md:text-base flex-1 min-w-0 leading-snug ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </h3>
                    {/* Action buttons — always top-right */}
                    <div className="flex gap-1.5 shrink-0">
                      { !notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif._id)}
                          className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif._id)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges row — wraps naturally */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getTypeColor(notif.type)}`}>
                      {notif.type.toUpperCase()}
                    </span>
                    {!notif.isRead && (
                      <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <p className="text-gray-600 text-xs md:text-sm mt-1.5 leading-relaxed">{notif.description}</p>
                  <p className="text-xs text-gray-500">
                 {new Date(notif.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                        month: "2-digit",
                     year: "numeric",
                   hour: "2-digit",
                      minute: "2-digit",
                        hour12: true,
                           })}
                    </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No notifications</p>
            <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
