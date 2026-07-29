import  DashboardNavbar  from '../components/dashboard/DashboardNavbar';
import  DashboardFooter  from '../components/dashboard/DashboardFooter';
import  UserNotifications  from '../components/notifications/UserNotifications';

export default function UserNotificationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      <DashboardNavbar />
      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <UserNotifications />
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}
