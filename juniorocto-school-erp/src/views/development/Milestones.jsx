import { useState, useEffect, useMemo } from "react";
import { Sparkles, Plus, Trash2, Pencil, Target, Trophy, Search } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";

const svc = resourceService("skills");
const DOMAINS = ["Academics", "Sports", "Arts & Craft", "Music", "Dance", "Public Speaking", "Leadership", "Coding & Tech", "Science", "Life Skills"];
const LEVELS = ["Emerging", "Developing", "Proficient", "Advanced", "Expert"];
const LEVEL_COLOR = { Emerging: "#94a3b8", Developing: "#0ea5e9", Proficient: "#16a34a", Advanced: "#7c3aed", Expert: "#E85410" };

export default function Milestones() {
  const toast = useToast();
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fKlass, setFKlass] = useState("");
  const [fSection, setFSection] = useState("");
  const [fDomain, setFDomain] = useState("");
  const [fLevel, setFLevel] = useState("");
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [rr, ss] = await Promise.all([svc.list({}), resourceService("students").list({})]);
    setRows(normList(rr)); setStudents(normList(ss)); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => rows.filter((r) =>
    (!fKlass || r.klass === fKlass) && (!fSection || r.section === fSection) &&
    (!fDomain || r.domain === fDomain) && (!fLevel || r.level === fLevel) &&
    (!q || `${r.studentName} ${r.skill}`.toLowerCase().includes(q.toLowerCase()))
  ), [rows, fKlass, fSection, fDomain, fLevel, q]);

  const pickStudent = (id) => { const st = students.find((x) => x.id === id); setForm((f) => ({ ...f, studentId: id, studentName: st?.name || "", klass: st?.klass || "", section: st?.section || "" })); };
  const openNew = () => setForm({ studentId: "", studentName: "", klass: "", section: "", domain: "Sports", skill: "", level: "Developing", target: "", progress: 40, notes: "" });
  const openEdit = (r) => setForm({ ...r });

  const save = async () => {
    if (!form.studentId || !form.skill) { toast.error("Pick a student and enter a skill"); return; }
    setSaving(true);
    try {
      const payload = { ...form, progress: +form.progress || 0, updatedAt: new Date().toISOString() };
      if (form.id) await svc.update(form.id, payload); else await svc.create(payload);
      toast.success("Saved"); setForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (r) => { await svc.remove(r.id); load(); };

  const exportCsv = () => {
    const head = "Student,Class,Section,Domain,Skill,Level,Goal,Progress%";
    const body = shown.map((r) => [r.studentName, r.klass, r.section, r.domain, r.skill, r.level, r.target, r.progress].map((x) => `"${x ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([head + "\n" + body], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "skills.csv"; a.click();
  };

  return (
    <div>
      <PageHeader title="Skills & Milestones" icon={Sparkles} subtitle="Per-student goals & skill levels — filter to spot talent for competitions & sports"
        actions={<div className="flex gap-2"><Button variant="outline" onClick={exportCsv}>Export</Button><Button onClick={openNew}><Plus size={16} /> Add skill / goal</Button></div>} />

      {/* Multi-filters */}
      <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-3 items-end">
        <F label="Class"><div className="w-40"><RefSelect resource="classes" labelKey="name" value={fKlass} onChange={setFKlass} placeholder="All classes" /></div></F>
        <F label="Section"><select value={fSection} onChange={(e) => setFSection(e.target.value)} className="ctl"><option value="">All</option>{["A", "B", "C", "D"].map((x) => <option key={x}>{x}</option>)}</select></F>
        <F label="Domain"><select value={fDomain} onChange={(e) => setFDomain(e.target.value)} className="ctl"><option value="">All domains</option>{DOMAINS.map((d) => <option key={d}>{d}</option>)}</select></F>
        <F label="Level"><select value={fLevel} onChange={(e) => setFLevel(e.target.value)} className="ctl"><option value="">All levels</option>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></F>
        <div className="flex-1 min-w-[160px]"><F label="Search"><div className="relative"><Search size={14} className="absolute left-3 top-3 text-navy/30" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Student or skill…" className="ctl w-full pl-8" /></div></F></div>
        <span className="text-sm text-navy/50">{shown.length} records</span>
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div>
        : shown.length === 0 ? <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/50">No skill records. Add a student's skill or goal to begin.</div>
        : (
          <div className="glass rounded-xl2 shadow-glass overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45">
                <th className="px-4 py-3">Student</th><th className="px-4 py-3">Domain</th><th className="px-4 py-3">Skill</th><th className="px-4 py-3">Level</th><th className="px-4 py-3">Goal</th><th className="px-4 py-3 w-40">Progress</th><th className="px-4 py-3 w-10" />
              </tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className="border-b border-navy/5 hover:bg-white/40">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><Avatar name={r.studentName} size={30} /><div><p className="font-medium text-navy">{r.studentName}</p><p className="text-[11px] text-navy/45">{r.klass}{r.section ? " · " + r.section : ""}</p></div></div></td>
                    <td className="px-4 py-2.5"><Badge>{r.domain}</Badge></td>
                    <td className="px-4 py-2.5 text-navy/80">{r.skill}</td>
                    <td className="px-4 py-2.5"><span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: (LEVEL_COLOR[r.level] || "#999") + "22", color: LEVEL_COLOR[r.level] }}>{r.level}</span></td>
                    <td className="px-4 py-2.5 text-navy/60 text-xs flex items-center gap-1"><Target size={12} /> {r.target || "—"}</td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2"><div className="flex-1 h-2 rounded-full bg-navy/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${r.progress || 0}%`, background: "var(--brand-royal,#1651A3)" }} /></div><span className="text-xs text-navy/50 w-8">{r.progress || 0}%</span></div></td>
                    <td className="px-4 py-2.5"><div className="flex gap-1.5"><button onClick={() => openEdit(r)} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button><button onClick={() => del(r)} className="text-coral-500"><Trash2 size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit skill / goal" : "Add skill / goal"}
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="space-y-4">
            <div><span className="lbl">Student *</span><RefSelect resource="students" labelKey="name" valueKey="id" value={form.studentId} onChange={pickStudent} placeholder="Select student…" />
              {form.klass && <p className="text-xs text-navy/45 mt-1">{form.klass}{form.section ? " · Section " + form.section : ""}</p>}</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block"><span className="lbl">Domain</span><select value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} className="in">{DOMAINS.map((d) => <option key={d}>{d}</option>)}</select></label>
              <label className="block"><span className="lbl">Level</span><select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className="in">{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></label>
            </div>
            <label className="block"><span className="lbl">Skill *</span><input value={form.skill} onChange={(e) => setForm((f) => ({ ...f, skill: e.target.value }))} className="in" placeholder="e.g. Sprinting, Chess, Sketching" /></label>
            <label className="block"><span className="lbl">Goal / target</span><input value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))} className="in" placeholder="e.g. District-level sprint by Dec" /></label>
            <label className="block"><span className="lbl">Progress: {form.progress}%</span><input type="range" min={0} max={100} value={form.progress} onChange={(e) => setForm((f) => ({ ...f, progress: +e.target.value }))} className="w-full" /></label>
            <label className="block"><span className="lbl">Notes</span><textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="in" style={{ height: "auto", padding: "10px 12px" }} placeholder="Coach / teacher notes…" /></label>
          </div>
        )}
      </Modal>
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const F = ({ label, children }) => <div><p className="text-xs font-semibold text-navy/60 mb-1.5">{label}</p>{children}</div>;
