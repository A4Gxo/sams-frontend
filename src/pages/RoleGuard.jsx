import { Navigate } from "react-router-dom";

export default function RoleGuard({ children, allowedRoles }) {
  const userRole = localStorage.getItem("userRole");

  // If the user's role isn't in the allowed list, send them back to the overview
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}