import { USE_MOCK } from "@/config/app";
import { api } from "@/lib/http";
export const authService = {
  async login({ email, password }) {
    if (USE_MOCK) { await new Promise((r) => setTimeout(r, 450)); if (!email || !password) throw new Error("Enter your email and password"); return { token: "mock.platform", user: { name: "HackGeniX Admin", role: "Super Admin", email } }; }
    const { data } = await api.post("/auth/platform/login", { email, password });
    return data?.data ?? data;
  },
  async changePassword({ currentPassword, newPassword }) {
    if (USE_MOCK) { await new Promise((r) => setTimeout(r, 500)); if (!currentPassword || !newPassword) throw new Error("Fill both fields"); if (newPassword.length < 8) throw new Error("New password must be at least 8 characters"); return { ok: true }; }
    const { data } = await api.post("/auth/change-password", { currentPassword, newPassword });
    return data?.data ?? data;
  },
  async forgotPassword({ email }) {
    if (USE_MOCK) { await new Promise((r) => setTimeout(r, 600)); return { ok: true }; }
    const { data } = await api.post("/auth/forgot-password", { email, audience: "platform" });
    return data?.data ?? data;
  },
};
