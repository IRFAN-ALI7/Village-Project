import  DashboardNavbar  from '../components/dashboard/DashboardNavbar';
import  DashboardFooter  from '../components/dashboard/DashboardFooter';
import  MyComplaints  from '../components/dashboard/MyComplaints';

export default function MyComplaintsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-red-50">
      <DashboardNavbar />
      
      <main className="flex-1">
        <MyComplaints />
      </main>

      <DashboardFooter />
    </div>
  );
}
