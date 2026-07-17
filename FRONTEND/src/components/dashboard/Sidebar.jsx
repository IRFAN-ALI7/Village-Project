import { LayoutDashboard, FileText, User, LogOut, Megaphone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function Sidebar() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'my-complaint', label: 'My Complaint', icon: FileText, path: '/my-complaints' },
    { id: 'notices', label: 'Notice Board', icon: Megaphone, path: '/notices' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  const handleNavigation = (id, path) => {
    setActiveItem(id);
    navigate(path);
  };

  return (
    <aside className="w-72 h-screen sticky top-0 bg-white/20 backdrop-blur-md border-r border-white/30 shadow-2xl">
      <div className="flex flex-col h-full p-6">
        {/* User Profile Section */}
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/40">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                RK
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-800">Rajesh Kumar</h3>
            <p className="text-sm text-gray-600">Village Member</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id, item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-green-600 text-white shadow-lg transform scale-105'
                    : 'bg-white/20 backdrop-blur-sm text-gray-700 hover:bg-white/40 border border-white/30'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-green-700'}`} />
                <span className="font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button 
          onClick={() => navigate('/')}
          className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl bg-red-500/90 backdrop-blur-sm text-white hover:bg-red-600 transition-all shadow-lg border border-white/30"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
}