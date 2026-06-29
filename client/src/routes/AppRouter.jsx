import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Route Guards
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

// Pages
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import WorkflowBuilderPage from "../pages/WorkflowBuilderPage";
import ExecutionHistoryPage from "../pages/ExecutionHistoryPage";

// Auth state provider — must wrap BrowserRouter so route guards can read auth
import { AuthProvider } from "../context/AuthContext";

/**
 * AppRouter
 *
 * The single source of truth for all application routes.
 *
 * Route tree:
 *
 *   /                         → redirect to /dashboard
 *   /register  (PublicRoute)  → RegisterPage
 *   /login     (PublicRoute)  → LoginPage
 *   /dashboard (PrivateRoute) → DashboardPage
 *   /builder/:workflowId      → WorkflowBuilderPage   (protected)
 *   /history   (PrivateRoute) → ExecutionHistoryPage
 *   *                         → redirect to /dashboard (catch-all)
 *
 * Guard logic:
 *   PublicRoute  — unauthenticated users only; redirects logged-in users to /dashboard
 *   PrivateRoute — authenticated users only; redirects guests to /login
 *
 * AuthProvider wraps BrowserRouter so every route guard and page component
 * can call useAuth() without prop-drilling.
 */
function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ─────────────────────────────────────────────
              Root redirect
              Visiting "/" sends the user to /dashboard.
              PrivateRoute will then redirect to /login if
              the user isn't authenticated — no extra logic needed here.
          ───────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ─────────────────────────────────────────────
              PUBLIC ROUTES
              Accessible only to guests (not logged in).
              Logged-in users are automatically sent to /dashboard.
          ───────────────────────────────────────────── */}
          <Route element={<PublicRoute />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login"    element={<LoginPage />} />
          </Route>

          {/* ─────────────────────────────────────────────
              PRIVATE ROUTES
              Accessible only to authenticated users.
              Unauthenticated users are sent to /login.
          ───────────────────────────────────────────── */}
          <Route element={<PrivateRoute />}>
            {/* Main dashboard — lists the user's workflows */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Workflow builder — :workflowId identifies which workflow to edit.
                Example: /builder/wf123 */}
            <Route path="/builder/:workflowId" element={<WorkflowBuilderPage />} />

            {/* Execution history — shows past workflow runs */}
            <Route path="/history" element={<ExecutionHistoryPage />} />
          </Route>

          {/* ─────────────────────────────────────────────
              CATCH-ALL
              Any unknown path falls here and redirects to /dashboard.
              PrivateRoute handles the auth check from there.
          ───────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppRouter;
