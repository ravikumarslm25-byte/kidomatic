import { useEffect } from "react";
import landscape from "@/assets/logo-landscape.png";
import OctoMark from "./OctoMark";
import { useBranding } from "@/store/branding";

function brandAssets() { try { return JSON.parse(localStorage.getItem("jo_brand_assets") || "{}"); } catch { return {}; } }

// On light surfaces we use the landscape lockup (or the school's uploaded logo).
// On dark surfaces (navy sidebar) we show the icon on a light chip + wordmark.
export default function Logo({ compact = false, dark = false, markSize = 34 }) {
  const b = useBranding();
  const name = b?.name || "KidoMatic";
  const [first, ...rest] = name.split(" ");
  const assets = brandAssets();

  useEffect(() => {
    if (!assets.iconUrl) return;
    let link = document.querySelector("link[rel='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = assets.iconUrl;
  }, [assets.iconUrl]);

  if (!dark && !compact) {
    return <img src={assets.logoUrl || landscape} alt={name} style={{ height: markSize + 14 }} className="w-auto select-none object-contain" draggable={false} />;
  }
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="grid place-items-center rounded-2xl bg-white shadow-soft overflow-hidden" style={{ width: markSize + 12, height: markSize + 12 }}>
        {assets.iconUrl ? <img src={assets.iconUrl} alt="" style={{ width: markSize, height: markSize }} className="object-contain" /> : <OctoMark size={markSize} />}
      </div>
      {!compact && (
        <div className="leading-none font-display font-semibold" style={{ fontSize: 20 }}>
          <span style={{ color: dark ? "#EDF3FA" : "var(--jo-blue)" }}>{first}</span>
          <span style={{ color: "var(--jo-coral)" }}>{rest.join(" ")}</span>
        </div>
      )}
    </div>
  );
}
