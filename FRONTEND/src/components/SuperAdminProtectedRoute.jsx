import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function SuperAdminProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Token nahi hai
  if (!token) {
    return <Navigate to="/super-admin/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Sirf superadmin allowed hai
    if (decoded.role !== "superadmin") {
      return <Navigate to="/super-admin/login" replace />;
    }

    // Token expiry check
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("superAdmin");

      return <Navigate to="/super-admin/login" replace />;
    }

    return children;
  } catch (error) {
    console.error("Invalid Super Admin token:", error);

    localStorage.removeItem("token");
    localStorage.removeItem("superAdmin");

    return <Navigate to="/super-admin/login" replace />;
  }
}