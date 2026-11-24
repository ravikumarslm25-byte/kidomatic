import { useState, useEffect, useMemo } from "react";
import { CalendarRange, Clock, BookOpen, Layers } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import RefSelect from "@/components/ui/RefSelect";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function StaffTimetable() {
  const [staff, setStaff] = useState("");
  const [docs, setDocs] = useState([]);
  useEffect(() => { resourceService("timetable").list({}).then((d) => setDocs(normList(d))).catch(() => {}); }, []);

  // Build this teacher's week from every class timetable
  const { grid, maxP, stats } = useMemo(() => {
    const g = {}; let maxP = 5; const classesSet = new Set(); const subjectsSet = new Set(); let assigned = 0;
    if (staff) {
      docs.forEach((doc) => {
        const gr = doc.grid || {};
        Object.entries(gr).forEach(([key, cell]) => {
          if (cell?.teacher === staff) {
            const [di, pi] = key.split("-").map(Number);
            g[`${di}-${pi}`] = { klass: doc.klass + (doc.section ? " " + doc.section : ""), subject: cell.subject };
            maxP = Math.max(maxP, pi); classesSet.add(doc.klass + (doc.section || "")); if (cell.subject) subjectsSet.add(cell.subject); assigned++;
          }
        });
      });
    }
    const periods = maxP + 1; const totalSlots = DAYS.length * periods;
    return { grid: g, maxP, stats: { assigned, free: totalSlots - assigned, freeMonth: (totalSlots - assigned) * 4, classes: classesSet.size, subjects: subjectsSet.size, periods } };
  }, [staff, docs]);

  return (
    <div>
      <PageHeader title="Staff Timetable" icon={CalendarRange} subtitle="Which teacher takes which class · workload & free periods" />
      <div className="glass rounded-xl2 shadow-glass p-4 mb-4 max-w-sm">
        <label className="block text-xs font-semibold text-navy/60 mb-1.5">Staff</label>
        <RefSelect resource="staff" labelKey="name" value={staff} onChange={setStaff} placeholder="Select a teacher…" />
      </div>

      {!staff ? (
        <Card><div className="py-10 text-center text-navy/50 text-sm">Select a teacher to see their weekly timetable and load.</div></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Stat icon={Clock} label="Periods / week" value={stats.assigned} tone="royal" />
            <Stat icon={Clock} label="Free / week" value={stats.free} tone="green" />
            <Stat icon={Layers} label="Classes taught" value={stats.classes} tone="coral" />
            <Stat icon={BookOpen} label="Subjects" value={stats.subjects} tone="navy" />
          </div>
          <p className="text-xs text-navy/45 mb-3">≈ {stats.freeMonth} free periods / month — useful when re-assigning cover for leave.</p>

          <Card pad={false} className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead><tr className="border-b border-navy/8">
                <th className="px-4 py-3 text-xs font-semibold uppercase text-navy/40 text-left">Day</th>
                {Array.from({ length: stats.periods }, (_, i) => <th key={i} className="px-3 py-3 text-xs font-semibold uppercase text-navy/40">P{i + 1}</th>)}
              </tr></thead>
              <tbody>
                {DAYS.map((d, di) => (
                  <tr key={d} className="border-b border-navy/5 last:border-0">
                    <td className="px-4 py-2 font-semibold text-navy/70">{d}</td>
                    {Array.from({ length: stats.periods }, (_, pi) => { const c = grid[`${di}-${pi}`]; return (
                      <td key={pi} className="px-2 py-2 text-center">
                        {c ? <div className="rounded-xl bg-royal-100 text-royal px-2 py-1.5"><div className="font-semibold text-xs">{c.klass}</div><div className="text-[10px] text-royal/70">{c.subject}</div></div>
                           : <span className="text-navy/25 text-xs">Free</span>}
                      </td>
                    ); })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
const TONE = { royal: "#1651A3", green: "#16a34a", coral: "#E85410", navy: "#14335E" };
const Stat = ({ icon: Icon, label, value, tone }) => (
  <div className="glass rounded-xl2 shadow-glass p-4 flex items-center gap-3">
    <div className="h-10 w-10 rounded-xl grid place-items-center text-white" style={{ background: TONE[tone] }}><Icon size={18} /></div>
    <div><p className="font-display text-2xl text-navy leading-none">{value}</p><p className="text-xs text-navy/50 mt-1">{label}</p></div>
  </div>
);
