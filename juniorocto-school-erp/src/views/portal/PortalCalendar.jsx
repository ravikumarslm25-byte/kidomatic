import { useState, useEffect, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CAT_COLOR = { Holiday: "#F26A35", Exam: "#F59E0B", PTM: "#1651A3", Event: "#4FA8C4", Activity: "#4FA8C4", Sports: "#10B981", Meeting: "#64748B", Deadline: "#EF4444" };
const key = (d) => new Date(d).toISOString().slice(0, 10);
const startOf = (e) => e.start || e.date;

export default function PortalCalendar() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  const now = new Date(); const [mo, setMo] = useState(now.getMonth()); const [yr, setYr] = useState(now.getFullYear()); const [selDay, setSelDay] = useState(null);
  useEffect(() => {
    Promise.all([resourceService("events").list({}).catch(() => []), resourceService("holidays").list({}).catch(() => [])])
      .then(([e, h]) => setRows([...normList(e), ...normList(h).map((x) => ({ ...x, category: "Holiday", start: x.date, title: x.name || x.title }))]))
      .catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  const byDate = useMemo(() => { const m = {}; rows.forEach((e) => { const s = startOf(e); if (s) (m[key(s)] = m[key(s)] || []).push(e); }); return m; }, [rows]);
  const first = new Date(yr, mo, 1).getDay(); const days = new Date(yr, mo + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const prev = () => { if (mo === 0) { setMo(11); setYr(yr - 1); } else setMo(mo - 1); setSelDay(null); };
  const next = () => { if (mo === 11) { setMo(0); setYr(yr + 1); } else setMo(mo + 1); setSelDay(null); };
  const monthEvents = rows.filter((e) => { const s = startOf(e); const d = s ? new Date(s) : null; return d && d.getMonth() === mo && d.getFullYear() === yr; }).sort((a, b) => new Date(startOf(a)) - new Date(startOf(b)));
  const selEvents = selDay ? (byDate[key(new Date(yr, mo, selDay))] || []) : monthEvents;

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  return (
    <div>
      <PageHeader title="Calendar & Events" icon={CalendarDays} subtitle="School calendar" />
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prev} className="h-9 w-9 rounded-lg hover:bg-white/60 grid place-items-center text-navy/60"><ChevronLeft size={18} /></button>
            <p className="font-display text-lg text-navy">{MONTHS[mo]} {yr}</p>
            <button onClick={next} className="h-9 w-9 rounded-lg hover:bg-white/60 grid place-items-center text-navy/60"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1">{WD.map((d) => <div key={d} className="text-center text-[11px] font-semibold text-navy/40 py-1">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const evs = byDate[key(new Date(yr, mo, day))] || [];
              const isToday = day === now.getDate() && mo === now.getMonth() && yr === now.getFullYear();
              return (
                <button key={i} onClick={() => setSelDay(selDay === day ? null : day)} className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-start text-sm relative ${selDay === day ? "bg-royal-100" : "hover:bg-white/60"} ${isToday ? "ring-1 ring-royal" : ""}`}>
                  <span className={`${isToday ? "text-royal font-bold" : "text-navy/70"}`}>{day}</span>
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">{evs.slice(0, 3).map((e, j) => <span key={j} className="h-1.5 w-1.5 rounded-full" style={{ background: CAT_COLOR[e.category] || "#4FA8C4" }} />)}</div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card pad={false}>
          <div className="px-5 pt-4 pb-2"><h3 className="font-display text-navy">{selDay ? `${MONTHS[mo]} ${selDay}` : "This month"}</h3></div>
          <div className="divide-y divide-navy/6 max-h-[420px] overflow-y-auto">
            {selEvents.map((e, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <span className="h-9 w-9 rounded-xl grid place-items-center shrink-0 text-white" style={{ background: CAT_COLOR[e.category] || "#4FA8C4" }}><CalendarDays size={16} /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy">{e.title}</p>
                  <p className="text-[11px] text-navy/45">{new Date(startOf(e)).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}{e.startTime ? ` · ${e.startTime}` : ""}{e.location ? ` · ${e.location}` : ""}</p>
                </div>
                {e.category && <Badge color="slate">{e.category}</Badge>}
              </div>
            ))}
            {selEvents.length === 0 && <p className="px-5 py-10 text-center text-navy/40 text-sm">Nothing on this {selDay ? "day" : "month"}.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
