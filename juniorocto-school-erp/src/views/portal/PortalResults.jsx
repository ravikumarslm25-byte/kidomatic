import { useState, useEffect, useMemo } from "react";
import { BookOpen, Printer, ChevronDown } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { usePortal } from "@/store/portal";

const marksRows = (marks) => {
  if (!marks) return [];
  if (Array.isArray(marks)) return marks.map((m) => ({ subject: m.subject || m.name, obtained: +m.obtained ?? +m.marks ?? 0, max: +m.max || +m.total || 100 }));
  return Object.entries(marks).map(([subject, v]) => (typeof v === "object" ? { subject, obtained: +v.obtained || 0, max: +v.max || 100 } : { subject, obtained: +v || 0, max: 100 }));
};
const gradeFor = (pct, bands) => { const b = bands.find((x) => pct >= (+x.minPct || 0) && pct <= (+x.maxPct || 100)); return b || null; };

export default function PortalResults() {
  const { child } = usePortal();
  const [exams, setExams] = useState([]); const [marks, setMarks] = useState([]); const [bands, setBands] = useState([]); const [school, setSchool] = useState({}); const [student, setStudent] = useState({});
  const [loading, setLoading] = useState(true); const [sel, setSel] = useState("");

  useEffect(() => {
    if (!child) return; setLoading(true);
    Promise.all([
      resourceService("exams").list({ studentId: child.studentId }).catch(() => []),
      resourceService("examMarks").list({ studentId: child.studentId }).catch(() => []),
      resourceService("grading").list({}).catch(() => []),
      resourceService("appSettings").list({}).catch(() => []),
      resourceService("students").list({ studentId: child.studentId }).catch(() => []),
    ]).then(([ex, mk, gr, st, stu]) => {
      const mList = normList(mk); setMarks(mList); setExams(normList(ex));
      setBands(normList(gr).sort((a, b) => (b.minPct || 0) - (a.minPct || 0)));
      setSchool(normList(st)[0] || {}); setStudent(normList(stu).find((x) => x.id === child.studentId) || normList(stu)[0] || {});
      const first = mList[0]; setSel(first ? (first.examId || first.id) : "");
    }).catch(() => {}).finally(() => setLoading(false));
  }, [child?.studentId]);

  const terms = useMemo(() => marks.map((m) => { const exam = exams.find((e) => e.id === m.examId); return { id: m.examId || m.id, name: exam?.name || m.examName || "Exam", type: exam?.examType || "", rec: m, exam }; }), [marks, exams]);
  const active = terms.find((t) => t.id === sel) || terms[0];
  const rows = active ? marksRows(active.rec.marks) : [];
  const total = rows.reduce((a, r) => a + r.obtained, 0);
  const max = rows.reduce((a, r) => a + r.max, 0);
  const pct = max ? Math.round((total / max) * 100) : 0;
  const overall = gradeFor(pct, bands);

  const print = () => { const el = document.getElementById("reportcard"); const w = window.open("", "_blank"); w.document.write(`<html><head><title>Report Card</title><style>body{font-family:system-ui;margin:0;padding:24px;color:#14335E}table{width:100%;border-collapse:collapse}th,td{border:1px solid #dbe3ee;padding:8px 10px;text-align:left;font-size:13px}th{background:#f1f5f9}</style></head><body>${el.innerHTML}</body></html>`); w.document.close(); w.focus(); setTimeout(() => w.print(), 300); };

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  if (!terms.length) return <div><PageHeader title="Report Cards & Results" icon={BookOpen} /><Card className="py-14 text-center text-navy/40">No results published yet.</Card></div>;

  return (
    <div>
      <PageHeader title="Report Cards & Results" icon={BookOpen} subtitle={`${child?.studentName || ""}'s academic results`}
        actions={<div className="flex gap-2 items-center">
          <select value={sel} onChange={(e) => setSel(e.target.value)} className="h-10 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm font-medium text-navy">{terms.map((t) => <option key={t.id} value={t.id}>{t.name}{t.type ? ` · ${t.type}` : ""}</option>)}</select>
          <Button variant="outline" onClick={print}><Printer size={15} /> Print</Button>
        </div>} />

      <div id="reportcard" className="glass rounded-xl2 shadow-glass p-6">
        <div className="flex items-center gap-4 border-b-2 border-navy/10 pb-4 mb-4">
          {school.logoUrl && <img src={school.logoUrl} alt="" className="h-16 w-16 object-contain" />}
          <div className="flex-1">
            <h2 className="font-display text-2xl text-navy">{school.schoolName || "School"}</h2>
            <p className="text-xs text-navy/55">{[school.addressLine, school.city, school.state, school.pincode].filter(Boolean).join(", ")}</p>
            <p className="text-xs text-navy/45">{school.affiliationNo ? `Affiliation: ${school.affiliationNo}` : ""}{school.email ? ` · ${school.email}` : ""}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div><p className="text-sm text-navy/50">Report Card</p><p className="font-display text-lg text-navy">{active.name}{active.type ? ` — ${active.type}` : ""}</p></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 mb-5 text-sm">
          {[["Student", student.name || child?.studentName], ["Class", `${student.klass || child?.klass || ""}${student.section ? "-" + student.section : ""}`], ["Admission No", student.admissionNo], ["Roll No", student.rollNo]].map(([l, v]) => (
            <div key={l} className="flex gap-2 border-b border-navy/6 py-1.5"><span className="text-navy/45 w-28">{l}</span><span className="font-medium text-navy">{v || "—"}</span></div>
          ))}
        </div>

        <table className="w-full text-sm border border-navy/10 rounded-lg overflow-hidden mb-4">
          <thead><tr className="bg-navy/5 text-navy/60 text-xs uppercase"><th className="text-left px-3 py-2">Subject</th><th className="text-center px-3 py-2 w-20">Marks</th><th className="text-center px-3 py-2 w-20">Max</th><th className="text-center px-3 py-2 w-16">%</th><th className="text-center px-3 py-2 w-20">Grade</th></tr></thead>
          <tbody>
            {rows.map((r, i) => { const p = r.max ? Math.round((r.obtained / r.max) * 100) : 0; const g = gradeFor(p, bands); return (
              <tr key={i} className="border-t border-navy/6"><td className="px-3 py-2 text-navy">{r.subject}</td><td className="px-3 py-2 text-center font-medium text-navy">{r.obtained}</td><td className="px-3 py-2 text-center text-navy/50">{r.max}</td><td className="px-3 py-2 text-center text-navy/70">{p}%</td><td className="px-3 py-2 text-center font-semibold text-navy">{g?.grade || "—"}</td></tr>
            ); })}
            <tr className="border-t-2 border-navy/15 bg-navy/5 font-semibold"><td className="px-3 py-2 text-navy">Total</td><td className="px-3 py-2 text-center text-navy">{total}</td><td className="px-3 py-2 text-center text-navy/60">{max}</td><td className="px-3 py-2 text-center text-navy">{pct}%</td><td className="px-3 py-2 text-center text-navy">{overall?.grade || "—"}</td></tr>
          </tbody>
        </table>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl bg-royal-50 p-3 text-center"><p className="text-[11px] uppercase text-navy/45">Percentage</p><p className="font-display text-2xl text-royal">{pct}%</p></div>
          <div className="rounded-xl bg-sea-50 p-3 text-center"><p className="text-[11px] uppercase text-navy/45">Overall Grade</p><p className="font-display text-2xl text-sea">{overall?.grade || "—"}</p></div>
          <div className="rounded-xl bg-coral-50 p-3 text-center"><p className="text-[11px] uppercase text-navy/45">Grade Point</p><p className="font-display text-2xl text-coral-600">{overall?.point ?? "—"}</p></div>
        </div>

        <div className="rounded-xl border border-navy/10 p-3 mb-2">
          <p className="text-[11px] uppercase text-navy/45 mb-1">Remarks</p>
          <p className="text-sm text-navy/75">{active.rec.remark || overall?.remark || "Keep up the good work."}</p>
        </div>
        <div className="flex justify-between text-xs text-navy/40 mt-6 pt-4 border-t border-navy/8"><span>Class Teacher</span><span>Principal</span></div>
      </div>

      {terms.length > 1 && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase text-navy/45 mb-2">All terms</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {terms.map((t) => { const rr = marksRows(t.rec.marks); const tt = rr.reduce((a, r) => a + r.obtained, 0); const mm = rr.reduce((a, r) => a + r.max, 0); const pp = mm ? Math.round((tt / mm) * 100) : 0; return (
              <button key={t.id} onClick={() => setSel(t.id)} className={`glass rounded-xl2 shadow-glass p-4 text-left ${t.id === sel ? "ring-2 ring-royal" : ""}`}>
                <p className="font-semibold text-navy text-sm">{t.name}</p><p className="text-xs text-navy/45">{t.type}</p>
                <div className="flex items-center justify-between mt-2"><span className="text-navy/50 text-sm">{tt}/{mm}</span><Badge color="royal">{pp}% · {gradeFor(pp, bands)?.grade || "—"}</Badge></div>
              </button>
            ); })}
          </div>
        </div>
      )}
    </div>
  );
}
