import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AuthRoute({ children }) {
  const token = localStorage.getItem("token");

  // User/Admin login nahi hai
  if (!token) {
    return children;
  }

  try {
    const decoded = jwtDecode(token);

    // Admin already logged in
    if (decoded.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    // User already logged in
    if (decoded.role === "user") {
      return <Navigate to="/dashboard" replace />;
    }

    // Invalid role
    localStorage.removeItem("token");
    return children;
  } catch (error) {
    localStorage.removeItem("token");
    return children;
  }
}