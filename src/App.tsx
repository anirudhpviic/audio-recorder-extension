import { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const PrivateRoute = ({ children }: { children: any }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<null | boolean>(null);

  const getToken = async (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    });
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        chrome.storage.local.clear();
        setIsAuthenticated(false);
        return;
      }

      const decoded: { exp: number } = jwtDecode(accessToken);
      const isExpired = decoded.exp * 1000 - 5 * 60 * 1000 < Date.now(); // Subtract 5 minutes from expiration time

      if (!isExpired) {
        setIsAuthenticated(true);
        return;
      }

      const refreshToken = await getToken("refreshToken");

      if (!refreshToken) {
        chrome.storage.local.clear();
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URI}/auth/refresh-tokens`,
          { refreshToken }
        );

        const newAccessToken = res?.data?.data?.accessToken;
        const newRefreshToken = res?.data?.data?.refreshToken;

        await chrome.storage.local.set({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        setIsAuthenticated(true);
      } catch (error) {
        chrome.storage.local.clear();
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center">
        <h1>Loading...</h1>
      </div>
    );
  }

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
        {/* <Route path="/" element={<Home />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
