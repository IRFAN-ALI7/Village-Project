import { BrowserRouter, Routes,Route} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ComplaintPage from "./pages/ComplaintPage";
import MyComplaintsPage from "./pages/MyComplaintsPage";
import UserNotificationPage from "./pages/UserNotificationPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute.";
import AuthRoute from "./components/AuthRoute";
import NoticePage from "./pages/NoticePage";
import HomePage from "./pages/HomePage";
import RegistrationPage from "./pages/RegistrationPage";
import CertificatesPage from "./pages/CertificatesPages";
import SchemesPage from "./pages/SchemesPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminComplaintsPage from "./pages/admin/AdminComplaintsPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import AdminSchemesPage from "./pages/admin/AdminSchemesPage";
import AdminNoticesPage from "./pages/admin/AdminNoticesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import  AdminCertificatesPage from "./pages/admin/AdminCertificatePage";
import  AdminSettingsPage  from "./pages/admin/AdminSettingsPage";

function App() {
  return (
    <>
    <Toaster 
    position="top-center"
    toastOptions={{
      style: {
        padding: "14px 20px",
        borderRadius: "10px",
        fontSize: "15px",
        fontWeight: "500"
      },
      success: {
        style: {
          background: "#16a34a",
          color: "#fff"
        }
      },
      error:{
        style: {
          background: "#dc2626",
          color: "#fff"
        }
      }
    }} 
    />

    <BrowserRouter>
    <Routes>

      <Route
       path="/" 
       element={ <HomePage/>}
      />

      <Route
       path="/register"
         element = {
        <RegistrationPage/>
      }
      />

       <Route
           path="/login"
            element= {
              <AuthRoute>
                <LoginPage/>
               </AuthRoute>
             
          }
       />

        <Route
              path="/dashboard"
              element = {
              <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
           } 
      />

           <Route
            path="/complaint"
              element = {
           <ProtectedRoute>
            <ComplaintPage/>
           </ProtectedRoute>
      }
      />

          <Route
           path="/my-complaints"
             element = {
           <ProtectedRoute>
            <MyComplaintsPage/>
           </ProtectedRoute>
      }
      />

          <Route
           path="/schemes"
             element = {
          <SchemesPage/>
      }
      />
        <Route
        path="/notifications"
        element = {
          <ProtectedRoute>
            <UserNotificationPage/>
          </ProtectedRoute>
        }
        />

         <Route
          path="/profile"
            element = {
          <ProtectedRoute>
            <ProfilePage/>
          </ProtectedRoute>
      }
      />

       <Route
           path="/notices"
             element = {
          <NoticePage/>
      }
      />

      <Route path="/certificates"
      element = {<CertificatesPage/>}
      />

      <Route path="/admin/register"
      element = {<AdminRegister/>}
      />

      <Route path="/admin/login"
      element = {<AdminLogin/>}
      />

       <Route path="/admin/dashboard"
      element ={<AdminDashboard/>}
      />

      <Route path="/admin/complaints"
      element = {<AdminComplaintsPage/>}
      />

      <Route path="/admin/schemes"
      element = {<AdminSchemesPage/>}
      />

      <Route path="/admin/notices"
      element = {<AdminNoticesPage/>}
      />

      <Route path="/admin/users"
      element = {<AdminUsersPage/>}
      />

      <Route path="/admin/certificates"
      element = {<AdminCertificatesPage/>}
      />

      <Route path="/admin/notifications"
      element = {<AdminNotificationsPage/>}
      />

      <Route path="/admin/settings" 
      element = {<AdminSettingsPage/>}
      />

      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App
