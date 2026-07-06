import apiClient from "./axios";

// ============================================================
// WHY THIS FILE EXISTS
// ============================================================
// This file is the ONLY place in the whole frontend that knows
// the exact backend routes for authentication ("/auth/register",
// "/auth/login"). Pages (RegisterPage.jsx, LoginPage.jsx) never
// call axios directly — they call register() or login() from here.
//
// This means: if the backend route for login ever changes from
// "/auth/login" to "/auth/signin", you fix it in ONE line, in ONE
// file, and every page that calls login() keeps working with zero
// changes.
// ============================================================

/**
 * Register a new user.
 *
 * WHY apiClient instead of axios:
 * apiClient already knows the base URL (http://localhost:5000/api),
 * so we only need to specify the resource path: "/auth/register".
 * If we used raw axios here, we'd have to repeat the full URL,
 * and it would live in TWO places instead of one (duplication risk).
 *
 * WHY we return response.data (not the whole response):
 * axios wraps the backend's reply inside extra fields like
 * response.status, response.headers, response.config, etc.
 * The calling component (RegisterPage.jsx) doesn't care about any
 * of that — it only cares about the actual data the backend sent
 * back (e.g., { message: "User created" }). So we unwrap it here,
 * once, so every caller gets clean data directly.
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} backend response data
 */
export const register = async (name, email, password) => {
  try {
    const response = await apiClient.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    // WHY we rethrow a NEW Error with a specific message:
    // If the backend sent a specific reason for failure (e.g.,
    // "Email already exists"), error.response.data.message will
    // contain it. We extract that message and throw a clean
    // JavaScript Error with it, so RegisterPage.jsx can simply do:
    //   catch (err) { setErrorMessage(err.message); }
    // without needing to know anything about axios's error shape.
    const message =
      error.response?.data?.message || "Registration failed. Please try again.";
    throw new Error(message);
  }
};

/**
 * Log in an existing user.
 *
 * WHY this returns { token, user }:
 * On successful login, the backend sends back a JWT token and the
 * user's profile info. AuthContext.jsx calls login() and then
 * immediately stores both the token (via tokenHelper.js) and the
 * user object (in React state) — all from this single response,
 * without needing a second "get profile" request.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: Object }>}
 */
export const login = async (email, password) => {
  try {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    // WHY we distinguish backend messages from generic failures:
    // "Invalid credentials" (400/401 from backend) tells the user
    // to check their email/password. A missing error.response
    // (e.g., backend is down, no internet) means it's a network
    // problem — the fallback message covers that case too.
    const message =
      error.response?.data?.message || "Login failed. Please try again.";
    throw new Error(message);
  }
};