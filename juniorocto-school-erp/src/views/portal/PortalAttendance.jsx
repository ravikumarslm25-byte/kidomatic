import { useState, useEffect, useMemo } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight, Check, X, Clock } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { usePortal } from "@/store/portal";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const isP = (v) => /present|^p$/i.test(v || "");
const isA = (v) => /absent|^a$/i.test(v || "");
const isL = (v) => /leave|late|half/i.test(v || "");
const pill = (v) => {
  if (!v) return { c: "bg-navy/5 text-navy/30", t: "—" };
  if (isP(v)) return { c: "bg-emerald-100 text-emerald-700", t: "Present" };
  if (isA(v)) return { c: "bg-coral-100 text-coral-600", t: "Absent" };
  if (isL(v)) return { c: "bg-amber-100 text-amber-700", t: v };
  return { c: "bg-navy/10 text-navy/60", t: v };
};

function Ring({ pct }) {
  const r = 52, C = 2 * Math.PI * r, off = C - (pct / 100) * C;
  const color = pct >= 85 ? "#10B981" : pct >= 70 ? "#F59E0B" : "#EF4444";
  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(20,51,94,.08)" strokeWidth="12" />
      <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off} transform="rotate(-90 65 65)" style={{ transition: "stroke-dashoffset .6s" }} />
      <text x="65" y="60" textAnchor="middle" className="fill-navy font-display" style={{ fontSize: 26 }}>{pct}%</text>
      <text x="65" y="80" textAnchor="middle" className="fill-navy/45" style={{ fontSize: 11 }}>present</text>
    </svg>
  );
}

export default function PortalAttendance() {
  const { child } = usePortal();
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  const now = new Date(); const [mo, setMo] = useState(now.getMonth()); const [yr, setYr] = useState(now.getFullYear());

  useEffect(() => {
    if (!child) return; setLoading(true);
    resourceService("attendance").list({ studentId: child.studentId }).then((r) => setRows(normList(r))).catch(() => setRows([])).finally(() => setLoading(false));
  }, [child?.studentId]);

  const monthRows = useMemo(() => rows.filter((r) => { const d = r.date ? new Date(r.date) : null; return d && d.getMonth() === mo && d.getFullYear() === yr; }).sort((a, b) => (b.date || "").localeCompare(a.date || "")), [rows, mo, yr]);
  const stats = useMemo(() => {
    let present = 0, total = 0, absent = 0, leave = 0;
    monthRows.forEach((r) => ["morning", "afternoon"].forEach((s) => { if (r[s]) { total++; if (isP(r[s])) present++; else if (isA(r[s])) absent++; else if (isL(r[s])) leave++; } }));
    return { present, total, absent, leave, pct: total ? Math.round((present / total) * 100) : 0 };
  }, [monthRows]);
  const prev = () => { if (mo === 0) { setMo(11); setYr(yr - 1); } else setMo(mo - 1); };
  const next = () => { if (mo === 11) { setMo(0); setYr(yr + 1); } else setMo(mo + 1); };

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  return (
    <div>
      <PageHeader title="Attendance" icon={CalendarCheck} subtitle={`${child?.studentName || ""}'s attendance record`} />

      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="h-9 w-9 rounded-lg glass shadow-glass grid place-items-center text-navy/60"><ChevronLeft size={18} /></button>
        <div className="flex items-center gap-2">
          <select value={mo} onChange={(e) => setMo(+e.target.value)} className="h-10 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm font-medium text-navy">{MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}</select>
          <select value={yr} onChange={(e) => setYr(+e.target.value)} className="h-10 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm font-medium text-navy">{[yr - 2, yr - 1, now.getFullYear(), now.getFullYear() + 1].filter((v, i, a) => a.indexOf(v) === i).map((y) => <option key={y} value={y}>{y}</option>)}</select>
        </div>
        <button onClick={next} className="h-9 w-9 rounded-lg glass shadow-glass grid place-items-center text-navy/60"><ChevronRight size={18} /></button>
      </div>

      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Ring pct={stats.pct} />
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {[["Present", stats.present, "emerald", Check], ["Absent", stats.absent, "coral", X], ["Leave / Late", stats.leave, "amber", Clock], ["Sessions", stats.total, "royal", CalendarCheck]].map(([l, v, tone, Icon]) => {
              const map = { emerald: "bg-emerald-50 text-emerald-600", coral: "bg-coral-50 text-coral-600", amber: "bg-amber-50 text-amber-600", royal: "bg-royal-50 text-royal" };
              return (
                <div key={l} className="rounded-xl border border-navy/8 bg-white/50 p-3 text-center">
                  <span className={`h-8 w-8 rounded-lg grid place-items-center mx-auto mb-1 ${map[tone]}`}><Icon size={15} /></span>
                  <p className="font-display text-xl text-navy">{v}</p><p className="text-[11px] text-navy/45">{l}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card pad={false}>
        <div className="px-5 pt-4 pb-2 flex items-center justify-between"><h3 className="font-display text-navy">Daily register — {MONTHS[mo]} {yr}</h3><span className="text-xs text-navy/45">{monthRows.length} day{monthRows.length !== 1 ? "s" : ""}</span></div>
        <div className="divide-y divide-navy/6">
          {monthRows.map((r, i) => {
            const dd = new Date(r.date); const am = pill(r.morning), pm = pill(r.afternoon);
            const dayOk = isP(r.morning) && isP(r.afternoon);
            return (
              <div key={r.id || i} className="flex items-center gap-3 px-5 py-3">
                <div className={`h-11 w-11 rounded-xl grid place-items-center shrink-0 ${dayOk ? "bg-emerald-100 text-emerald-700" : (isA(r.morning) || isA(r.afternoon)) ? "bg-coral-100 text-coral-600" : "bg-amber-100 text-amber-700"}`}>
                  <div className="text-center leading-none"><p className="font-display text-base">{dd.getDate()}</p><p className="text-[9px]">{dd.toLocaleDateString("en-IN", { weekday: "short" })}</p></div>
                </div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy">{dd.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</p></div>
                <div className="flex gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${am.c}`}>AM · {am.t}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${pm.c}`}>PM · {pm.t}</span>
                </div>
              </div>
            );
          })}
          {monthRows.length === 0 && <p className="px-5 py-14 text-center text-navy/40 text-sm">No attendance recorded for {MONTHS[mo]} {yr}.</p>}
        </div>
      </Card>
    </div>
  );
}
