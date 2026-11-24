import { useState, useEffect } from "react";
import { ClipboardList, Plus, Trash2, Pencil, CalendarDays, MapPin, UserCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";

const svc = resourceService("exams");
const TYPES = ["Unit Test", "Mid Term", "Final Term", "Practical", "Oral", "Assignment"];
const STATUS = ["Draft", "Scheduled", "Ongoing", "Completed"];
const blankPaper = () => ({ date: "", subject: "", startTime: "", endTime: "", hall: "", invigilator: "", maxMarks: 100 });
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—");

export default function Exams() {
  const toast = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); setExams(normList(await svc.list({}))); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openNew = () => setForm({ name: "", klass: "", section: "", examType: "Mid Term", status: "Draft", schedule: [blankPaper()] });
  const openEdit = (e) => setForm({ id: e.id, name: e.name, klass: e.klass || "", section: e.section || "", examType: e.examType || "Mid Term", status: e.status || "Draft", schedule: (e.schedule?.length ? e.schedule : [blankPaper()]).map((x) => ({ ...blankPaper(), ...x })) });
  const setPaper = (i, k, v) => setForm((f) => ({ ...f, schedule: f.schedule.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)) }));
  const addPaper = () => setForm((f) => ({ ...f, schedule: [...f.schedule, blankPaper()] }));
  const removePaper = (i) => setForm((f) => ({ ...f, schedule: f.schedule.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!form.name || !form.klass) { toast.error("Name and class are required"); return; }
    setSaving(true);
    try {
      const dates = form.schedule.map((p) => p.date).filter(Boolean).sort();
      const payload = { name: form.name, klass: form.klass, section: form.section, examType: form.examType, status: form.status, schedule: form.schedule.filter((p) => p.subject || p.date), startDate: dates[0] || null, endDate: dates[dates.length - 1] || null };
      if (form.id) await svc.update(form.id, payload); else await svc.create(payload);
      toast.success("Exam saved"); setForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (e) => { await svc.remove(e.id); load(); };

  return (
    <div>
      <PageHeader title="Exams & Assessments" icon={ClipboardList} subtitle="Schedule class & section wise · date-wise papers · hall & invigilator"
        actions={<Button onClick={openNew}><Plus size={16} /> New Exam</Button>} />

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>
        : exams.length === 0 ? <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/50">No exams yet. Schedule your first exam.</div>
        : (
          <div className="grid md:grid-cols-2 gap-5">
            {exams.map((e) => (
              <div key={e.id} className="glass rounded-xl2 shadow-glass p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg text-navy">{e.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1"><Badge color="blue">{e.klass}{e.section ? " · " + e.section : ""}</Badge><Badge>{e.examType}</Badge><Badge color={e.status === "Completed" ? "green" : e.status === "Ongoing" ? "amber" : "gray"}>{e.status}</Badge></div>
                  </div>
                  <div className="flex gap-2"><button onClick={() => openEdit(e)} className="text-navy/40 hover:text-navy"><Pencil size={15} /></button><button onClick={() => del(e)} className="text-coral-500"><Trash2 size={15} /></button></div>
                </div>
                <p className="text-xs text-navy/50 mt-3 flex items-center gap-1.5"><CalendarDays size={13} /> {fmt(e.startDate)} – {fmt(e.endDate)} · {(e.schedule || []).length} papers</p>
                <div className="mt-3 space-y-1.5">
                  {(e.schedule || []).slice(0, 4).map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-white/50 rounded-lg px-2.5 py-1.5">
                      <span className="text-navy/50 w-14">{fmt(p.date)}</span>
                      <span className="font-medium text-navy flex-1 truncate">{p.subject || "—"}</span>
                      {p.hall && <span className="text-navy/50 flex items-center gap-0.5"><MapPin size={11} />{p.hall}</span>}
                      {p.invigilator && <span className="text-navy/50 flex items-center gap-0.5"><UserCheck size={11} />{p.invigilator}</span>}
                    </div>
                  ))}
                  {(e.schedule || []).length > 4 && <p className="text-[11px] text-navy/40">+{e.schedule.length - 4} more</p>}
                </div>
              </div>
            ))}
          </div>
        )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit Exam" : "New Exam"} size="lg"
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block"><span className="lbl">Exam name *</span><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Mid Term Examination 2026" className="in" /></label>
              <label className="block"><span className="lbl">Exam type</span><select value={form.examType} onChange={(e) => setForm((f) => ({ ...f, examType: e.target.value }))} className="in">{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><span className="lbl">Class *</span><RefSelect resource="classes" labelKey="name" value={form.klass} onChange={(v) => setForm((f) => ({ ...f, klass: v }))} placeholder="Class…" /></div>
              <label className="block"><span className="lbl">Section</span><select value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))} className="in"><option value="">All sections</option>{["A", "B", "C", "D"].map((x) => <option key={x}>{x}</option>)}</select></label>
              <label className="block"><span className="lbl">Status</span><select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="in">{STATUS.map((x) => <option key={x}>{x}</option>)}</select></label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2"><span className="lbl mb-0">Exam schedule (date-wise papers)</span><button onClick={addPaper} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add paper</button></div>
              <div className="space-y-3 max-h-[42vh] overflow-auto">
                {form.schedule.map((p, i) => (
                  <div key={i} className="rounded-xl border border-navy/10 bg-white/50 p-3">
                    <div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-navy/50">Paper {i + 1}</span><button onClick={() => removePaper(i)} className="text-coral-500"><Trash2 size={13} /></button></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <label className="block"><span className="lbl2">Date</span><input type="date" value={p.date} onChange={(e) => setPaper(i, "date", e.target.value)} className="in2" /></label>
                      <div><span className="lbl2">Subject</span><RefSelect resource="subjects" labelKey="name" value={p.subject} onChange={(v) => setPaper(i, "subject", v)} placeholder="Subject…" /></div>
                      <label className="block"><span className="lbl2">Max marks</span><input type="number" value={p.maxMarks} onChange={(e) => setPaper(i, "maxMarks", +e.target.value)} className="in2" /></label>
                      <label className="block"><span className="lbl2">Start</span><input type="time" value={p.startTime} onChange={(e) => setPaper(i, "startTime", e.target.value)} className="in2" /></label>
                      <label className="block"><span className="lbl2">End</span><input type="time" value={p.endTime} onChange={(e) => setPaper(i, "endTime", e.target.value)} className="in2" /></label>
                      <label className="block"><span className="lbl2">Hall</span><input value={p.hall} onChange={(e) => setPaper(i, "hall", e.target.value)} placeholder="e.g. Hall A" className="in2" /></label>
                      <div className="col-span-2 sm:col-span-3"><span className="lbl2">Invigilator (optional — assign later)</span><RefSelect resource="staff" labelKey="name" value={p.invigilator} onChange={(v) => setPaper(i, "invigilator", v)} placeholder="Assign staff…" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.lbl2{display:block;font-size:10px;font-weight:600;color:rgba(20,51,94,.5);margin-bottom:3px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}.in2{height:36px;width:100%;border-radius:10px;background:rgba(255,255,255,.8);border:1px solid rgba(20,51,94,.12);padding:0 8px;font-size:13px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
