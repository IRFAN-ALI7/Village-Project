import  DashboardNavbar  from '../components/dashboard/DashboardNavbar';
import  DashboardFooter  from '../components/dashboard/DashboardFooter';
import  NoticeBoard  from '../components/notices/NoticeBoard';

export default function NoticePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <DashboardNavbar />
      
      <main className="flex-1">
        <NoticeBoard />
      </main>

      <DashboardFooter />
    </div>
  );
}
