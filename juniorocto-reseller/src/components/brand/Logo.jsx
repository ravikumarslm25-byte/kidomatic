import landscape from "@/assets/logo-landscape.png";
import OctoMark from "./OctoMark";
export default function Logo({ dark = false, compact = false, markSize = 32, tag = "Partner Portal" }) {
  if (!dark && !compact) return (
    <div className="flex items-center gap-2">
      <img src={landscape} alt="KidoMatic" style={{ height: markSize + 10 }} className="w-auto" />
      {tag && <span className="text-[10px] font-bold uppercase tracking-wide text-coral-600 bg-coral-100 rounded-full px-2 py-0.5">{tag}</span>}
    </div>
  );
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="grid place-items-center rounded-2xl bg-white shadow-soft" style={{ width: markSize + 12, height: markSize + 12 }}><OctoMark size={markSize} /></div>
      {!compact && (
        <div className="leading-none">
          <div className="font-display font-semibold" style={{ fontSize: 19 }}>
            <span style={{ color: dark ? "#EDF3FA" : "var(--jo-blue)" }}>Junior</span><span style={{ color: "var(--jo-coral)" }}>Octo</span>
          </div>
          {tag && <div className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: dark ? "rgba(255,255,255,.55)" : "var(--jo-coral)" }}>{tag}</div>}
        </div>
      )}
    </div>
  );
}
