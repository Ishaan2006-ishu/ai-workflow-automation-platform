// src/routes/PrivateRoute.jsx

import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../hooks/useAuth";


const PrivateRoute = () => {

  const {
    isAuthenticated,
    isAuthLoading,
  } = useAuth();


  // ==========================================================
  // WAIT FOR AUTH INITIALIZATION
  // ==========================================================

  /*
    Don't redirect while we are still checking
    localStorage for an existing token.

    Otherwise:

    isAuthenticated = false
          ↓
    /history → /login
          ↓
    token found
          ↓
    /login → /dashboard

    This is the bug we just fixed.
  */

  if (isAuthLoading) {

    return (
      <div>
        Checking authentication...
      </div>
    );

  }


  // ==========================================================
  // NOT AUTHENTICATED
  // ==========================================================

  if (!isAuthenticated) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  // ==========================================================
  // AUTHENTICATED
  // ==========================================================

  return <Outlet />;

};


export default PrivateRoute;