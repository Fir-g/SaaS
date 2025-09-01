import axios from "axios";

const qrApi = axios.create({
  baseURL: import.meta.env.VITE_QR_API_BASE_URL,
  timeout: 10000,
});

qrApi.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message;
    return Promise.reject(new Error(message));
  }
);

export default qrApi;
