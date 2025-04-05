import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import useAuthenticate from "./hooks/useAuthenticate";

const PrivateRoute = ({ children }: { children: any }) => {
  const isAuthenticated = useAuthenticate();

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center p-6">
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
      </Routes>
    </Router>
  );
};

export default App;
