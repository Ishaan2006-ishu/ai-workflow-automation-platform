// // context/AuthContext.jsx
// // -----------------------
// // Provides global authentication state to the entire application.
// //
// // Today's scope (Day 1 - Routing only):
// //   - Creates context with: user, token, isAuthenticated
// //   - Exposes a custom hook `useAuth` for easy consumption
// //   - Does NOT implement login, logout, localStorage, or API calls
// //
// // The `isAuthenticated` flag is the key piece that PrivateRoute
// // and PublicRoute rely on to make routing decisions.
// //
// // To test protected routes manually, temporarily change the
// // initial value of `isAuthenticated` to `true`.

// import { createContext, useContext, useState } from "react";

// // 1. Create the context object.
// //    The default value here is just a fallback if someone calls useAuth()
// //    outside of an AuthProvider — in practice, this should never happen.
// const AuthContext = createContext(null);

// // 2. AuthProvider wraps the app (in App.jsx) and holds the auth state.
// //    Any component inside this tree can access the state via useAuth().
// export function AuthProvider({ children }) {
//   // `user` will eventually hold user profile data (name, email, role, etc.)
//   // For now it's null — no user is logged in.
//   const [user, setUser] = useState(null);

//   // `token` will eventually hold the JWT from the backend.
//   // For now it's null.
//   const [token, setToken] = useState(null);

//   // `isAuthenticated` is the derived flag the route guards read.
//   // It's false by default (no one is logged in).
//   // On future days, this will be set to true after a successful login API call.
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // The value object is what gets passed down to every consumer.
//   // We expose the state AND the setters so future login/logout functions
//   // can update the state from anywhere in the app.
//   const value = {
//     user,
//     setUser,
//     token,
//     setToken,
//     isAuthenticated,
//     setIsAuthenticated,
//   };

//   return (
//     // Provide the value to all child components.
//     <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
//   );
// }

// // 3. Custom hook for consuming the AuthContext.
// //    Usage in any component: const { isAuthenticated } = useAuth();
// //    This abstracts away the useContext call and gives a clean, readable API.
// export function useAuth() {
//   const context = useContext(AuthContext);

//   // Guard: if useAuth is called outside AuthProvider, throw a clear error.
//   // This prevents silent bugs that are hard to trace.
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }

//   return context;
// }

// src/context/AuthContext.jsx

import { createContext, useState, useEffect } from "react";
import { getToken, saveToken, removeToken } from "../utils/tokenHelper";

// WHY: Exported so useAuth.js can consume it via useContext.
// Components should never import this directly — always go through useAuth.
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // WHY: On app load, check if a token already exists in localStorage.
  // Without this, a user who refreshes the page would appear logged out
  // even though their JWT is still valid, forcing an unnecessary re-login.
  useEffect(() => {
    const existingToken = getToken();
    if (existingToken) {
      setToken(existingToken);
      setIsAuthenticated(true);
      // NOTE: We don't have the user's name/id stored separately from
      // login, so on refresh `user` stays null unless a "get profile"
      // API is added later. This is acceptable for Day 2 scope.
    }
  }, []);

  /**
   * Called after a successful login API response.
   * WHY: Centralizing this logic means LoginPage only needs to call
   * one function instead of manually managing token storage AND state.
   */
  const login = (newToken, newUser) => {
    saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  /**
   * Clears all auth state.
   * WHY: Must clear both the persisted token AND in-memory state,
   * otherwise PrivateRoute could still treat the user as authenticated
   * after logout (stale state bug).
   */
  const logout = () => {
    removeToken();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};