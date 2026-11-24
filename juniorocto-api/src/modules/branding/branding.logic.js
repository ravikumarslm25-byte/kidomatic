import { PLATFORM_BRANDING } from "../../config/branding.js";

// Cascade: platform default  ◀  reseller defaults  ◀  school overrides.
// Colours deep-merge; name falls back school → reseller → platform; logo likewise.
export function resolveBranding(school = {}, reseller = {}, platform = PLATFORM_BRANDING) {
  const sb = school.branding || {};
  const rb = reseller.branding || {};
  const colors = { ...platform.colors, ...(rb.colors || {}), ...(sb.colors || {}) };
  return {
    name: sb.name || school.name || rb.name || platform.name,
    logoUrl: sb.logoUrl || rb.logoUrl || platform.logoUrl || "",
    colors,
    source: sb.name || sb.colors ? "school" : rb.name || rb.colors ? "reseller" : "platform",
  };
}
