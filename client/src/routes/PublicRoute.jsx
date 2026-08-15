// src/routes/PublicRoute.jsx

import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../hooks/useAuth";


const PublicRoute = () => {

  const {
    isAuthenticated,
    isAuthLoading,
  } = useAuth();


  if (isAuthLoading) {

    return (
      <div>
        Checking authentication...
      </div>
    );

  }


  if (isAuthenticated) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  }


  return <Outlet />;

};


export default PublicRoute;