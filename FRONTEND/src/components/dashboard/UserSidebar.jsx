import { LayoutDashboard, FileText, User, LogOut, Megaphone, Gift, X, CreditCard, Home } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function UserSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'complaint', label: 'File Complaint', icon: FileText, path: '/complaint' },
    { id: 'my-complaints', label: 'My Complaints', icon: FileText, path: '/my-complaints' },
    { id: 'schemes', label: 'Government Schemes', icon: Gift, path: '/schemes' },
    { id: 'certificates', label: 'Certificates', icon: CreditCard, path: '/certificates' },
    { id: 'notices', label: 'Notice Board', icon: Megaphone, path: '/notices' },
    { id: 'profile', label: 'My Profile', icon: User, path: '/profile' },
  ];

  const handleNavigation = (id, path) => {
    setActiveItem(id);
    navigate(path);
    onClose();
  };

  const handleLogout = (e)=> {
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold">Smart Village</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User Profile */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  RK
                </div>
                <div>
                  <h3 className="font-bold text-white">Rajesh Kumar</h3>
                  <p className="text-sm text-white/80">Village Member</p>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id, item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-green-600 shadow-lg font-semibold'
                        : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-white'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer - Logout */}
          <div className="p-6 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl bg-red-500/90 hover:bg-red-600 transition-all shadow-lg font-semibold"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
