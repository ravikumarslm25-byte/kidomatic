import { useState, useEffect, useMemo } from "react";
import { CalendarCheck, Download, History, Settings2, ClipboardCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";
import { Legend, Chip, StatusPicker, todayStr, monthStr, daysInMonth, dateOf, weekday, isSunday, activeSession, useAttendanceSettings } from "./attendanceKit";

const att = resourceService("attendance");
const logSvc = resourceService("attendanceLog");

export default function StudentAttendance() {
  const toast = useToast();
  const { user } = useAuth();
  const { settings, saveSettings } = useAttendanceSettings();
  const [klass, setKlass] = useState("");
  const [section, setSection] = useState("");
  const [month, setMonth] = useState(monthStr());
  const [view, setView] = useState("monthly");
  const [session, setSession] = useState(activeSession(settings));
  const [students, setStudents] = useState([]);
  const [recs, setRecs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mark, setMark] = useState(null);
  const [edit, setEdit] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  useEffect(() => { setSession(activeSession(settings)); }, [settings]);

  const load = async () => {
    if (!klass) return; setLoading(true);
    const [ss, rr] = await Promise.all([resourceService("students").list({}), att.list({})]);
    setStudents(normList(ss).filter((s) => s.klass === klass && (!section || s.section === section) && (s.status || "Active") === "Active"));
    setRecs(normList(rr).filter((r) => r.klass === klass && (!section || r.section === section) && r.date?.startsWith(month)));
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [klass, section, month]);
  const loadLogs = async () => setLogs(normList(await logSvc.list({})).filter((l) => l.kind === "student"));

  const map = useMemo(() => { const m = {}; recs.forEach((r) => { (m[r.studentId] ||= {})[r.date] = r; }); return m; }, [recs]);
  const days = daysInMonth(month);
  const logChange = (kind, targetId, targetName, date, sess, oldV, newV) =>
    logSvc.create({ kind, targetId, targetName, date, session: sess, oldValue: oldV || "—", newValue: newV || "—", editedBy: user?.id || "", editedByName: user?.name || "admin", editedAt: new Date().toISOString() });

  const markValues = (sess) => { const d = todayStr(); const v = {}; students.forEach((s) => { if (!map[s.id]?.[d]?.[sess]) v[s.id] = "P"; }); return v; };
  const openMark = () => setMark({ session, date: todayStr(), values: markValues(session) });
  const switchSession = (sess) => setMark((m) => ({ ...m, session: sess, values: markValues(sess) }));
  const saveMark = async () => {
    const { date, session: sess, values } = mark; const ids = Object.keys(values);
    try {
      await Promise.all(ids.map(async (sid) => {
        const s = students.find((x) => x.id === sid); const code = values[sid]; const existing = map[sid]?.[date];
        if (existing) await att.update(existing.id, { [sess]: code, markedBy: user?.name || "admin", markedAt: new Date().toISOString() });
        else await att.create({ studentId: sid, studentName: s.name, klass, section: s.section || section, date, [sess]: code, markedBy: user?.name || "admin", markedAt: new Date().toISOString() });
      }));
      toast.success(`Marked ${sess} for ${ids.length} students`); setMark(null); load();
    } catch (e) { toast.error(e.message); }
  };
  const openEdit = (student, date) => { const r = map[student.id]?.[date] || {}; setEdit({ student, date, morning: r.morning || "", afternoon: r.afternoon || "" }); };
  const saveEdit = async () => {
    const { student, date, morning, afternoon } = edit; const existing = map[student.id]?.[date];
    try {
      for (const sess of ["morning", "afternoon"]) { const nv = sess === "morning" ? morning : afternoon; const ov = existing?.[sess] || ""; if (nv !== ov && (ov || nv)) await logChange("student", student.id, student.name, date, sess, ov, nv); }
      if (existing) await att.update(existing.id, { morning, afternoon, markedBy: user?.name || "admin", markedAt: new Date().toISOString() });
      else await att.create({ studentId: student.id, studentName: student.name, klass, section: student.section || section, date, morning, afternoon, markedBy: user?.name || "admin", markedAt: new Date().toISOString() });
      toast.success("Attendance updated"); setEdit(null); load();
    } catch (e) { toast.error(e.message); }
  };
  const exportCsv = () => {
    const header = ["Student"]; for (let d = 1; d <= days; d++) header.push(`${d}AM`, `${d}PM`);
    const lines = [header.join(",")];
    students.forEach((s) => { const row = [s.name]; for (let d = 1; d <= days; d++) { const r = map[s.id]?.[dateOf(month, d)] || {}; row.push(r.morning || "", r.afternoon || ""); } lines.push(row.map((x) => `"${x}"`).join(",")); });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `attendance-${klass}-${section || "all"}-${month}.csv`; a.click();
  };

  return (
    <div>
      <PageHeader title="Student Attendance" icon={CalendarCheck} subtitle="Class & section wise · morning + afternoon · monthly sheet"
        actions={<div className="flex gap-2">
          <Button variant="outline" onClick={() => { setShowLog(true); loadLogs(); }}><History size={15} /> Log</Button>
          <Button variant="outline" onClick={exportCsv}><Download size={15} /> Export</Button>
          <Button onClick={openMark} disabled={!klass || students.length === 0}><ClipboardCheck size={16} /> Mark Attendance</Button>
        </div>} />
      <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-3 items-end">
        <F label="Class"><div className="w-40"><RefSelect resource="classes" labelKey="name" value={klass} onChange={setKlass} placeholder="Select class…" /></div></F>
        <F label="Section"><select value={section} onChange={(e) => setSection(e.target.value)} className="ctl"><option value="">All</option>{["A","B","C","D"].map((x) => <option key={x}>{x}</option>)}</select></F>
        <F label="Month"><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="ctl" /></F>
        <F label="View"><div className="flex rounded-xl bg-white/60 border border-navy/12 p-0.5">{["monthly","daily"].map((v) => <button key={v} onClick={() => setView(v)} className={`px-3 h-8 rounded-lg text-sm font-medium capitalize ${view === v ? "btn-grad text-white" : "text-navy/60"}`}>{v}</button>)}</div></F>
        <button onClick={() => setShowSettings(true)} className="ml-auto text-navy/50 hover:text-navy flex items-center gap-1 text-sm"><Settings2 size={15} /> Timing</button>
      </div>
      <div className="mb-3"><Legend /></div>

      {!klass ? <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/50">Select a class to view attendance.</div>
        : loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div>
        : view === "monthly" ? (
          <div className="glass rounded-xl2 shadow-glass overflow-auto">
            <table className="text-xs border-collapse">
              <thead><tr>
                <th className="sticky left-0 bg-white z-10 px-3 py-2 text-left text-navy/50 font-semibold border-b border-navy/8 min-w-[150px]">Student</th>
                {Array.from({ length: days }, (_, i) => i + 1).map((d) => { const ds = dateOf(month, d); return <th key={d} className={`px-1 py-1 text-center border-b border-navy/8 ${isSunday(ds) ? "bg-coral-100/40" : ""}`}><div className="text-navy/70 font-bold">{d}</div><div className="text-navy/30 text-[9px]">{weekday(ds)}</div></th>; })}
              </tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-white/40">
                    <td className="sticky left-0 bg-white z-10 px-3 py-1.5 border-b border-navy/5 font-medium text-navy truncate">{s.name}</td>
                    {Array.from({ length: days }, (_, i) => i + 1).map((d) => { const r = map[s.id]?.[dateOf(month, d)] || {}; return <td key={d} onClick={() => openEdit(s, dateOf(month, d))} className="px-1 py-1 text-center border-b border-navy/5 cursor-pointer hover:bg-royal-100/40"><div className="flex flex-col items-center gap-0.5"><Chip code={r.morning} /><Chip code={r.afternoon} /></div></td>; })}
                  </tr>
                ))}
                {students.length === 0 && <tr><td className="px-4 py-8 text-navy/40" colSpan={days + 1}>No students in this class/section.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : <DailyView students={students} map={map} month={month} openEdit={openEdit} />}

      <Modal open={!!mark} onClose={() => setMark(null)} title={`Mark attendance · ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
        footer={<ModalFooter onCancel={() => setMark(null)} onSave={saveMark} saveLabel="Save attendance" />}>
        {mark && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex rounded-xl bg-white/60 border border-navy/12 p-0.5">{["morning","afternoon"].map((s) => <button key={s} onClick={() => switchSession(s)} className={`px-3 h-8 rounded-lg text-sm font-medium capitalize ${mark.session === s ? "btn-grad text-white" : "text-navy/60"}`}>{s}</button>)}</div>
              <button onClick={() => setMark((m) => ({ ...m, values: Object.fromEntries(Object.keys(m.values).map((id) => [id, "P"])) }))} className="text-royal text-sm font-semibold">All present</button>
            </div>
            <p className="text-[11px] text-navy/45">Today only. Already-marked students are locked — edit them from the sheet.</p>
            <div className="max-h-[48vh] overflow-auto divide-y divide-navy/5">
              {students.map((s) => { const editable = s.id in mark.values; const marked = map[s.id]?.[todayStr()]?.[mark.session];
                return <div key={s.id} className="flex items-center gap-3 py-2"><span className="flex-1 text-sm text-navy truncate">{s.name} <span className="text-navy/40 text-xs">· {s.section || section}</span></span>{editable ? <StatusPicker value={mark.values[s.id]} onChange={(c) => setMark((m) => ({ ...m, values: { ...m.values, [s.id]: c } }))} /> : <span className="flex items-center gap-1.5 text-xs text-navy/40"><Chip code={marked} /> marked</span>}</div>; })}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit ? `${edit.student.name} · ${edit.date}` : ""}
        footer={<ModalFooter onCancel={() => setEdit(null)} onSave={saveEdit} saveLabel="Save (logged)" />}>
        {edit && (<div className="space-y-4">
          <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Morning</p><StatusPicker size="lg" value={edit.morning} onChange={(c) => setEdit((e) => ({ ...e, morning: c }))} /></div>
          <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Afternoon</p><StatusPicker size="lg" value={edit.afternoon} onChange={(c) => setEdit((e) => ({ ...e, afternoon: c }))} /></div>
          <p className="text-xs text-navy/40">Edits are recorded in the attendance log.</p>
        </div>)}
      </Modal>

      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Attendance timing"
        footer={<ModalFooter onCancel={() => setShowSettings(false)} onSave={() => { saveSettings(settings); setShowSettings(false); toast.success("Timing saved"); }} />}>
        <div className="grid grid-cols-2 gap-4">
          <label className="block"><span className="block text-xs font-semibold text-navy/60 mb-1.5">Morning until</span><input type="time" defaultValue={settings.morningCutoff} onChange={(e) => (settings.morningCutoff = e.target.value)} className="ctl w-full" /></label>
          <label className="block"><span className="block text-xs font-semibold text-navy/60 mb-1.5">Afternoon from</span><input type="time" defaultValue={settings.afternoonStart} onChange={(e) => (settings.afternoonStart = e.target.value)} className="ctl w-full" /></label>
        </div>
        <p className="text-xs text-navy/45 mt-3">Marking before "morning until" saves as morning; after "afternoon from" as afternoon.</p>
      </Modal>

      {showLog && (
        <Modal open onClose={() => setShowLog(false)} title="Attendance edit log">
          <div className="max-h-[60vh] overflow-auto">
            {logs.length === 0 ? <p className="text-navy/40 text-sm py-6 text-center">No edits logged yet.</p> : (
              <table className="w-full text-sm"><thead><tr className="text-left text-xs text-navy/45 border-b border-navy/8"><th className="py-2">Student</th><th>Date</th><th>Session</th><th>Change</th><th>By</th></tr></thead>
                <tbody className="divide-y divide-navy/5">{logs.map((l) => <tr key={l.id}><td className="py-2 text-navy">{l.targetName}</td><td className="text-navy/60">{l.date}</td><td className="text-navy/60 capitalize">{l.session}</td><td><Chip code={l.oldValue} /> → <Chip code={l.newValue} /></td><td className="text-navy/60 text-xs">{l.editedByName}<br /><span className="text-navy/35">{new Date(l.editedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span></td></tr>)}</tbody>
              </table>
            )}
          </div>
        </Modal>
      )}
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const F = ({ label, children }) => <div><p className="text-xs font-semibold text-navy/60 mb-1.5">{label}</p>{children}</div>;
function DailyView({ students, map, month, openEdit }) {
  const [day, setDay] = useState(new Date().getDate());
  const date = dateOf(month, day);
  return (
    <div className="glass rounded-xl2 shadow-glass p-4">
      <div className="flex items-center gap-2 mb-4"><span className="text-sm text-navy/60">Day:</span>
        <input type="number" min={1} max={daysInMonth(month)} value={day} onChange={(e) => setDay(Math.max(1, Math.min(daysInMonth(month), +e.target.value)))} className="ctl w-20" />
        <span className="text-sm text-navy/50">{new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" })}</span></div>
      <table className="w-full text-sm"><thead><tr className="text-left text-xs text-navy/45 border-b border-navy/8"><th className="py-2">Student</th><th className="text-center">Morning</th><th className="text-center">Afternoon</th></tr></thead>
        <tbody className="divide-y divide-navy/5">{students.map((s) => { const r = map[s.id]?.[date] || {}; return <tr key={s.id} className="hover:bg-white/40 cursor-pointer" onClick={() => openEdit(s, date)}><td className="py-2.5 text-navy font-medium">{s.name} <span className="text-navy/40 text-xs">· {s.section}</span></td><td className="text-center"><Chip code={r.morning} /></td><td className="text-center"><Chip code={r.afternoon} /></td></tr>; })}</tbody>
      </table>
    </div>
  );
}
