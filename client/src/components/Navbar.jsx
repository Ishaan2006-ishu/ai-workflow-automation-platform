import React from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// Shared top navigation bar shown on all authenticated pages
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Clears auth state and token, then sends user back to Login
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <span className="navbar-logo">Workflow Automation Platform</span>

      <div className="navbar-right">
        {/* Shows the logged-in user's name/email if available */}
        {user && <span className="navbar-user">{user.name || user.email}</span>}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;