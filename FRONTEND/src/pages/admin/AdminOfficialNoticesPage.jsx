import { useState } from 'react';
import  AdminNavbar  from '../../components/admin/AdminNavbar';
import  AdminSidebar  from '../../components/admin/AdminSidebar';
import  OfficialNotices  from '../../components/admin/OfficialNotices';

export default function AdminOfficialNoticesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white">
      <AdminNavbar
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        pageTitle="Official Notices"
      />

      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeSection="official-notices"
        onSectionChange={() => {}}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="pt-16 md:pt-20 px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <OfficialNotices />
        </div>
      </main>
    </div>
  );
}
