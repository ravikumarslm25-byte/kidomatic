import { useState, useEffect } from "react";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";

export const STATUS = {
  P:  { label: "Present",     color: "#16a34a", bg: "#dcfce7" },
  A:  { label: "Absent",      color: "#dc2626", bg: "#fee2e2" },
  L:  { label: "Leave",       color: "#d97706", bg: "#fef3c7" },
  H:  { label: "Half-day",    color: "#0284c7", bg: "#e0f2fe" },
  Lt: { label: "Late",        color: "#7c3aed", bg: "#ede9fe" },
  ML: { label: "Medical",     color: "#db2777", bg: "#fce7f3" },
  DC: { label: "Discontinue", color: "#4b5563", bg: "#f3f4f6" },
};
export const CODES = Object.keys(STATUS);
export const todayStr = () => new Date().toISOString().slice(0, 10);
export const monthStr = (d = new Date()) => d.toISOString().slice(0, 7);
export const daysInMonth = (ym) => { const [y, m] = ym.split("-").map(Number); return new Date(y, m, 0).getDate(); };
export const dateOf = (ym, day) => `${ym}-${String(day).padStart(2, "0")}`;
export const weekday = (ds) => new Date(ds).toLocaleDateString("en-IN", { weekday: "short" })[0];
export const isSunday = (ds) => new Date(ds).getDay() === 0;

export function activeSession(settings) {
  const now = new Date(); const hm = now.getHours() * 60 + now.getMinutes();
  const parse = (t, def) => { const [h, m] = (t || def).split(":").map(Number); return h * 60 + m; };
  if (hm < parse(settings?.morningCutoff, "10:00")) return "morning";
  if (hm >= parse(settings?.afternoonStart, "12:00")) return "afternoon";
  return "morning";
}
export function useAttendanceSettings() {
  const [settings, setSettings] = useState({ morningCutoff: "10:00", afternoonStart: "12:00" });
  const [id, setId] = useState(null);
  useEffect(() => { resourceService("attendanceSettings").list({}).then((d) => { const r = normList(d)[0]; if (r) { setSettings({ morningCutoff: r.morningCutoff || "10:00", afternoonStart: r.afternoonStart || "12:00" }); setId(r.id); } }).catch(() => {}); }, []);
  const saveSettings = async (next) => { const svc = resourceService("attendanceSettings"); if (id) await svc.update(id, next); else { const r = await svc.create(next); setId(r.id || r._id); } setSettings(next); };
  return { settings, saveSettings };
}
export const Legend = () => (
  <div className="flex flex-wrap gap-2.5">{CODES.map((c) => <span key={c} className="inline-flex items-center gap-1 text-[11px] text-navy/60"><span className="h-3 w-3 rounded" style={{ background: STATUS[c].color }} /> {STATUS[c].label} <b className="text-navy/40">({c})</b></span>)}</div>
);
export function Chip({ code }) {
  if (!code) return <span className="text-navy/15 text-xs">·</span>;
  const st = STATUS[code] || STATUS.P;
  return <span className="inline-grid place-items-center h-5 min-w-5 px-1 rounded text-[9px] font-bold" style={{ background: st.bg, color: st.color }}>{code}</span>;
}
// Row of status buttons for picking a code
export function StatusPicker({ value, onChange, size = "sm" }) {
  return (
    <div className="flex flex-wrap gap-1">
      {CODES.map((c) => {
        const on = value === c; const st = STATUS[c];
        return <button key={c} type="button" onClick={() => onChange(c)}
          className={`rounded-md font-bold transition ${size === "sm" ? "h-6 px-1.5 text-[10px]" : "h-8 px-2 text-xs"}`}
          style={on ? { background: st.color, color: "#fff" } : { background: st.bg, color: st.color }}>{c}</button>;
      })}
    </div>
  );
}
