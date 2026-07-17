import { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Calendar,
  Megaphone,
  Droplet,
  Users,
  Gift,
  Info,
  Pin,
  Clock,
  MapPin,
  ChevronRight,
  X,
  Filter,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import API_URL from '../../config/api';

export default function NoticeBoard() {
  const navigate = useNavigate();
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allNotices, setAllNotices] = useState([]);
  
  useEffect(()=> {
    const fetchNotices = async()=> {
      try{
        const res = await fetch(`${API_URL}/api/notices`);
        const data = await res.json();
        if(res.ok){
          setAllNotices(data.notices);
        }else{
          console.log(data.message);
        }
      }catch(err){
    console.log(err)};
    }
    fetchNotices();
  }, []);

  const filteredNotices = allNotices
    .filter(notice => filterType === 'all' || notice.category === filterType)
    .filter(notice => 
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const pinnedNotices = filteredNotices.filter(n => n.isPinned);
  const regularNotices = filteredNotices.filter(n => !n.isPinned);

  const getNoticeStyle = (type) => {
    const styles = {
      urgent: {
        gradient: 'from-red-500 to-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: AlertTriangle,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        badge: 'bg-red-100 text-red-800',
        label: 'Urgent'
      },
      meeting: {
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: Users,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800',
        label: 'Meeting'
      },
      scheme: {
        gradient: 'from-green-500 to-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: Gift,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        badge: 'bg-green-100 text-green-800',
        label: 'Scheme'
      },
      service: {
        gradient: 'from-orange-500 to-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: Droplet,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-800',
        label: 'Service'
      },
      general: {
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: Info,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-800',
        label: 'General'
      }
    };
    return styles[type];
  };

  const formatDate = (dateStr) => {
    if(!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const NoticeCard = ({notice}) => {
    const style = getNoticeStyle(notice.category);
    const Icon = style.icon;

    return (
      <div className={`${style.bg} border-2 ${style.border} rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden`}
        onClick={() => setSelectedNotice(notice)}>
        
        {notice.isPinned && (
          <div className="absolute top-3 right-3">
            <Pin className="h-5 w-5 text-red-500 fill-red-500" />
          </div>
        )}

        <div className="flex items-start space-x-4">
          <div className={`${style.iconBg} p-3 rounded-lg`}>
            <Icon className={`h-6 w-6 ${style.iconColor}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg mb-1">{notice.title}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
                  {style.label}
                </span>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
              {notice.description}
            </p>

            <div className="space-y-2">
              {notice.date && (
                 <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="font-semibold">{formatDate(notice.date)}</span>
              </div>
              )}

              {notice.time && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{notice.time}</span>
                </div>
              )}

              {notice.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{notice.location}</span>
                </div>
              )}

              {notice.validUpto && (
                <div className="bg-white/60 px-3 py-1.5 rounded-lg inline-block">
                  <span className="text-xs font-semibold text-gray-700">
                    Valid till: {formatDate(notice.validUpto)}
                  </span>
                </div>
              )}
            </div>

            <button className="mt-4 text-blue-600 font-semibold text-sm flex items-center space-x-1 hover:text-blue-700 transition-all">
              <span>Read Full Notice</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-2xl p-8 mb-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Megaphone className="h-10 w-10" />
              <h1 className="text-4xl font-bold">Notice Board</h1>
            </div>
            <p className="text-orange-100 text-lg">Stay updated with latest village announcements and notifications</p>
          </div>
          <Bell className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none cursor-pointer"
            >
              <option value="all">All Notices</option>
              <option value="urgent">Urgent</option>
              <option value="meeting">Meetings</option>
              <option value="scheme">Government Schemes</option>
              <option value="service">Services</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          {[
            { type: 'all', label: 'Total', count: allNotices.length, color: 'bg-gray-100 text-gray-800' },
            { type: 'urgent', label: 'Urgent', count: allNotices.filter(n => n.category === 'urgent').length, color: 'bg-red-100 text-red-800' },
            { type: 'meeting', label: 'Meetings', count: allNotices.filter(n => n.category === 'meeting').length, color: 'bg-blue-100 text-blue-800' },
            { type: 'scheme', label: 'Schemes', count: allNotices.filter(n => n.category === 'scheme').length, color: 'bg-green-100 text-green-800' },
            { type: 'service', label: 'Services', count: allNotices.filter(n => n.category === 'service').length, color: 'bg-orange-100 text-orange-800' },
            { type: 'general', label: 'general', count: allNotices.filter(n => n.category === 'general').length, color: 'bg-purple-100 text-purple-800' },
          ].map((stat) => (
            <button
              key={stat.type}
              onClick={() => setFilterType(stat.type)}
              className={`${stat.color} px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                filterType === stat.type ? 'ring-2 ring-offset-2 ring-orange-500' : 'hover:shadow-md'
              }`}
            >
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-xs">{stat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Notices */}
      {pinnedNotices.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Pin className="h-5 w-5 text-red-600 fill-red-600" />
            <h2 className="text-2xl font-bold text-gray-800">Pinned Notices</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pinnedNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notices */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">All Notices</h2>
        {regularNotices.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {regularNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No notices found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Full Notice Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className={`bg-gradient-to-r ${getNoticeStyle(selectedNotice.category).gradient} text-white p-6 rounded-t-2xl`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {(() => {
                      const Icon = getNoticeStyle(selectedNotice.category).icon;
                      return <Icon className="h-8 w-8" />;
                    })()}
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                      {getNoticeStyle(selectedNotice.category).label}
                    </span>
                    {selectedNotice.isPinned && (
                      <Pin className="h-5 w-5 fill-white" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{selectedNotice.title}</h2>
                  <div className="flex flex-wrap gap-3 text-sm">

                      {selectedNotice.date  != null && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(selectedNotice.date)}</span>
                      </div>
                    )}
                    {selectedNotice.time && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{selectedNotice.time}</span>
                      </div>
                    )}
                    {selectedNotice.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedNotice.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all ml-4"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {selectedNotice.fullDetails}
                </div>
              </div>

              {selectedNotice.validUpto && (
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm font-semibold text-yellow-800">
                      Valid till: {formatDate(selectedNotice.validUpto)}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-all font-semibold"
                >
                  Print Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
