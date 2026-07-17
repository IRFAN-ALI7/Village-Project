import { Home } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-green-700 via-green-600 to-green-700 text-white shadow-xl border-b-4 border-green-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand - Left Side */}
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <Home className="h-7 w-7 text-green-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">Digital Village</h1>
              <p className="text-sm text-green-50">Connecting Communities</p>
            </div>
          </div>

          {/* Center Text */}
          <div className="hidden md:block text-center bg-white/10 px-8 py-3 rounded-lg backdrop-blur-sm">
            <p className="text-lg font-semibold tracking-wide">All Notice</p>
          </div>

          {/* Empty div for flex spacing */}
          <div className="w-32 hidden md:block"></div>
        </div>
      </div>
    </nav>
  );
}