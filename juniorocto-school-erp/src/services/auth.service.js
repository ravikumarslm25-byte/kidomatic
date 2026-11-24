import { USE_MOCK } from "@/config/app";
import { api } from "./api";

// Mock auth accepts any non-empty credentials and returns a demo principal.
export const authService = {
  async login({ email, password, audience = "school" }) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      if (!email || !password) throw new Error("Enter your email and password");
      const who = audience === "parent" ? { name: "Ramesh Sharma", role: "Parent" } : audience === "student" ? { name: "Aarav Sharma", role: "Student" } : { name: "Priya Menon", role: "Principal" };
      return { token: "mock." + btoa(email).slice(0, 12), user: { ...who, audience, email, avatar: null } };
    }
    const { data } = await api.post(`/auth/${audience}/login`, { email, password });
    return data?.data ?? data;
  },
  async changePassword({ currentPassword, newPassword }) {
    if (USE_MOCK) { await new Promise((r) => setTimeout(r, 400)); if (currentPassword === newPassword) throw new Error("New password must differ"); return { ok: true }; }
    const { data } = await api.post("/auth/change-password", { currentPassword, newPassword });
    return data?.data ?? data;
  },
  async me() {
    if (USE_MOCK) return { name: "Priya Menon", role: "Principal" };
    const { data } = await api.get("/auth/me");
    return data?.data ?? data;
  },
};
