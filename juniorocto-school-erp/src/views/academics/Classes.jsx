import { useState, useEffect } from "react";
import { LayoutGrid, Plus, Trash2, Users, Pencil } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";

const svc = resourceService("classes");
const LETTERS = "ABCDEFGHIJ".split("");
const nextLetter = (secs) => LETTERS.find((L) => !secs.some((s) => s.name === L)) || "";
const normalizeSections = (c) => {
  if (Array.isArray(c.sections)) return c.sections.map((s) => (typeof s === "string" ? { name: s, classTeacher: "" } : s));
  if (typeof c.sections === "string" && c.sections) return c.sections.split(",").map((x) => ({ name: x.trim(), classTeacher: c.teacher || "" }));
  return [{ name: "A", classTeacher: "" }];
};

export default function Classes() {
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [cs, ss] = await Promise.all([svc.list({}), resourceService("students").list({})]);
    setClasses(normList(cs)); setStudents(normList(ss)); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // Auto strength from admitted students (no manual entry)
  const strength = (className, section) => students.filter((s) => s.klass === className && (section ? s.section === section : true)).length;

  const openNew = () => setForm({ name: "", model: "K-12", sections: [{ name: "A", classTeacher: "" }] });
  const openEdit = (c) => setForm({ id: c.id, name: c.name, model: c.model || "K-12", sections: normalizeSections(c) });
  const addSection = () => setForm((f) => ({ ...f, sections: [...f.sections, { name: nextLetter(f.sections), classTeacher: "" }] }));
  const setSection = (i, k, v) => setForm((f) => ({ ...f, sections: f.sections.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) }));
  const removeSection = (i) => setForm((f) => ({ ...f, sections: f.sections.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!form.name) { toast.error("Class name is required"); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, model: form.model, sections: form.sections.filter((s) => s.name), teacher: form.sections[0]?.classTeacher || "", strength: strength(form.name) };
      if (form.id) await svc.update(form.id, payload); else await svc.create(payload);
      toast.success("Saved"); setForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Classes & Sections" icon={LayoutGrid} subtitle="Each section has its own class teacher · strength updates from admissions"
        actions={<Button onClick={openNew}><Plus size={16} /> New Class</Button>} />

      {loading ? (
        <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>
      ) : classes.length === 0 ? (
        <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/50">No classes yet. Add your first class.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {classes.map((c) => {
            const secs = normalizeSections(c);
            return (
              <div key={c.id} className="glass rounded-xl2 shadow-glass p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><h3 className="font-display text-xl text-navy">{c.name}</h3><Badge>{c.model || "K-12"}</Badge></div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-sm text-navy/60"><Users size={15} /> {strength(c.name)} students</span>
                    <button onClick={() => openEdit(c)} className="text-navy/40 hover:text-navy"><Pencil size={15} /></button>
                  </div>
                </div>
                <table className="w-full text-sm mt-4">
                  <thead><tr className="text-left text-xs uppercase text-navy/40 border-b border-navy/8"><th className="py-2">Section</th><th>Class Teacher</th><th className="text-right">Strength</th></tr></thead>
                  <tbody>
                    {secs.map((s) => (
                      <tr key={s.name} className="border-b border-navy/5 last:border-0">
                        <td className="py-2"><span className="inline-grid place-items-center h-7 w-7 rounded-lg bg-royal-100 text-royal font-bold text-xs">{s.name}</span></td>
                        <td className="text-navy/80">{s.classTeacher || <span className="text-navy/30">Unassigned</span>}</td>
                        <td className="text-right font-mono text-navy/70">{strength(c.name, s.name)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit Class" : "New Class"}
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block"><span className="block text-xs font-semibold text-navy/60 mb-1.5">Class name *</span>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Grade 1"
                  className="h-10 w-full rounded-xl bg-white/70 border border-navy/12 px-3 text-sm text-navy outline-none focus:border-royal/45" /></label>
              <label className="block"><span className="block text-xs font-semibold text-navy/60 mb-1.5">Academic model</span>
                <select value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                  className="h-10 w-full rounded-xl bg-white/70 border border-navy/12 px-3 text-sm text-navy outline-none focus:border-royal/45">
                  <option>Early Years</option><option>K-12</option></select></label>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-navy/60">Sections — each with its own class teacher</span>
                <button onClick={addSection} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add section</button></div>
              <div className="space-y-2">
                {form.sections.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={s.name} onChange={(e) => setSection(i, "name", e.target.value.toUpperCase().slice(0, 2))}
                      className="h-10 w-14 text-center rounded-xl bg-white/70 border border-navy/12 text-sm font-bold text-royal outline-none focus:border-royal/45" />
                    <div className="flex-1"><RefSelect resource="staff" labelKey="name" value={s.classTeacher} onChange={(v) => setSection(i, "classTeacher", v)} placeholder="Select class teacher…" /></div>
                    <span className="text-xs text-navy/45 w-16 text-right">{strength(form.name, s.name)} std</span>
                    <button onClick={() => removeSection(i)} className="text-coral-500 hover:text-coral-600 p-1"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-navy/40 mt-2">Strength is calculated automatically as students are admitted — you don't enter it.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
