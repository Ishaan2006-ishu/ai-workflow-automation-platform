// src/routes/PublicRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * Allows only unauthenticated users to access routes
 * like Login and Register.
 */
const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render nested routes (Login/Register)
  return <Outlet />;
};

export default PublicRoute;