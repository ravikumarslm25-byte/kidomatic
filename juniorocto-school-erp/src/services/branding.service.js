import { USE_MOCK } from "@/config/app";
import { api } from "./api";

// Demo tenant themes (mock mode). Live mode calls the API's public resolver,
// which cascades platform ◀ reseller ◀ school.
const THEMES = {
  sunrise:   { name: "Sunrise Public School",     logoUrl: "", colors: { navy: "#14335E", blue: "#1651A3", coral: "#E85410", sea: "#446D98", cream: "#F2F6FC" } },
  greenwood: { name: "Greenwood Montessori",      logoUrl: "", colors: { navy: "#123A2A", blue: "#2E7D5B", coral: "#F2A007", sea: "#6BA583", cream: "#F0F7F2" } },
  cambridge: { name: "Cambridge World Academy",   logoUrl: "", colors: { navy: "#241645", blue: "#6B3FA0", coral: "#E0533F", sea: "#8A6FB0", cream: "#F5F2FB" } },
};

export const brandingService = {
  async fetch(tenant) {
    if (!tenant) return null;
    if (USE_MOCK) { await new Promise((r) => setTimeout(r, 120)); return THEMES[tenant] || null; }
    try { const { data } = await api.get(`/public/branding/${tenant}`); return data?.data ?? data; } catch { return null; }
  },
};
