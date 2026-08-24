import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "./Navbar.css";

// Shared top navigation bar shown on all authenticated pages
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Clears auth state and token, then sends user back to Login
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <span className="navbar-logo" onClick={() => navigate("/dashboard")}>
        Workflow Automation Platform
      </span>

      <div className="navbar-right">
        <button
          className={`navbar-link ${location.pathname === "/dashboard" ? "navbar-link--active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`navbar-link ${location.pathname === "/history" ? "navbar-link--active" : ""}`}
          onClick={() => navigate("/history")}
        >
          Execution History
        </button>

        {/* Shows the logged-in user's name/email if available */}
        {user && <span className="navbar-user">{user.name || user.email}</span>}
        <button className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
