import { useState } from 'react';
import  AdminNavbar  from '../../components/admin/AdminNavbar';
import  AdminSidebar  from '../../components/admin/AdminSidebar';
import  ComplaintsManagement  from '../../components/admin/ComplaintsManagement';

export default function AdminComplaintsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section) => {
    setIsSidebarOpen(false);
    // You can add navigation logic here if needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white">
      <AdminNavbar 
        onMenuClick={handleSidebarToggle}
        pageTitle="Complaint Management"
      />
      
      <AdminSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeSection="complaints"
        onSectionChange={handleSectionChange}
      />

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-20 px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <ComplaintsManagement />
        </div>
      </main>
    </div>
  );
}
