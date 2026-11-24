import { createContext, useContext, useEffect, useState } from "react";
import { BRANDING_DEFAULT } from "@/config/app";
import { brandingService } from "@/services/branding.service";

const Ctx = createContext(null);
export const useBranding = () => useContext(Ctx);

// Resolve the current tenant: ?tenant= (sticky), else a real subdomain, else none.
function currentTenant() {
  const q = new URLSearchParams(location.search).get("tenant");
  if (q) { localStorage.setItem("jo_tenant", q); return q; }
  const saved = localStorage.getItem("jo_tenant");
  if (saved) return saved;
  const host = location.hostname;
  const sub = host.split(".")[0];
  if (host.includes(".") && !["localhost", "app", "www", "127"].includes(sub)) return sub;
  return "";
}

function applyVars(colors = {}) {
  const root = document.documentElement.style;
  const map = { navy: "--jo-navy", blue: "--jo-blue", coral: "--jo-coral", sea: "--jo-sea", cream: "--jo-cream" };
  for (const [k, v] of Object.entries(map)) if (colors[k]) root.setProperty(v, colors[k]);
  if (colors.blue && colors.coral) root.setProperty("--jo-grad", `linear-gradient(135deg, ${colors.blue} 0%, ${colors.coral} 100%)`);
}

// White-label provider: fetches the tenant's brand at boot and themes the whole app.
export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(() => {
    try { return { ...BRANDING_DEFAULT, ...JSON.parse(localStorage.getItem("jo_branding") || "{}") }; }
    catch { return BRANDING_DEFAULT; }
  });

  useEffect(() => {
    const tenant = currentTenant();
    if (!tenant) return;
    brandingService.fetch(tenant).then((b) => {
      if (!b) return;
      const merged = {
        ...BRANDING_DEFAULT,
        name: b.name || BRANDING_DEFAULT.name,
        logoUrl: b.logoUrl || "",
        colors: { ...BRANDING_DEFAULT.colors, ...(b.colors || {}) },
        school: { ...BRANDING_DEFAULT.school, name: b.name || BRANDING_DEFAULT.school.name },
      };
      setBranding(merged);
      localStorage.setItem("jo_branding", JSON.stringify(merged));
    });
  }, []);

  useEffect(() => { applyVars(branding.colors); }, [branding]);

  return <Ctx.Provider value={branding}>{children}</Ctx.Provider>;
}
