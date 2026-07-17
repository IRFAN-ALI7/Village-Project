import  DashboardNavbar  from '../components/dashboard/DashboardNavbar';
import  DashboardFooter  from '../components/dashboard/DashboardFooter';
import  SchemesContent  from '../components/schemes/SchemesContent';

export default function SchemesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DashboardNavbar />
      
      <main className="flex-1">
        <SchemesContent />
      </main>

      <DashboardFooter />
    </div>
  );
}
