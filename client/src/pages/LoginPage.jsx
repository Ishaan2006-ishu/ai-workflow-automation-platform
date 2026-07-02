// src/pages/LoginPage.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi } from "../api/authApi";
import useAuth from "../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * WHY: Catching empty fields here avoids sending a request the
   * backend will reject anyway, giving the user instant feedback
   * instead of a round-trip delay.
   */
  const validateForm = () => {
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email and password are required.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginApi(formData.email, formData.password);

      // WHY: This single call saves the token to localStorage AND
      // updates AuthContext state in one step, so every component
      // reading useAuth() (Navbar, PrivateRoute, etc.) immediately
      // reflects the logged-in state on the very next render.
      login(response.token, response.user);

      navigate("/dashboard");
    } catch (error) {
      // WHY: error.message is the backend's exact reason
      // (e.g. "Invalid credentials"), passed through cleanly
      // by authApi's catch block.
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Register</Link>
       
      </p>
    </div>
  );
};

export default LoginPage;