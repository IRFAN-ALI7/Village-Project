import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCheck, ChevronRight, UserPlus, MessageSquareWarning, CheckCircle2, XCircle, Landmark, Megaphone, FileText, Info } from 'lucide-react';
import { useNavigate } from 'react-router';
import axios from "axios";
import toast from "react-hot-toast";
import API_URL from "../../config/api";

const typeConfig = {
  REGISTERED:           { icon: UserPlus,             bg: 'bg-emerald-100', iconColor: 'text-emerald-600', badgeCls: 'bg-emerald-100 text-emerald-700', label: 'REGISTERED' },
  COMPLAINT_SUBMITTED:  { icon: MessageSquareWarning, bg: 'bg-blue-100',    iconColor: 'text-blue-600',    badgeCls: 'bg-blue-100 text-blue-700',       label: 'COMPLAINT SUBMITTED' },
  COMPLAINT_RESOLVED:   { icon: CheckCircle2,         bg: 'bg-teal-100',    iconColor: 'text-teal-600',    badgeCls: 'bg-teal-100 text-teal-700',       label: 'COMPLAINT APPROVED' },
  COMPLAINT_REJECTED:   { icon: XCircle,              bg: 'bg-red-100',     iconColor: 'text-red-600',     badgeCls: 'bg-red-100 text-red-700',         label: 'COMPLAINT REJECTED' },
  NEW_SCHEME:         { icon: Landmark,             bg: 'bg-purple-100',  iconColor: 'text-purple-600',  badgeCls: 'bg-purple-100 text-purple-700',   label: 'SCHEME ADDED' },
  NEW_NOTICE:         { icon: Megaphone,            bg: 'bg-orange-100',  iconColor: 'text-orange-600',  badgeCls: 'bg-orange-100 text-orange-700',   label: 'NOTICE ADDED' },
  CERTIFICATE_APPROVED:   { icon: FileText,             bg: 'bg-indigo-100',  iconColor: 'text-indigo-600',  badgeCls: 'bg-indigo-100 text-indigo-700',   label: 'CERTIFICATE ISSUED' },
  GENERAL:              { icon: Info,                 bg: 'bg-gray-100',    iconColor: 'text-gray-600',    badgeCls: 'bg-gray-100 text-gray-700',       label: 'GENERAL' },
};


function formatTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function UserNotifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const unreadCount = items.filter(n => !n.isRead).length;

 const markAsRead = async (_id) => {
  try {
    const token = localStorage.getItem("token");

    await axios.patch(
      `${API_URL}/activity/read/${_id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchNotifications();

  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
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

  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

  const deleteOne = async (_id) => {
  try {
    const token = localStorage.getItem("token");

    await axios.delete(`${API_URL}/activity/${_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchNotifications();

  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};
const deleteAll = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.delete(`${API_URL}/activity/delete-all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchNotifications();

  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

  const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API_URL}/activity/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setItems(res.data.activities);

  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

 const handleCardClick = async (item) => {
  await markAsRead(item._id);
  navigate(item.route);
};
  useEffect(() => {
  fetchNotifications();
}, []);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
            <p className="text-gray-600 text-sm mt-1">
              Stay updated with your latest activities and alerts.{' '}
              {unreadCount > 0 && (
                <span className="font-semibold text-blue-600">{unreadCount} unread</span>
              )}
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-semibold text-sm"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark All as Read
                </button>
              )}
              <button
                onClick={deleteAll}
                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl hover:bg-red-100 transition-all font-semibold text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Delete All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification Cards */}
      <div className="space-y-3">
        {items.map(item => {
          const cfg = typeConfig[item.type] || {
            icon: Info,
            bg: "bg-gray-100",
            iconColor: "text-gray-600",
            badgeCls: "bg-gray-100 text-gray-700",
                 label: item.type || "UNKNOWN",
                };
          const Icon = cfg.icon;
          return (
            <div
              key={item._id}
              onClick={() => handleCardClick(item)}
              className={`rounded-xl p-5 border-2 transition-all cursor-pointer hover:shadow-md group ${
                !item.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Icon + Content */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`shrink-0 p-3 rounded-xl ${cfg.bg}`}>
                    <Icon className={`h-6 w-6 ${cfg.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`font-bold text-base ${!item.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {item.title}
                      </h3>
                      {!item.isRead && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.badgeCls}`}>
                        {cfg.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400">{formatTime(item.createdAt)}</p>
                  </div>
                </div>

                {/* Action Buttons + Chevron */}
                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  {!item.isRead && (
                    <button
                      onClick={() => markAsRead(item._id)}
                      title="Mark as read"
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteOne(item._id)}
                    title="Delete"
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg text-center py-16">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-semibold">No notifications available.</p>
          <p className="text-gray-400 text-sm mt-2">You are all caught up!</p>
        </div>
      )}
    </div>
  );
}
