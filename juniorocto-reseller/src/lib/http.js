import axios from "axios";
import { API_URL } from "@/config/app";
export const api = axios.create({ baseURL: API_URL, timeout: 15000 });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("jo_reseller_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use((r) => r, (err) => {
  const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || "Request failed";
  if (err?.response?.status === 401 && !location.pathname.startsWith("/login")) {
    localStorage.removeItem("jo_reseller_token"); location.assign("/login");
  }
  return Promise.reject(new Error(msg));
});
