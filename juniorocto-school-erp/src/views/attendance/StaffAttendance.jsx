import { useState, useEffect, useMemo } from "react";
import { UserCheck, Download, History, ClipboardCheck, Fingerprint } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";
import { Legend, Chip, StatusPicker, todayStr, monthStr, daysInMonth, dateOf, weekday, isSunday, activeSession, useAttendanceSettings } from "./attendanceKit";

const att = resourceService("staffAttendance");
const logSvc = resourceService("attendanceLog");

export default function StaffAttendance() {
  const toast = useToast();
  const { user } = useAuth();
  const { settings } = useAttendanceSettings();
  const [month, setMonth] = useState(monthStr());
  const [staff, setStaff] = useState([]);
  const [recs, setRecs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mark, setMark] = useState(null);
  const [edit, setEdit] = useState(null);
  const [showLog, setShowLog] = useState(false);

  const load = async () => { setLoading(true); const [ss, rr] = await Promise.all([resourceService("staff").list({}), att.list({})]); setStaff(normList(ss).filter((s) => (s.status || "Active") === "Active")); setRecs(normList(rr).filter((r) => r.date?.startsWith(month))); setLoading(false); };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [month]);
  const loadLogs = async () => setLogs(normList(await logSvc.list({})).filter((l) => l.kind === "staff"));
  const map = useMemo(() => { const m = {}; recs.forEach((r) => { (m[r.staffId] ||= {})[r.date] = r; }); return m; }, [recs]);
  const days = daysInMonth(month);
  const logChange = (targetId, targetName, date, sess, oldV, newV) => logSvc.create({ kind: "staff", targetId, targetName, date, session: sess, oldValue: oldV || "—", newValue: newV || "—", editedBy: user?.id || "", editedByName: user?.name || "admin", editedAt: new Date().toISOString() });

  const markValues = (sess) => { const d = todayStr(); const v = {}; staff.forEach((s) => { if (!map[s.id]?.[d]?.[sess]) v[s.id] = "P"; }); return v; };
  const openMark = () => { const sess = activeSession(settings); setMark({ session: sess, date: todayStr(), values: markValues(sess) }); };
  const switchSession = (sess) => setMark((m) => ({ ...m, session: sess, values: markValues(sess) }));
  const saveMark = async () => {
    const { date, session: sess, values } = mark; const ids = Object.keys(values);
    try {
      await Promise.all(ids.map(async (sid) => { const s = staff.find((x) => x.id === sid); const code = values[sid]; const existing = map[sid]?.[date];
        if (existing) await att.update(existing.id, { [sess]: code, markedBy: user?.name || "admin", markedAt: new Date().toISOString() });
        else await att.create({ staffId: sid, staffName: s.name, date, [sess]: code, source: "manual", markedBy: user?.name || "admin", markedAt: new Date().toISOString() }); }));
      toast.success(`Marked ${sess} for ${ids.length} staff`); setMark(null); load();
    } catch (e) { toast.error(e.message); }
  };
  const openEdit = (s, date) => { const r = map[s.id]?.[date] || {}; setEdit({ staff: s, date, morning: r.morning || "", afternoon: r.afternoon || "" }); };
  const saveEdit = async () => {
    const { staff: s, date, morning, afternoon } = edit; const existing = map[s.id]?.[date];
    try { for (const sess of ["morning","afternoon"]) { const nv = sess === "morning" ? morning : afternoon; const ov = existing?.[sess] || ""; if (nv !== ov && (ov || nv)) await logChange(s.id, s.name, date, sess, ov, nv); }
      if (existing) await att.update(existing.id, { morning, afternoon, markedBy: user?.name || "admin", markedAt: new Date().toISOString() });
      else await att.create({ staffId: s.id, staffName: s.name, date, morning, afternoon, source: "manual", markedBy: user?.name || "admin", markedAt: new Date().toISOString() });
      toast.success("Updated"); setEdit(null); load();
    } catch (e) { toast.error(e.message); }
  };
  const exportCsv = () => { const header = ["Staff"]; for (let d = 1; d <= days; d++) header.push(`${d}AM`, `${d}PM`); const lines = [header.join(",")];
    staff.forEach((s) => { const row = [s.name]; for (let d = 1; d <= days; d++) { const r = map[s.id]?.[dateOf(month, d)] || {}; row.push(r.morning || "", r.afternoon || ""); } lines.push(row.map((x) => `"${x}"`).join(",")); });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `staff-attendance-${month}.csv`; a.click(); };

  return (
    <div>
      <PageHeader title="Staff Attendance" icon={UserCheck} subtitle="All staff · morning + afternoon · biometric-ready"
        actions={<div className="flex gap-2"><Button variant="outline" onClick={() => { setShowLog(true); loadLogs(); }}><History size={15} /> Log</Button><Button variant="outline" onClick={exportCsv}><Download size={15} /> Export</Button><Button onClick={openMark} disabled={staff.length === 0}><ClipboardCheck size={16} /> Mark Attendance</Button></div>} />
      <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Month</p><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="ctl" /></div>
        <span className="text-xs text-navy/45 flex items-center gap-1 ml-2"><Fingerprint size={14} /> Biometric punches auto-mark when integrated (optional)</span>
        <div className="ml-auto"><Legend /></div>
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (
        <div className="glass rounded-xl2 shadow-glass overflow-auto">
          <table className="text-xs border-collapse">
            <thead><tr><th className="sticky left-0 bg-white z-10 px-3 py-2 text-left text-navy/50 font-semibold border-b border-navy/8 min-w-[160px]">Staff</th>
              {Array.from({ length: days }, (_, i) => i + 1).map((d) => { const ds = dateOf(month, d); return <th key={d} className={`px-1 py-1 text-center border-b border-navy/8 ${isSunday(ds) ? "bg-coral-100/40" : ""}`}><div className="text-navy/70 font-bold">{d}</div><div className="text-navy/30 text-[9px]">{weekday(ds)}</div></th>; })}
            </tr></thead>
            <tbody>{staff.map((s) => (
              <tr key={s.id} className="hover:bg-white/40"><td className="sticky left-0 bg-white z-10 px-3 py-1.5 border-b border-navy/5 font-medium text-navy truncate">{s.name} <span className="text-navy/35 text-[10px]">{s.role}</span></td>
                {Array.from({ length: days }, (_, i) => i + 1).map((d) => { const r = map[s.id]?.[dateOf(month, d)] || {}; return <td key={d} onClick={() => openEdit(s, dateOf(month, d))} className="px-1 py-1 text-center border-b border-navy/5 cursor-pointer hover:bg-royal-100/40"><div className="flex flex-col items-center gap-0.5"><Chip code={r.morning} /><Chip code={r.afternoon} /></div></td>; })}
              </tr>
            ))}
              {staff.length === 0 && <tr><td className="px-4 py-8 text-navy/40" colSpan={days + 1}>No staff found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!mark} onClose={() => setMark(null)} title={`Mark staff attendance · ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
        footer={<ModalFooter onCancel={() => setMark(null)} onSave={saveMark} saveLabel="Save attendance" />}>
        {mark && (<div className="space-y-3">
          <div className="flex items-center justify-between"><div className="flex rounded-xl bg-white/60 border border-navy/12 p-0.5">{["morning","afternoon"].map((s) => <button key={s} onClick={() => switchSession(s)} className={`px-3 h-8 rounded-lg text-sm font-medium capitalize ${mark.session === s ? "btn-grad text-white" : "text-navy/60"}`}>{s}</button>)}</div>
            <button onClick={() => setMark((m) => ({ ...m, values: Object.fromEntries(Object.keys(m.values).map((id) => [id, "P"])) }))} className="text-royal text-sm font-semibold">All present</button></div>
          <div className="max-h-[48vh] overflow-auto divide-y divide-navy/5">{staff.map((s) => { const editable = s.id in mark.values; const marked = map[s.id]?.[todayStr()]?.[mark.session]; return <div key={s.id} className="flex items-center gap-3 py-2"><span className="flex-1 text-sm text-navy truncate">{s.name} <span className="text-navy/40 text-xs">· {s.role}</span></span>{editable ? <StatusPicker value={mark.values[s.id]} onChange={(c) => setMark((m) => ({ ...m, values: { ...m.values, [s.id]: c } }))} /> : <span className="flex items-center gap-1.5 text-xs text-navy/40"><Chip code={marked} /> marked</span>}</div>; })}</div>
        </div>)}
      </Modal>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit ? `${edit.staff.name} · ${edit.date}` : ""}
        footer={<ModalFooter onCancel={() => setEdit(null)} onSave={saveEdit} saveLabel="Save (logged)" />}>
        {edit && (<div className="space-y-4"><div><p className="text-xs font-semibold text-navy/60 mb-1.5">Morning</p><StatusPicker size="lg" value={edit.morning} onChange={(c) => setEdit((e) => ({ ...e, morning: c }))} /></div><div><p className="text-xs font-semibold text-navy/60 mb-1.5">Afternoon</p><StatusPicker size="lg" value={edit.afternoon} onChange={(c) => setEdit((e) => ({ ...e, afternoon: c }))} /></div><p className="text-xs text-navy/40">Edits are recorded in the attendance log.</p></div>)}
      </Modal>

      {showLog && (<Modal open onClose={() => setShowLog(false)} title="Staff attendance edit log">
        <div className="max-h-[60vh] overflow-auto">{logs.length === 0 ? <p className="text-navy/40 text-sm py-6 text-center">No edits logged yet.</p> : (
          <table className="w-full text-sm"><thead><tr className="text-left text-xs text-navy/45 border-b border-navy/8"><th className="py-2">Staff</th><th>Date</th><th>Session</th><th>Change</th><th>By</th></tr></thead>
            <tbody className="divide-y divide-navy/5">{logs.map((l) => <tr key={l.id}><td className="py-2 text-navy">{l.targetName}</td><td className="text-navy/60">{l.date}</td><td className="text-navy/60 capitalize">{l.session}</td><td><Chip code={l.oldValue} /> → <Chip code={l.newValue} /></td><td className="text-navy/60 text-xs">{l.editedByName}<br /><span className="text-navy/35">{new Date(l.editedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span></td></tr>)}</tbody></table>
        )}</div>
      </Modal>)}
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
