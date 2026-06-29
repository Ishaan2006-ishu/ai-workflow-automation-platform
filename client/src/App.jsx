// App.jsx
// -------
// The root component of the entire application.
// Its only responsibilities are:
//   1. Provide the AuthContext to every component in the tree.
//   2. Render the AppRouter so routing can begin.
// Nothing else belongs here on Day 1.

import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    // AuthProvider wraps everything so any component can access
    // authentication state (user, token, isAuthenticated) via useAuth().
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
