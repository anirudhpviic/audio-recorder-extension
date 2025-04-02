import { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";

const PrivateRoute = ({ children }: { children: any }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<null | boolean>(null);

  useEffect(() => {
    chrome.storage.local.get("accessToken", (result) => {
      setIsAuthenticated(!!result.accessToken);
    });
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
