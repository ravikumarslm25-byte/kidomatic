import { cn } from "@/lib/cn";
import { num } from "@/lib/format";
export default function StatCard({ label, value, sub, icon: Icon, trend, tone = "royal", format = "num" }) {
  const tones = {
    royal: "text-royal bg-royal-100",
    coral: "text-coral-600 bg-coral-100",
    sea: "text-sea bg-sea-100",
    navy: "text-navy bg-white/70",
  };
  const val = format === "raw" ? value : num(value);
  return (
    <div className="glass rounded-xl2 p-5 shadow-glass relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/45">{label}</p>
          <p className="mt-2 font-display text-[26px] leading-none text-navy">{val}</p>
          {sub && <p className="mt-1.5 text-xs text-navy/50">{sub}</p>}
        </div>
        {Icon && <div className={cn("grid place-items-center h-11 w-11 rounded-2xl", tones[tone])}><Icon size={20} /></div>}
      </div>
      {trend != null && (
        <p className={cn("mt-3 text-xs font-semibold", trend >= 0 ? "text-emerald-500" : "text-coral-600")}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last month
        </p>
      )}
    </div>
  );
}
