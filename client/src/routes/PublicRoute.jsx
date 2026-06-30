// src/routes/PublicRoute.jsx

import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * Guards routes that should only be visible to unauthenticated users
 * (Login, Register).
 * WHY: Without this, a logged-in user could revisit /login and
 * trigger a redundant login flow, or briefly see a stale auth form
 * instead of being routed straight back into the app.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // WHY: `replace` keeps /login or /register out of browser history
    // once the user is authenticated, so "back" doesn't loop them
    // back into the auth pages.
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;