// src/hooks/useAuth.js

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Custom hook for accessing authentication state.
 * WHY: Throwing here instead of silently returning null/undefined
 * means a developer immediately sees a clear error in the console
 * ("useAuth must be used within an AuthProvider") instead of a vague
 * "Cannot read property 'login' of null" deep inside a component.
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;