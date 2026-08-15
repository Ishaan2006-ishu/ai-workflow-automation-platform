// src/context/AuthContext.jsx

import {
  createContext,
  useState,
  useEffect,
} from "react";

import {
  getToken,
  saveToken,
  removeToken,
} from "../utils/tokenHelper";

// ============================================================
// AUTH CONTEXT
// ============================================================

export const AuthContext = createContext(null);


// ============================================================
// AUTH PROVIDER
// ============================================================

export const AuthProvider = ({ children }) => {

  // ==========================================================
  // AUTH STATE
  // ==========================================================

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);


  // ==========================================================
  // AUTH INITIALIZATION STATE
  // ==========================================================

  /*
    WHY:

    When the application starts, we don't immediately know
    whether the user is logged in.

    We need to check localStorage first.

    So:

    true  = still checking authentication
    false = authentication check completed
  */

  const [isAuthLoading, setIsAuthLoading] =
    useState(true);


  // ==========================================================
  // CHECK EXISTING TOKEN
  // ==========================================================

  useEffect(() => {

    const existingToken = getToken();

    if (existingToken) {

      setToken(existingToken);

      setIsAuthenticated(true);

    }

    /*
      Authentication check is now finished.
    */

    setIsAuthLoading(false);

  }, []);


  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = (newToken, newUser) => {

    saveToken(newToken);

    setToken(newToken);

    setUser(newUser);

    setIsAuthenticated(true);

  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {

    removeToken();

    setToken(null);

    setUser(null);

    setIsAuthenticated(false);

  };


  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  return (

    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAuthLoading,
        login,
        logout,
      }}
    >

      {children}

    </AuthContext.Provider>

  );
};