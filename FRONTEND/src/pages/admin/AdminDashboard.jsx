import { useState } from 'react';
import  AdminNavbar  from '../../components/admin/AdminNavbar';
import  AdminSidebar  from '../../components/admin/AdminSidebar';
import  DashboardContent  from '../../components/admin/DashboardContent';
import  ComplaintsManagement  from '../../components/admin/ComplaintsManagement';
import  SchemesManagement  from '../../components/admin/SchemesManagement';
import  NoticesManagement  from '../../components/admin/NoticesManagement';
import  UsersManagement  from '../../components/admin/UsersManagement';
import  CertificatesManagement  from '../../components/admin/CertificatesManagement';
import  SettingsPage  from '../../components/admin/SettingsPage';

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'complaints':
        return <ComplaintsManagement />;
      case 'schemes':
        return <SchemesManagement />;
      case 'notices':
        return <NoticesManagement />;
      case 'users':
        return <UsersManagement />;
      case 'certificates':
        return <CertificatesManagement />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardContent />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Admin Dashboard',
      complaints: 'Complaint Management',
      schemes: 'Schemes Management',
      notices: 'Notice Management',
      users: 'User Management',
      certificates: 'Certificate Management',
      settings: 'Settings',
    };
    return titles[activeSection] || 'Admin Dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white">
      <AdminNavbar 
        onMenuClick={handleSidebarToggle}
        pageTitle={getPageTitle()}
      />
      
      <AdminSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeSection={activeSection}
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
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
