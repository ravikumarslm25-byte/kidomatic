import { USE_MOCK } from "@/config/app";
import { api } from "@/lib/http";
export const authService = {
  async login({ email, password }) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 450));
      if (!email || !password) throw new Error("Enter your email and password");
      return { token: "mock.reseller", user: { name: "Acme Admin", role: "Reseller Admin", email, reseller: "Acme EdTech" } };
    }
    const { data } = await api.post("/auth/reseller/login", { email, password });
    return data?.data ?? data;
  },
};
