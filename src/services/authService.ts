import axios from "axios";
import { setTokens } from "@/utils/api/token";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// console.log(BASE_URL);

export const login = async (username: string, password: string) => {
  const res = await axios.post(`${BASE_URL}/api/token/`, {
    username,
    password,
  });
  const { access, refresh } = res.data;
  setTokens(access, refresh);
  return res.data;
};
