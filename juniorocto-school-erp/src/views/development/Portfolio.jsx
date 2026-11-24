import { useState, useEffect, useMemo } from "react";
import { Award, Plus, Trash2, Pencil, Medal, Eye, Calendar } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import FileUpload from "@/components/ui/FileUpload";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { signGet } from "@/services/upload";

const svc = resourceService("portfolio");
const TYPES = ["Sports", "Academic", "Arts & Craft", "Music & Dance", "Cultural", "Science", "Coding", "Leadership", "Community", "World"]; // "World" = a finished KidoMatic Worlds lesson
const LEVELS = ["School", "Inter-School", "District", "State", "National", "International"];
const POSITIONS = ["Winner", "Runner-up", "2nd Place", "3rd Place", "Finalist", "Participation", "Special Mention"];
const LEVEL_COLOR = { School: "#0ea5e9", "Inter-School": "#16a34a", District: "#7c3aed", State: "#E85410", National: "#dc2626", International: "#b45309" };
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "");

export default function Portfolio() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fKlass, setFKlass] = useState("");
  const [fSection, setFSection] = useState("");
  const [fType, setFType] = useState("");
  const [fLevel, setFLevel] = useState("");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); const [rr, ss] = await Promise.all([svc.list({}), resourceService("students").list({})]); setRows(normList(rr)); setStudents(normList(ss)); setLoading(false); };
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => rows.filter((r) =>
    (!fKlass || r.klass === fKlass) && (!fSection || r.section === fSection) && (!fType || r.type === fType) && (!fLevel || r.level === fLevel)
  ), [rows, fKlass, fSection, fType, fLevel]);

  const pickStudent = (id) => { const st = students.find((x) => x.id === id); setForm((f) => ({ ...f, studentId: id, studentName: st?.name || "", klass: st?.klass || "", section: st?.section || "" })); };
  const openNew = () => setForm({ studentId: "", studentName: "", klass: "", section: "", title: "", type: "Sports", event: "", level: "School", position: "Winner", date: "", certificate: "", notes: "" });
  const openEdit = (r) => setForm({ ...r });

  const save = async () => {
    if (!form.studentId || !form.title) { toast.error("Pick a student and enter an award title"); return; }
    setSaving(true);
    try { if (form.id) await svc.update(form.id, form); else await svc.create(form); toast.success("Award saved"); setForm(null); await load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (r) => { await svc.remove(r.id); load(); };
  const viewCert = async (r) => { try { const u = r.certificate?.publicUrl || (r.certificate?.key ? await signGet(r.certificate.key) : null); if (u) window.open(u, "_blank"); } catch {} };

  return (
    <div>
      <PageHeader title="Portfolio" icon={Award} subtitle="Awards & achievements showcase — filter by class, section, type & level"
        actions={<Button onClick={openNew}><Plus size={16} /> Add award</Button>} />

      <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-3 items-end">
        <F label="Class"><div className="w-40"><RefSelect resource="classes" labelKey="name" value={fKlass} onChange={setFKlass} placeholder="All classes" /></div></F>
        <F label="Section"><select value={fSection} onChange={(e) => setFSection(e.target.value)} className="ctl"><option value="">All</option>{["A", "B", "C", "D"].map((x) => <option key={x}>{x}</option>)}</select></F>
        <F label="Type"><select value={fType} onChange={(e) => setFType(e.target.value)} className="ctl"><option value="">All types</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></F>
        <F label="Level"><select value={fLevel} onChange={(e) => setFLevel(e.target.value)} className="ctl"><option value="">All levels</option>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></F>
        <span className="ml-auto text-sm text-navy/50">{shown.length} awards</span>
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div>
        : shown.length === 0 ? <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/50">No awards yet. Add a student's achievement to showcase it here.</div>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((r) => (
              <div key={r.id} className="glass rounded-xl2 shadow-glass p-5">
                <div className="flex items-start justify-between">
                  <div className="h-11 w-11 rounded-xl grid place-items-center text-white" style={{ background: LEVEL_COLOR[r.level] || "#1651A3" }}><Medal size={20} /></div>
                  <div className="flex gap-2"><button onClick={() => openEdit(r)} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button><button onClick={() => del(r)} className="text-coral-500"><Trash2 size={14} /></button></div>
                </div>
                <h3 className="font-display text-navy mt-3 leading-tight">{r.title}</h3>
                <p className="text-xs text-navy/50 mt-0.5">{r.event}</p>
                <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-navy/8"><Avatar name={r.studentName} size={28} /><div><p className="text-sm font-medium text-navy">{r.studentName}</p><p className="text-[11px] text-navy/45">{r.klass}{r.section ? " · " + r.section : ""}</p></div></div>
                <div className="flex flex-wrap gap-1.5 mt-3"><Badge>{r.type}</Badge><span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: (LEVEL_COLOR[r.level] || "#999") + "22", color: LEVEL_COLOR[r.level] }}>{r.level}</span>{r.position && <Badge color="amber">{r.position}</Badge>}</div>
                <div className="flex items-center justify-between mt-3 text-xs text-navy/45">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {fmt(r.date)}</span>
                  {r.certificate?.name && <button onClick={() => viewCert(r)} className="text-royal font-semibold flex items-center gap-1"><Eye size={13} /> Certificate</button>}
                </div>
              </div>
            ))}
          </div>
        )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit award" : "Add award"}
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="space-y-4">
            <div><span className="lbl">Student *</span><RefSelect resource="students" labelKey="name" valueKey="id" value={form.studentId} onChange={pickStudent} placeholder="Select student…" />
              {form.klass && <p className="text-xs text-navy/45 mt-1">{form.klass}{form.section ? " · Section " + form.section : ""}</p>}</div>
            <label className="block"><span className="lbl">Award title *</span><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="in" placeholder="e.g. Gold Medal — 100m Sprint" /></label>
            <label className="block"><span className="lbl">Event / competition</span><input value={form.event} onChange={(e) => setForm((f) => ({ ...f, event: e.target.value }))} className="in" placeholder="e.g. District Athletics Meet 2026" /></label>
            <div className="grid sm:grid-cols-3 gap-4">
              <label className="block"><span className="lbl">Type</span><select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="in">{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label className="block"><span className="lbl">Level</span><select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className="in">{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></label>
              <label className="block"><span className="lbl">Position</span><select value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} className="in">{POSITIONS.map((p) => <option key={p}>{p}</option>)}</select></label>
            </div>
            <label className="block"><span className="lbl">Date</span><input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="in" /></label>
            <div><span className="lbl">Certificate / photo</span><FileUpload value={form.certificate} onChange={(v) => setForm((f) => ({ ...f, certificate: v }))} folder="portfolio" /></div>
          </div>
        )}
      </Modal>
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const F = ({ label, children }) => <div><p className="text-xs font-semibold text-navy/60 mb-1.5">{label}</p>{children}</div>;
