// src/App.jsx

import { AuthProvider } from "./context/AuthContext.jsx";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;