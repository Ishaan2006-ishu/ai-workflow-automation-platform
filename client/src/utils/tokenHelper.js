// src/utils/tokenHelper.js

const TOKEN_KEY = "auth_token";

/**
 * Persist the JWT to localStorage.
 * WHY: Without persisting the token, the user would be logged out
 * on every page refresh, since React state resets on reload.
 */
export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Retrieve the JWT from localStorage.
 * WHY: AuthContext needs this on app startup to determine whether
 * a user is already logged in, without forcing them to log in again
 * after a refresh.
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove the JWT from localStorage.
 * WHY: On logout, the stale token must be cleared immediately —
 * otherwise PrivateRoute would still treat the user as authenticated
 * even after they've logged out.
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};