import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./token";

// Event emitter for token refresh notifications
class TokenRefreshEmitter extends EventTarget {
  emitTokenRefresh() {
    this.dispatchEvent(new CustomEvent('tokenRefresh'));
  }
}

export const tokenRefreshEmitter = new TokenRefreshEmitter();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    console.log(error);
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(
          "https://freight-tiger-backend.thetailoredai.co/api/token/",
          {
            username: "admin",
            password: "admin",
          }
        );

        const { access, refresh } = response.data;
        setTokens(access, refresh);

        // Emit token refresh event to notify components
        tokenRefreshEmitter.emitTokenRefresh();

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.log(refreshError);
        clearTokens();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
