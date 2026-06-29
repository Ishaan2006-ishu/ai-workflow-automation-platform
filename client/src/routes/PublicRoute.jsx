// routes/PublicRoute.jsx
// ----------------------
// A route guard for PUBLIC-ONLY pages (Login, Register).
//
// Logic:
//   - isAuthenticated === true  → redirect to /dashboard
//     (a logged-in user has no reason to see the login page)
//   - isAuthenticated === false → render the page (children)
//
// This prevents logged-in users from navigating back to /login
// or /register via the browser's address bar.

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// `children` is the page component passed from AppRouter.
// Example: <PublicRoute><LoginPage /></PublicRoute>
function PublicRoute({ children }) {
  // Pull isAuthenticated from the global AuthContext.
  const { isAuthenticated } = useAuth();

  // If authenticated, send to /dashboard. Otherwise, show the public page.
  // `replace` keeps the history stack clean (no back-button loops).
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default PublicRoute;
