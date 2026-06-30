// src/api/authApi.js

import axios from "axios";

// WHY: Centralizing the base URL here means we only update it in one
// place if the backend URL changes (e.g., dev → staging → production).
const API_BASE_URL = "http://localhost:5000/api/auth";

/**
 * Register a new user.
 * WHY: Returning response.data (not the whole axios response) keeps
 * the calling component decoupled from axios-specific response shape.
 */
export const register = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    // WHY: We rethrow the backend's error message (not a generic axios
    // error) so RegisterPage can show the exact reason registration failed,
    // e.g. "Email already exists".
    const message =
      error.response?.data?.message || "Registration failed. Please try again.";
    throw new Error(message);
  }
};

/**
 * Log in an existing user.
 * WHY: On success this returns { token, user } so AuthContext can
 * immediately update global auth state without a second API call.
 */
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    // WHY: Distinguishing "Invalid credentials" from a network failure
    // helps the user understand whether to retry or check their input.
    const message =
      error.response?.data?.message || "Login failed. Please try again.";
    throw new Error(message);
  }
};