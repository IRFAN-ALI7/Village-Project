import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { useState } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      text: 'New complaint registered', 
      time: '5 min ago', 
      unread: true, 
      type: 'complaint',
      details: 'A new complaint has been registered by Rajesh Kumar regarding street light issues in Ward 3.'
    },
    { 
      id: 2, 
      text: 'User John Doe verified', 
      time: '10 min ago', 
      unread: true, 
      type: 'user',
      details: 'User John Doe has been successfully verified and can now access all services.'
    },
    { 
      id: 3, 
      text: 'Certificate request approved', 
      time: '1 hour ago', 
      unread: false, 
      type: 'certificate',
      details: 'Income certificate request for Priya Sharma has been approved and is ready for issuance.'
    },
    { 
      id: 4, 
      text: 'New scheme application', 
      time: '2 hours ago', 
      unread: false, 
      type: 'scheme',
      details: 'New application received for PM Awas Yojana from Amit Patel.'
    },
    { 
      id: 5, 
      text: 'Notice published successfully', 
      time: '3 hours ago', 
      unread: false, 
      type: 'notice',
      details: 'Gram Sabha meeting notice has been published successfully on the notice board.'
    },
    { 
      id: 6, 
      text: 'User registration pending', 
      time: '4 hours ago', 
      unread: false, 
      type: 'user',
      details: 'New user Sunita Devi registration is pending admin approval.'
    },
    { 
      id: 7, 
      text: 'Complaint resolved', 
      time: '5 hours ago', 
      unread: false, 
      type: 'complaint',
      details: 'Water supply complaint in Ward 5 has been marked as resolved.'
    },
    { 
      id: 8, 
      text: 'New feedback received', 
      time: '6 hours ago', 
      unread: false, 
      type: 'feedback',
      details: 'Positive feedback received from villager regarding road repair work.'
    },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    alert('All notifications marked as read!');
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    alert('Notification deleted!');
  };

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
              key={notif.id}
              className={`rounded-xl p-5 border-2 transition-all ${
                notif.unread 
                  ? 'bg-blue-50 border-blue-200 hover:shadow-md' 
                  : 'bg-white border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-xl ${notif.unread ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Bell className={`h-6 w-6 ${notif.unread ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`font-bold text-lg ${notif.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.text}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(notif.type)}`}>
                        {notif.type.toUpperCase()}
                      </span>
                      {notif.unread && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notif.details}</p>
                    <p className="text-xs text-gray-500">{notif.time}</p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {notif.unread && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                      title="Mark as read"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
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
