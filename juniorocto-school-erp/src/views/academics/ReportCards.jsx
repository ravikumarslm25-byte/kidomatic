import { useState, useEffect, useMemo } from "react";
import { FileText, Save, Printer, Plus, Trash2, GraduationCap, SlidersHorizontal, ClipboardList } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useBranding } from "@/store/branding";
import { DEFAULT_BANDS, DEFAULT_SETTINGS, computeStudent, withRanks } from "./gradingKit";

const examSvc = resourceService("exams");
const markSvc = resourceService("examMarks");
const gradeSvc = resourceService("grading");
const setSvc = resourceService("reportSettings");

export default function ReportCards() {
  const toast = useToast();
  const b = useBranding();
  const [tab, setTab] = useState("marks");
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});      // studentId -> { subject: obtained }
  const [existing, setExisting] = useState([]);       // examMarks docs
  const [bands, setBands] = useState(DEFAULT_BANDS);
  const [bandId, setBandId] = useState(null);         // not used (bands via grading resource rows)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [setId, setSetId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const exam = exams.find((e) => e.id === examId);
  const subjects = useMemo(() => (exam?.schedule || []).filter((p) => p.subject).map((p) => ({ subject: p.subject, max: +p.maxMarks || 100 })), [exam]);

  // initial: exams + settings + bands
  useEffect(() => {
    examSvc.list({}).then((d) => setExams(normList(d))).catch(() => {});
    setSvc.list({}).then((d) => { const r = normList(d)[0]; if (r) { setSettings({ ...DEFAULT_SETTINGS, ...r }); setSetId(r.id); } }).catch(() => {});
    gradeSvc.list({}).then((d) => { const rows = normList(d); if (rows.length) setBands([...rows].sort((a, b) => b.minPct - a.minPct)); }).catch(() => {});
  }, []);

  // on exam select: students + existing marks
  useEffect(() => {
    if (!exam) return; setLoading(true);
    Promise.all([resourceService("students").list({}), markSvc.list({})]).then(([ss, mm]) => {
      setStudents(normList(ss).filter((s) => s.klass === exam.klass && (!exam.section || s.section === exam.section) && (s.status || "Active") === "Active"));
      const docs = normList(mm).filter((m) => m.examId === exam.id); setExisting(docs);
      const map = {}; docs.forEach((d) => { map[d.studentId] = {}; (d.marks || []).forEach((x) => { map[d.studentId][x.subject] = x.obtained; }); });
      setMarksMap(map); setLoading(false);
    }).catch(() => setLoading(false));
  }, [examId]);

  const setMark = (sid, subject, val) => setMarksMap((m) => ({ ...m, [sid]: { ...(m[sid] || {}), [subject]: val === "" ? "" : Math.max(0, +val) } }));

  const saveMarks = async () => {
    setSaving(true);
    try {
      await Promise.all(students.map(async (s) => {
        const marks = subjects.map((sub) => ({ subject: sub.subject, obtained: +(marksMap[s.id]?.[sub.subject] || 0), max: sub.max }));
        const doc = existing.find((d) => d.studentId === s.id);
        const payload = { examId: exam.id, studentId: s.id, studentName: s.name, klass: exam.klass, section: s.section || exam.section || "", marks, enteredAt: new Date().toISOString() };
        if (doc) await markSvc.update(doc.id, payload); else await markSvc.create(payload);
      }));
      toast.success("Marks saved"); const mm = normList(await markSvc.list({})).filter((m) => m.examId === exam.id); setExisting(mm);
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  // computed report cards (with rank)
  const reports = useMemo(() => {
    if (!exam) return [];
    const list = students.map((s) => { const marks = subjects.map((sub) => ({ subject: sub.subject, obtained: marksMap[s.id]?.[sub.subject] || 0, max: sub.max })); return { student: s, report: computeStudent(marks, bands, settings) }; });
    return withRanks(list);
  }, [students, subjects, marksMap, bands, settings, exam]);

  const saveSettings = async () => {
    try { if (setId) await setSvc.update(setId, settings); else { const r = await setSvc.create(settings); setSetId(r.id || r._id); } toast.success("Grading settings saved"); }
    catch (e) { toast.error(e.message); }
  };
  const setBand = (i, k, v) => setBands((bs) => bs.map((b, idx) => (idx === i ? { ...b, [k]: v } : b)));
  const addBand = () => setBands((bs) => [...bs, { grade: "", minPct: 0, maxPct: 0, point: 0, remark: "" }]);
  const removeBand = (i) => setBands((bs) => bs.filter((_, idx) => idx !== i));
  const saveBands = async () => {
    try { const cur = normList(await gradeSvc.list({})); await Promise.all(cur.map((c) => gradeSvc.remove(c.id))); await Promise.all(bands.map((bd) => gradeSvc.create(bd))); toast.success("Grade bands saved"); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <PageHeader title="Report Cards" icon={FileText} subtitle="Enter marks → generate report cards · grading, CGPA, rank & pass rule configurable" />
      <div className="flex gap-1 mb-5 print:hidden">
        {[["marks", "Marks Entry", ClipboardList], ["cards", "Report Cards", FileText], ["settings", "Grading Master", SlidersHorizontal]].map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {label}</button>
        ))}
      </div>

      {tab !== "settings" && (
        <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-3 items-end print:hidden">
          <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Exam</p>
            <select value={examId} onChange={(e) => setExamId(e.target.value)} className="h-10 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm text-navy outline-none min-w-[260px]">
              <option value="">Select an exam…</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.klass}{e.section ? " " + e.section : ""}</option>)}
            </select></div>
          {exam && tab === "marks" && <Button onClick={saveMarks} disabled={saving} className="ml-auto">{saving ? <><Spinner size={14} /> Saving…</> : <><Save size={15} /> Save marks</>}</Button>}
          {exam && tab === "cards" && <Button variant="outline" onClick={() => window.print()} className="ml-auto"><Printer size={15} /> Print all</Button>}
        </div>
      )}

      {/* MARKS ENTRY */}
      {tab === "marks" && (!exam ? <Empty text="Select an exam to enter marks." /> : loading ? <Loading /> : (
        <div className="glass rounded-xl2 shadow-glass overflow-auto">
          <table className="text-sm min-w-[600px] w-full">
            <thead><tr className="border-b border-navy/8"><th className="sticky left-0 bg-white px-4 py-3 text-left text-xs font-semibold uppercase text-navy/45 min-w-[170px]">Student</th>
              {subjects.map((s) => <th key={s.subject} className="px-3 py-3 text-center text-xs font-semibold text-navy/60">{s.subject}<div className="text-[10px] text-navy/35 font-normal">/{s.max}</div></th>)}
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase text-navy/45">Total</th></tr></thead>
            <tbody>
              {students.map((s) => { const tot = subjects.reduce((a, sub) => a + (+(marksMap[s.id]?.[sub.subject] || 0)), 0); const totMax = subjects.reduce((a, sub) => a + sub.max, 0);
                return (<tr key={s.id} className="border-b border-navy/5 hover:bg-white/40">
                  <td className="sticky left-0 bg-white px-4 py-2 font-medium text-navy">{s.name} <span className="text-navy/40 text-xs">· {s.section}</span></td>
                  {subjects.map((sub) => <td key={sub.subject} className="px-2 py-2 text-center"><input type="number" min={0} max={sub.max} value={marksMap[s.id]?.[sub.subject] ?? ""} onChange={(e) => setMark(s.id, sub.subject, e.target.value)} className="w-16 h-9 rounded-lg bg-white/80 border border-navy/12 text-center text-sm outline-none focus:border-royal/45" /></td>)}
                  <td className="px-3 py-2 text-center font-mono font-semibold text-navy">{tot}<span className="text-navy/35">/{totMax}</span></td>
                </tr>);
              })}
              {students.length === 0 && <tr><td className="px-4 py-8 text-navy/40" colSpan={subjects.length + 2}>No students in this class/section.</td></tr>}
            </tbody>
          </table>
        </div>
      ))}

      {/* REPORT CARDS */}
      {tab === "cards" && (!exam ? <Empty text="Select an exam to generate report cards." /> : loading ? <Loading /> : (
        <div className="grid md:grid-cols-2 gap-5">
          {reports.map(({ student, report, rank }) => (
            <div key={student.id} className="bg-white rounded-xl2 shadow-glass border border-navy/10 overflow-hidden print:break-inside-avoid">
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: "var(--brand-navy,#14335E)" }}>
                <div className="text-white"><p className="font-display">{b?.name || "School"}</p><p className="text-[10px] text-white/70">{b?.school?.address || "Salem, Tamil Nadu"}</p></div>
                <span className="text-[10px] text-white/70">{exam.name}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4"><Avatar name={student.name} size={44} /><div><p className="font-display text-navy text-lg">{student.name}</p><p className="text-xs text-navy/50">{exam.klass}{student.section ? " · " + student.section : ""} · Adm {student.admissionNo}</p></div></div>
                <table className="w-full text-sm mb-3"><thead><tr className="text-left text-[11px] uppercase text-navy/40 border-b border-navy/10"><th className="py-1.5">Subject</th><th className="text-center">Max</th><th className="text-center">Marks</th>{settings.showGrade && <th className="text-center">Grade</th>}</tr></thead>
                  <tbody>{report.rows.map((r) => <tr key={r.subject} className="border-b border-navy/5"><td className="py-1.5 text-navy/80">{r.subject}</td><td className="text-center text-navy/50">{r.max}</td><td className={`text-center font-medium ${r.pass ? "text-navy" : "text-coral-600"}`}>{r.obtained}</td>{settings.showGrade && <td className="text-center"><Badge>{r.grade}</Badge></td>}</tr>)}</tbody>
                </table>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <Stat k="Total" v={`${report.totalObt}/${report.totalMax}`} />
                  {settings.showPercentage && <Stat k="Percentage" v={`${report.pct}%`} />}
                  {settings.showCGPA && <Stat k="CGPA" v={report.cgpa} />}
                  {settings.showGrade && <Stat k="Grade" v={report.grade} />}
                  {settings.showRank && <Stat k="Rank" v={rank} />}
                  <Stat k="Result" v={report.result} tone={report.result === "Pass" ? "#16a34a" : "#dc2626"} />
                </div>
                <div className="flex justify-between mt-6 pt-3 border-t border-navy/10 text-[10px] text-navy/40"><span>Class Teacher</span><span>Principal</span></div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* GRADING MASTER */}
      {tab === "settings" && (
        <div className="space-y-5 max-w-3xl">
          <div className="glass rounded-xl2 shadow-glass p-5">
            <h3 className="font-display text-navy mb-4">Result rules</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block"><span className="lbl">Pass percentage</span><input type="number" value={settings.passPct} onChange={(e) => setSettings((s) => ({ ...s, passPct: +e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">System label</span><input value={settings.system} onChange={(e) => setSettings((s) => ({ ...s, system: e.target.value }))} className="in" placeholder="e.g. Grade + CGPA" /></label>
            </div>
            <p className="lbl mt-4">Show on report card</p>
            <div className="flex flex-wrap gap-2">
              {[["showGrade", "Grade"], ["showCGPA", "CGPA"], ["showRank", "Rank"], ["showPercentage", "Percentage"]].map(([k, label]) => (
                <button key={k} onClick={() => setSettings((s) => ({ ...s, [k]: !s[k] }))} className={`px-3 h-9 rounded-lg text-sm font-medium ${settings[k] ? "bg-royal-100 text-royal" : "bg-white/60 border border-navy/10 text-navy/50"}`}>{label}</button>
              ))}
            </div>
            <Button className="mt-4" onClick={saveSettings}><Save size={15} /> Save rules</Button>
          </div>

          <div className="glass rounded-xl2 shadow-glass p-5">
            <div className="flex items-center justify-between mb-3"><h3 className="font-display text-navy">Grade bands</h3><button onClick={addBand} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add band</button></div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[11px] text-navy/40 font-semibold px-1"><span className="col-span-2">Grade</span><span className="col-span-2">Min %</span><span className="col-span-2">Max %</span><span className="col-span-2">Point</span><span className="col-span-3">Remark</span></div>
              {bands.map((bd, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={bd.grade} onChange={(e) => setBand(i, "grade", e.target.value)} className="col-span-2 in2" />
                  <input type="number" value={bd.minPct} onChange={(e) => setBand(i, "minPct", +e.target.value)} className="col-span-2 in2" />
                  <input type="number" value={bd.maxPct} onChange={(e) => setBand(i, "maxPct", +e.target.value)} className="col-span-2 in2" />
                  <input type="number" value={bd.point} onChange={(e) => setBand(i, "point", +e.target.value)} className="col-span-2 in2" />
                  <input value={bd.remark} onChange={(e) => setBand(i, "remark", e.target.value)} className="col-span-3 in2" />
                  <button onClick={() => removeBand(i)} className="col-span-1 text-coral-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <Button className="mt-4" onClick={saveBands}><Save size={15} /> Save grade bands</Button>
          </div>
        </div>
      )}
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}.in2{height:36px;border-radius:10px;background:rgba(255,255,255,.8);border:1px solid rgba(20,51,94,.12);padding:0 8px;font-size:13px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const Empty = ({ text }) => <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/50">{text}</div>;
const Loading = () => <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div>;
const Stat = ({ k, v, tone }) => <div><span className="text-navy/45 text-xs">{k}: </span><b style={tone ? { color: tone } : {}} className="text-navy">{v}</b></div>;
