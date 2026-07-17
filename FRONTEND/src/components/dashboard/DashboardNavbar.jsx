import { Bell, Home, ChevronDown } from 'lucide-react';

export default function DashboardNavbar() {
  return (
    <nav className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 text-white shadow-xl border-b-4 border-teal-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand - Left Side */}
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <Home className="h-7 w-7 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">Smart Village</h1>
              <p className="text-sm text-teal-50">Digital Service Portal</p>
            </div>
          </div>

          {/* Right Side - Notification and User Profile */}
          <div className="flex items-center space-x-4">
            {/* Notification Icon */}
            <div className="relative">
              <button className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all shadow-md backdrop-blur-sm">
                <Bell className="h-6 w-6" />
              </button>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg">
                3
              </span>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20 transition-all cursor-pointer shadow-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white/30">
                RK
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold">Rajesh Kumar</p>
                <p className="text-xs text-teal-100">Village Member</p>
              </div>
              <ChevronDown className="h-4 w-4 hidden md:block" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}