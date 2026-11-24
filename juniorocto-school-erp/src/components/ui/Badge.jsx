import { cn } from "@/lib/cn";
const MAP = {
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  amber: "bg-amber-50 text-amber-600 ring-amber-200",
  coral: "bg-coral-100 text-coral-600 ring-coral/30",
  blue: "bg-royal-100 text-royal ring-royal/20",
  slate: "bg-slate-100 text-slate-500 ring-slate-200",
};
const tone = (v = "") => {
  const s = String(v).toLowerCase();
  if (["active","paid","published","achieved","confirmed","delivered","completed","income","on route"].some((x) => s.includes(x))) return "emerald";
  if (["due","pending","draft","scheduled","assigned","idle","new"].some((x) => s.includes(x))) return "amber";
  if (["overdue","inactive","lost","cancelled","no-show","expense","needs support"].some((x) => s.includes(x))) return "coral";
  if (["partial","emerging","ongoing","contacted","application","visit","review","k-12"].some((x) => s.includes(x))) return "blue";
  return "slate";
};
export default function Badge({ children, color }) {
  const c = color || tone(children);
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", MAP[c])}>{children}</span>;
}
