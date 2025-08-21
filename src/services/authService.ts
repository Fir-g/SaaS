import axios from "axios";
import { setTokens } from "@/utils/api/token";

const AUTH_URL = "https://freight-tiger-backend.thetailoredai.co/api/token/";

export const login = async (username: string, password: string) => {
  const res = await axios.post(AUTH_URL, {
    username,
    password,
  });
  const { access, refresh } = res.data;
  setTokens(access, refresh);
  return res.data;
};

let authHeartbeatInterval: number | null = null;

export const startAuthHeartbeat = () => {
  if (authHeartbeatInterval) return;
  // Refresh the access token every minute by re-logging in
  authHeartbeatInterval = window.setInterval(async () => {
    try {
      await login("admin", "admin");
    } catch (e) {
      // swallow; interceptor will handle redirect if really unauthorized
      console.error("Auth heartbeat failed", e);
    }
  }, 60 * 1000);
};

export const stopAuthHeartbeat = () => {
  if (authHeartbeatInterval) {
    clearInterval(authHeartbeatInterval);
    authHeartbeatInterval = null;
  }
};