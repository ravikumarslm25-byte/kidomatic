import { useState, useEffect, useMemo } from "react";
import { MonitorPlay, Plus, Trash2, Pencil, FileText, Video, HelpCircle, Eye, GripVertical } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import FileUpload from "@/components/ui/FileUpload";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";

const svc = resourceService("lmsLessons");
const TYPE = { material: { label: "Material", icon: FileText, color: "#1651A3" }, video: { label: "Video", icon: Video, color: "#E85410" }, quiz: { label: "Quiz", icon: HelpCircle, color: "#7c3aed" } };
const blankQ = () => ({ q: "", options: ["", "", "", ""], correct: 0, marks: 1 });

export default function Lms() {
  const toast = useToast();
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fKlass, setFKlass] = useState("");
  const [fType, setFType] = useState("");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); setLessons(normList(await svc.list({}))); setLoading(false); };
  useEffect(() => { load(); }, []);
  const shown = useMemo(() => lessons.filter((l) => (!fKlass || l.klass === fKlass) && (!fType || l.type === fType)), [lessons, fKlass, fType]);

  const openNew = (type) => setForm({ type, title: "", klass: "", subject: "", status: "Published", content: "", videoUrl: "", duration: 0, attachment: "", questions: [blankQ()], passingScore: 40 });
  const openEdit = (l) => setForm({ id: l.id, type: l.type, title: l.title, klass: l.klass || "", subject: l.subject || "", status: l.status || "Published", content: l.content || "", videoUrl: l.videoUrl || "", duration: l.duration || 0, attachment: l.attachment || "", questions: (l.questions?.length ? l.questions : [blankQ()]), passingScore: l.passingScore ?? 40 });

  const setQ = (i, patch) => setForm((f) => ({ ...f, questions: f.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) }));
  const setOpt = (qi, oi, v) => setForm((f) => ({ ...f, questions: f.questions.map((q, idx) => (idx === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? v : o)) } : q)) }));
  const addQ = () => setForm((f) => ({ ...f, questions: [...f.questions, blankQ()] }));
  const removeQ = (i) => setForm((f) => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));
  const addOpt = (qi) => setForm((f) => ({ ...f, questions: f.questions.map((q, idx) => (idx === qi ? { ...q, options: [...q.options, ""] } : q)) }));
  const removeOpt = (qi, oi) => setForm((f) => ({ ...f, questions: f.questions.map((q, idx) => (idx === qi ? { ...q, options: q.options.filter((_, j) => j !== oi), correct: q.correct >= oi ? Math.max(0, q.correct - 1) : q.correct } : q)) }));

  const save = async () => {
    if (!form.title || !form.klass) { toast.error("Title and class are required"); return; }
    setSaving(true);
    try {
      const payload = { title: form.title, klass: form.klass, subject: form.subject, type: form.type, status: form.status, createdBy: user?.name || "admin",
        content: form.type === "material" ? form.content : "", attachment: form.type === "material" ? form.attachment : "",
        videoUrl: form.type === "video" ? form.videoUrl : "", duration: form.type === "video" ? +form.duration : 0,
        questions: form.type === "quiz" ? form.questions.filter((q) => q.q) : [], passingScore: form.type === "quiz" ? +form.passingScore : 0 };
      if (form.id) await svc.update(form.id, payload); else await svc.create(payload);
      toast.success("Lesson saved"); setForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (l) => { await svc.remove(l.id); load(); };

  return (
    <div>
      <PageHeader title="Learning (LMS)" icon={MonitorPlay} subtitle="Material, video & quizzes for students · organised by class & subject"
        actions={<div className="flex gap-2">
          <Link to="/learn"><Button variant="outline"><Eye size={15} /> Preview as student</Button></Link>
          <Button onClick={() => openNew("material")}><Plus size={16} /> New Lesson</Button>
        </div>} />

      <div className="glass rounded-xl2 shadow-glass p-4 mb-5 flex flex-wrap gap-3 items-end">
        <div className="w-44"><p className="text-xs font-semibold text-navy/60 mb-1.5">Class</p><RefSelect resource="classes" labelKey="name" value={fKlass} onChange={setFKlass} placeholder="All classes" /></div>
        <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Type</p><div className="flex gap-1">
          {["", "material", "video", "quiz"].map((t) => <button key={t} onClick={() => setFType(t)} className={`px-3 h-9 rounded-lg text-sm font-medium capitalize ${fType === t ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}>{t || "All"}</button>)}
        </div></div>
        <div className="ml-auto flex gap-2">
          {Object.entries(TYPE).map(([k, v]) => <button key={k} onClick={() => openNew(k)} className="flex items-center gap-1.5 text-sm px-3 h-9 rounded-lg bg-white/60 border border-navy/10 text-navy/70 hover:text-navy"><v.icon size={14} style={{ color: v.color }} /> {v.label}</button>)}
        </div>
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>
        : shown.length === 0 ? <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/50">No lessons yet. Add material, a video or a quiz.</div>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((l) => { const t = TYPE[l.type] || TYPE.material; return (
              <div key={l.id} className="glass rounded-xl2 shadow-glass p-4">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl grid place-items-center text-white" style={{ background: t.color }}><t.icon size={18} /></div>
                  <div className="flex gap-2"><button onClick={() => openEdit(l)} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button><button onClick={() => del(l)} className="text-coral-500"><Trash2 size={14} /></button></div>
                </div>
                <h3 className="font-display text-navy mt-3 leading-tight">{l.title}</h3>
                <div className="flex flex-wrap gap-1.5 mt-2"><Badge color="blue">{l.klass}</Badge>{l.subject && <Badge>{l.subject}</Badge>}<Badge color={l.status === "Published" ? "green" : "gray"}>{l.status}</Badge></div>
                {l.type === "quiz" && <p className="text-xs text-navy/50 mt-2">{(l.questions || []).length} questions · pass {l.passingScore}%</p>}
                {l.type === "video" && l.duration ? <p className="text-xs text-navy/50 mt-2">{l.duration} min</p> : null}
              </div>
            ); })}
          </div>
        )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit lesson" : `New ${form ? TYPE[form.type].label : ""} lesson`} size="lg"
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="space-y-4">
            <div className="flex gap-1">{Object.entries(TYPE).map(([k, v]) => <button key={k} onClick={() => setForm((f) => ({ ...f, type: k }))} className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium ${form.type === k ? "text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`} style={form.type === k ? { background: v.color } : {}}><v.icon size={14} /> {v.label}</button>)}</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block"><span className="lbl">Title *</span><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="in" placeholder="Lesson title" /></label>
              <label className="block"><span className="lbl">Status</span><select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="in"><option>Published</option><option>Draft</option></select></label>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><span className="lbl">Class *</span><RefSelect resource="classes" labelKey="name" value={form.klass} onChange={(v) => setForm((f) => ({ ...f, klass: v }))} placeholder="Class…" /></div>
              <div><span className="lbl">Subject</span><RefSelect resource="subjects" labelKey="name" value={form.subject} onChange={(v) => setForm((f) => ({ ...f, subject: v }))} placeholder="Subject…" /></div>
            </div>

            {form.type === "material" && (<>
              <label className="block"><span className="lbl">Lesson content</span><textarea rows={6} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="in" style={{ height: "auto", padding: "10px 12px" }} placeholder="Write the reading material / notes here…" /></label>
              <div><span className="lbl">Attachment (PDF / worksheet)</span><FileUpload value={form.attachment} onChange={(v) => setForm((f) => ({ ...f, attachment: v }))} folder="lms" /></div>
            </>)}

            {form.type === "video" && (<div className="grid sm:grid-cols-3 gap-4">
              <label className="block sm:col-span-2"><span className="lbl">Video URL (YouTube or MP4)</span><input value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} className="in" placeholder="https://youtube.com/watch?v=…" /></label>
              <label className="block"><span className="lbl">Duration (min)</span><input type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} className="in" /></label>
            </div>)}

            {form.type === "quiz" && (<div>
              <div className="flex items-center justify-between mb-2"><span className="lbl mb-0">Questions</span>
                <div className="flex items-center gap-3"><label className="text-xs text-navy/60 flex items-center gap-1.5">Pass %<input type="number" value={form.passingScore} onChange={(e) => setForm((f) => ({ ...f, passingScore: e.target.value }))} className="w-16 h-8 rounded-lg bg-white/70 border border-navy/12 px-2 text-sm" /></label>
                  <button onClick={addQ} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add question</button></div>
              </div>
              <div className="space-y-3 max-h-[46vh] overflow-auto">
                {form.questions.map((q, qi) => (
                  <div key={qi} className="rounded-xl border border-navy/10 bg-white/50 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-navy/50 shrink-0">Q{qi + 1}</span>
                      <input value={q.q} onChange={(e) => setQ(qi, { q: e.target.value })} className="flex-1 h-9 rounded-lg bg-white/80 border border-navy/12 px-2 text-sm" placeholder="Question text" />
                      <input type="number" value={q.marks} onChange={(e) => setQ(qi, { marks: +e.target.value })} className="w-14 h-9 rounded-lg bg-white/80 border border-navy/12 px-2 text-sm" title="Marks" />
                      <button onClick={() => removeQ(qi)} className="text-coral-500"><Trash2 size={14} /></button>
                    </div>
                    <div className="space-y-1.5 pl-6">
                      {q.options.map((o, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" checked={q.correct === oi} onChange={() => setQ(qi, { correct: oi })} title="Correct answer" />
                          <input value={o} onChange={(e) => setOpt(qi, oi, e.target.value)} className="flex-1 h-8 rounded-lg bg-white/80 border border-navy/12 px-2 text-sm" placeholder={`Option ${oi + 1}`} />
                          {q.options.length > 2 && <button onClick={() => removeOpt(qi, oi)} className="text-navy/30 hover:text-coral-500"><Trash2 size={12} /></button>}
                        </div>
                      ))}
                      <button onClick={() => addOpt(qi)} className="text-royal text-xs font-semibold flex items-center gap-1 ml-6"><Plus size={12} /> Add option</button>
                    </div>
                    <p className="text-[10px] text-navy/40 mt-2 pl-6">Select the radio next to the correct answer.</p>
                  </div>
                ))}
              </div>
            </div>)}
          </div>
        )}
      </Modal>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
