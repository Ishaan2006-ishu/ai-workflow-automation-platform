// // src/routes/PrivateRoute.jsx

// import { Navigate } from "react-router-dom";
// import useAuth from "../hooks/useAuth";

// /**
//  * Guards routes that require authentication.
//  * WHY: Checking isAuthenticated here (rather than inside each page
//  * component) means the redirect happens before the protected page
//  * even mounts — preventing a flash of protected content or a failed
//  * API call due to a missing token.
//  */
// const PrivateRoute = ({ children }) => {
//   const { isAuthenticated } = useAuth();

//   if (!isAuthenticated) {
//     // WHY: `replace` prevents the protected route from staying in
//     // browser history, so the user can't hit "back" and land on a
//     // page that immediately redirects them again.
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default PrivateRoute;

// src/routes/PrivateRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * Protects all child routes.
 */
const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;