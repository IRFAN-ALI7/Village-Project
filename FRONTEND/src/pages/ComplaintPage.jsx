import  DashboardNavbar  from '../components/dashboard/DashboardNavbar';
import  DashboardFooter  from '../components/dashboard/DashboardFooter';
import  ComplaintForm  from '../components/dashboard/ComplaintForm';

export default function ComplaintPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <DashboardNavbar />
      
      <main className="flex-1">
        <ComplaintForm />
      </main>

      <DashboardFooter />
    </div>
  );
}