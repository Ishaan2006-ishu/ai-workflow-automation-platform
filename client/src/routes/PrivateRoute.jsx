// routes/PrivateRoute.jsx
// -----------------------
// A route guard for PROTECTED pages (Dashboard, Builder, History).
//
// Logic:
//   - isAuthenticated === true  → render the requested page (children)
//   - isAuthenticated === false → redirect to /login
//
// This component does NOT handle login, logout, or API calls.
// It only reads state and makes a render decision.

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// `children` is the page component passed from AppRouter.
// Example: <PrivateRoute><DashboardPage /></PrivateRoute>
function PrivateRoute({ children }) {
  // Pull isAuthenticated from the global AuthContext.
  // This value is set in AuthContext.jsx and will later be
  // updated when a real login is implemented.
  const { isAuthenticated } = useAuth();

  // If the user is authenticated, render the protected page normally.
  // Otherwise, send them to /login.
  // `replace` prevents the protected URL from being pushed onto history
  // (so the back button doesn't land the user on a page they can't access).
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
