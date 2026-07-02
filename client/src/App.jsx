// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

/**
 * WHY: Dashboard belongs to the next development day. This placeholder
 * exists only so PrivateRoute has a real destination to render today —
 * it will be deleted and replaced once DashboardPage.jsx is built.
 */
const DashboardPlaceholder = () => <div>Dashboard Page</div>;

function App() {
  return (
    // WHY: AuthProvider must be above BrowserRouter's children (or
    // wrap it directly) so that every routed component — including
    // PrivateRoute/PublicRoute themselves — can call useAuth().
    <AuthProvider>
      {/* WHY: BrowserRouter must wrap all routing-aware components,
          since useNavigate/<Navigate>/<Routes> only work inside it. */}
      <BrowserRouter>
        <Routes>
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* WHY: A catch-all default route ensures the app doesn't
              show a blank screen at "/" — it sends the user into the
              auth flow, where PublicRoute/PrivateRoute then decide
              where they actually belong. */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;