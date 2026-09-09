import { BrowserRouter, Routes,Route} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ComplaintPage from "./pages/ComplaintPage";
import MyComplaintsPage from "./pages/MyComplaintsPage";
import UserNotificationPage from "./pages/UserNotificationPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AuthRoute from "./components/AuthRoute";
import NoticePage from "./pages/NoticePage";
import HomePage from "./pages/HomePage";
import RegistrationPage from "./pages/RegistrationPage";
import CertificatesPage from "./pages/CertificatesPages";
import SchemesPage from "./pages/SchemesPage";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminComplaintsPage from "./pages/admin/AdminComplaintsPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import AdminSchemesPage from "./pages/admin/AdminSchemesPage";
import AdminNoticesPage from "./pages/admin/AdminNoticesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import  AdminCertificatesPage from "./pages/admin/AdminCertificatePage";
import  AdminSettingsPage  from "./pages/admin/AdminSettingsPage";
import  AdminOfficialNoticesPage  from './pages/admin/AdminOfficialNoticesPage';

import  SuperAdminLogin  from './pages/super-admin/SuperAdminLogin';
import  SuperAdminDashboard  from './pages/super-admin/dashboard/SuperAdminDashboard';
import  Admins  from './pages/super-admin/admins/Admins';
import  CreateAdmin  from './pages/super-admin/admins/CreateAdmin';
import  AdminDetails  from './pages/super-admin/admins/AdminDetails';
import  EditAdmin  from './pages/super-admin/admins/EditAdmin';
import  Panchayats  from './pages/super-admin/panchayats/Panchayats';
import  PanchayatDetails  from './pages/super-admin/panchayats/PanchayatDetails';
import  Notices  from './pages/super-admin/notices/Notices';
import  CreateNotice  from './pages/super-admin/notices/CreateNotice';
import  NoticeDetails  from './pages/super-admin/notices/NoticeDetails';
import  SuperAdminProfile  from './pages/super-admin/profile/SuperAdminProfile';
import  ChangePassword  from './pages/super-admin/profile/ChangePassword';
import SuperAdminProtectedRoute from "./components/SuperAdminProtectedRoute";

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
      {/* user */}
      <Route
       path="/" 
       element={ <HomePage/>}
      />

      <Route
        path="/register"
        element={
        <AuthRoute>
        <RegistrationPage />
        </AuthRoute>
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
              <ProtectedRoute>
            <SchemesPage/>
          </ProtectedRoute>
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
          <ProtectedRoute>
            <NoticePage/>
          </ProtectedRoute>
      }
      />

      <Route path="/certificates"
      element = {
        <ProtectedRoute>
      <CertificatesPage/>
      </ProtectedRoute>
    }
     />
{/* admin */}
      <Route
       path="/admin/login"
        element={
        <AuthRoute>
         <AdminLogin />
        </AuthRoute>
        }
         />

       <Route path="/admin/dashboard"
           element ={
            <AdminProtectedRoute>
           <AdminDashboard/>
            </AdminProtectedRoute>
          }
         />

           <Route
            path="/admin/complaints"
           element={
             <AdminProtectedRoute>
              <AdminComplaintsPage />
            </AdminProtectedRoute>
         }
         />

           <Route
            path="/admin/schemes"
           element={
            <AdminProtectedRoute>
             <AdminSchemesPage />
            </AdminProtectedRoute>
          }
         />

           <Route
          path="/admin/notices"
           element={
             <AdminProtectedRoute>
            <AdminNoticesPage />
             </AdminProtectedRoute>
            }
          />

               <Route
           path="/admin/users"
            element={
             <AdminProtectedRoute>
             <AdminUsersPage />
             </AdminProtectedRoute>
            }
        />

          <Route
            path="/admin/certificates"
           element={
            <AdminProtectedRoute>
              <AdminCertificatesPage />
            </AdminProtectedRoute>
             }
          />

            <Route
            path="/admin/notifications"
           element={
            <AdminProtectedRoute>
             <AdminNotificationsPage />
            </AdminProtectedRoute>
       }
      />

     <Route
         path="/admin/settings"
          element={
         <AdminProtectedRoute>
           <AdminSettingsPage />
          </AdminProtectedRoute>
         }
       />

       <Route
         path="/admin/official-notices"
          element={
         <AdminProtectedRoute>
           <AdminOfficialNoticesPage />
          </AdminProtectedRoute>
         }
       />

       {/* ================= SUPER ADMIN ================= */}

{/* Super Admin Login - Public */}
<Route
  path="/super-admin/login"
  element={<SuperAdminLogin />}
/>

{/* Super Admin Dashboard */}
<Route
  path="/super-admin/dashboard"
  element={
    <SuperAdminProtectedRoute>
      <SuperAdminDashboard />
    </SuperAdminProtectedRoute>
  }
/>

{/* Admin Management */}
<Route
  path="/super-admin/admins"
  element={
    <SuperAdminProtectedRoute>
      <Admins />
    </SuperAdminProtectedRoute>
  }
/>

<Route
  path="/super-admin/admins/create"
  element={
    <SuperAdminProtectedRoute>
      <CreateAdmin />
    </SuperAdminProtectedRoute>
  }
/>

<Route
  path="/super-admin/admins/:id"
  element={
    <SuperAdminProtectedRoute>
      <AdminDetails />
    </SuperAdminProtectedRoute>
  }
/>

<Route
  path="/super-admin/admins/:id/edit"
  element={
    <SuperAdminProtectedRoute>
      <EditAdmin />
    </SuperAdminProtectedRoute>
  }
/>

{/* Panchayat Management */}
<Route
  path="/super-admin/panchayats"
  element={
    <SuperAdminProtectedRoute>
      <Panchayats />
    </SuperAdminProtectedRoute>
  }
/>

<Route
  path="/super-admin/panchayats/:panchayatCode"
  element={
    <SuperAdminProtectedRoute>
      <PanchayatDetails />
    </SuperAdminProtectedRoute>
  }
/>

{/* Super Admin Notices */}
<Route
  path="/super-admin/notices"
  element={
    <SuperAdminProtectedRoute>
      <Notices />
    </SuperAdminProtectedRoute>
  }
/>

<Route
  path="/super-admin/notices/create"
  element={
    <SuperAdminProtectedRoute>
      <CreateNotice />
    </SuperAdminProtectedRoute>
  }
/>

<Route
  path="/super-admin/notices/:id"
  element={
    <SuperAdminProtectedRoute>
      <NoticeDetails />
    </SuperAdminProtectedRoute>
  }
/>

{/* Super Admin Profile */}
<Route
  path="/super-admin/profile"
  element={
    <SuperAdminProtectedRoute>
      <SuperAdminProfile />
    </SuperAdminProtectedRoute>
  }
/>

<Route
  path="/super-admin/profile/change-password"
  element={
    <SuperAdminProtectedRoute>
      <ChangePassword />
    </SuperAdminProtectedRoute>
  }
/>
    <Route
     path="*" 
     element={<NotFound />}
      />   
      
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App
