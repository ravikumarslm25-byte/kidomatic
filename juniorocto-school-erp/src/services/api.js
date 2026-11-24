// Axios instance pointed at your Node/Express API.
// Used when VITE_USE_MOCK=false. Attaches the auth token and normalises errors.
import axios from "axios";
import { API_URL } from "@/config/app";

export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("jo_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // the API reports problems as { error: "..." }
    const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Request failed";
    if (err?.response?.status === 401) {
      localStorage.removeItem("jo_token");
      if (!location.pathname.startsWith("/app/login")) location.assign("/app/login");
    }
    const e = new Error(msg);
    e.status = err?.response?.status;
    return Promise.reject(e);
  }
);
