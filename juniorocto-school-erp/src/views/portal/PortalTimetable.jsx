import { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { usePortal } from "@/store/portal";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DEFAULT_SLOTS = [
  { label: "Period 1", type: "period", start: "09:00", end: "09:45" },
  { label: "Period 2", type: "period", start: "09:45", end: "10:30" },
  { label: "Break", type: "break", start: "10:30", end: "10:45" },
  { label: "Period 3", type: "period", start: "10:45", end: "11:30" },
  { label: "Period 4", type: "period", start: "11:30", end: "12:15" },
  { label: "Lunch", type: "lunch", start: "12:15", end: "13:00" },
  { label: "Period 5", type: "period", start: "13:00", end: "13:45" },
  { label: "Period 6", type: "period", start: "13:45", end: "14:30" },
];

export default function PortalTimetable() {
  const { child } = usePortal();
  const [doc, setDoc] = useState(null); const [slots, setSlots] = useState(DEFAULT_SLOTS); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!child) return;
    setLoading(true);
    Promise.all([resourceService("timetable").list({ studentId: child.studentId }), resourceService("timingProfiles").list({}).catch(() => [])])
      .then(([tt, tp]) => {
        const docs = normList(tt);
        const found = docs.find((d) => d.klass === child.klass && (d.section || "") === (child.section || "")) || docs.find((d) => d.klass === child.klass) || docs[0] || null;
        setDoc(found);
        const prof = normList(tp).find((p) => (Array.isArray(p.classes) ? p.classes : []).includes(child.klass));
        setSlots(prof?.slots?.length ? prof.slots : DEFAULT_SLOTS);
      }).catch(() => setDoc(null)).finally(() => setLoading(false));
  }, [child?.studentId]);

  const grid = doc?.grid || {};
  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  return (
    <div>
      <PageHeader title="Timetable" icon={Clock} subtitle={`${child?.klass || ""}${child?.section ? "-" + child.section : ""} weekly schedule`} />
      {!doc ? <Card className="py-14 text-center text-navy/40">No timetable published for this class yet.</Card> : (
        <Card pad={false} className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead><tr className="border-b border-navy/8"><th className="px-3 py-3 text-left text-xs uppercase text-navy/40 w-28">Time</th>{DAYS.map((d) => <th key={d} className="px-3 py-3 text-xs uppercase text-navy/40">{d}</th>)}</tr></thead>
            <tbody>
              {slots.map((slot, si) => slot.type !== "period" ? (
                <tr key={si}><td colSpan={DAYS.length + 1} className="px-3 py-1.5 text-center text-xs font-semibold" style={{ background: slot.type === "lunch" ? "#FFF1E8" : "#FEF6E7", color: slot.type === "lunch" ? "#E85410" : "#B45309" }}>{slot.label} · {slot.start}–{slot.end}</td></tr>
              ) : (
                <tr key={si} className="border-b border-navy/5">
                  <td className="px-3 py-2.5 align-top"><p className="text-xs font-semibold text-navy">{slot.label}</p><p className="text-[10px] text-navy/40">{slot.start}–{slot.end}</p></td>
                  {DAYS.map((d, di) => { const c = grid[`${di}-${si}`]; return (
                    <td key={d} className="px-3 py-2.5 text-center">{c?.subject ? <div className="rounded-lg bg-royal-50 px-2 py-1.5"><p className="text-[13px] font-medium text-navy">{c.subject}</p>{c.teacher && <p className="text-[10px] text-navy/45">{c.teacher}</p>}</div> : <span className="text-navy/20">—</span>}</td>
                  ); })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
