// src/routes/AppRouter.jsx

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

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/workflow-builder/:workflowId"
            element={<WorkflowBuilderPage />}
          />
          <Route
            path="/history"
            element={<ExecutionHistoryPage />}
          />
        </Route>

        {/* Unknown Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;