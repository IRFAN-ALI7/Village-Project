import  DashboardNavbar  from '../components/dashboard/DashboardNavbar';
import  DashboardFooter  from '../components/dashboard/DashboardFooter';
import  ProfileContent  from '../components/profile/ProfileContent';

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DashboardNavbar />
      
      <main className="flex-1 py-8">
        <ProfileContent />
      </main>

      <DashboardFooter />
    </div>
  );
}