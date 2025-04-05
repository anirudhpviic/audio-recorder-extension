import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { getToken } from "../utils/get-token";

const useAuthenticate = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<null | boolean>(null);

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

    // checkAuthentication();

    setTimeout(checkAuthentication, 10000);
  }, []);

  return isAuthenticated;
};

export default useAuthenticate;
