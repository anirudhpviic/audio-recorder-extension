import axios from "axios";
import { getToken } from "../utils/get-token";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URI}`,
});

// Attach Access Token to every request
api.interceptors.request.use(async (config) => {
  const token = await getToken("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      // Access token expired
      const refreshToken = await getToken("refreshToken");

      if (!refreshToken) {
        console.error("No refresh token, logging out");
        chrome.storage.local.clear(() => {
          chrome.runtime.sendMessage({ action: "LOGOUT" }); // Notify React to redirect
        });
        return Promise.reject(error);
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

        // Retry failed request with new access token
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(error.config);
      } catch (refreshError) {
        console.error("Refresh token expired, logging out");
        chrome.storage.local.clear(() => {
          console.log("Cleared local storage");
          window.location.hash = "#/login";
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
