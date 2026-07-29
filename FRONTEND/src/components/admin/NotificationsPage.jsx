import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
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
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">All Notifications</h2>
            <p className="text-gray-600 text-sm mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
            >
              <CheckCheck className="h-5 w-5" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`rounded-xl p-5 border-2 transition-all ${
                !notif.isRead
                  ? 'bg-blue-50 border-blue-200 hover:shadow-md' 
                  : 'bg-white border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-xl ${!notif.isRead ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Bell className={`h-6 w-6 ${!notif.isRead ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`font-bold text-lg ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(notif.type)}`}>
                        {notif.type.toUpperCase()}
                      </span>
                      {!notif.isRead && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notif.description}</p>
                    <p className="text-xs text-gray-500">{new Date(notif.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                      title="Mark as read"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif._id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
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
