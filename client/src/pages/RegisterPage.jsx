// src/pages/RegisterPage.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/authApi";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * WHY: Basic client-side validation before hitting the network.
   * This avoids a wasted API call (and a confusing backend error)
   * for mistakes the frontend can catch instantly, like an empty
   * field or a password the backend will reject for length anyway.
   */
  const validateForm = () => {
    const { name, email, password } = formData;

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("All fields are required.");
      return false;
    }

    // WHY: Mirrors the backend's documented rule (Password Minimum 6
    // Characters) so the user gets instant feedback instead of waiting
    // on a round trip to discover this.
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // WHY: Reset messages on every submit attempt so a stale error
    // from a previous attempt doesn't linger alongside a new one.
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(
        formData.name,
        formData.email,
        formData.password
      );

      setSuccessMessage(response.message || "Registration successful!");

      // WHY: A short delay lets the user actually read the success
      // message before being redirected, rather than the page
      // changing instantly underneath them.
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      // WHY: error.message here is the exact backend message
      // (e.g. "Email already exists") thanks to how authApi
      // rethrows errors.
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

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
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;