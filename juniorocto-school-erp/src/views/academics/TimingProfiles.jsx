import { useState, useEffect } from "react";
import { Clock, Plus, Trash2, Pencil } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";

const svc = resourceService("timingProfiles");
const DEFAULT_SLOTS = [
  { label: "Period 1", type: "period", start: "09:00", end: "09:45" },
  { label: "Period 2", type: "period", start: "09:45", end: "10:30" },
  { label: "Short Break", type: "break", start: "10:30", end: "10:45" },
  { label: "Period 3", type: "period", start: "10:45", end: "11:30" },
  { label: "Period 4", type: "period", start: "11:30", end: "12:15" },
  { label: "Lunch", type: "lunch", start: "12:15", end: "13:00" },
  { label: "Period 5", type: "period", start: "13:00", end: "13:45" },
  { label: "Period 6", type: "period", start: "13:45", end: "14:30" },
];
const TYPE_COLOR = { period: "#1651A3", break: "#F59E0B", lunch: "#E85410" };

export default function TimingProfiles() {
  const toast = useToast();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); setProfiles(normList(await svc.list({}))); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openNew = () => setForm({ name: "", classes: [], slots: DEFAULT_SLOTS.map((x) => ({ ...x })) });
  const openEdit = (p) => setForm({ id: p.id, name: p.name, classes: Array.isArray(p.classes) ? p.classes : [], slots: (p.slots || DEFAULT_SLOTS).map((x) => ({ ...x })) });
  const setSlot = (i, k, v) => setForm((f) => ({ ...f, slots: f.slots.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) }));
  const addSlot = () => setForm((f) => ({ ...f, slots: [...f.slots, { label: `Period ${f.slots.filter((s) => s.type === "period").length + 1}`, type: "period", start: "", end: "" }] }));
  const removeSlot = (i) => setForm((f) => ({ ...f, slots: f.slots.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!form.name) { toast.error("Profile name is required"); return; }
    setSaving(true);
    try { const payload = { name: form.name, classes: form.classes, slots: form.slots }; if (form.id) await svc.update(form.id, payload); else await svc.create(payload); toast.success("Timing profile saved"); setForm(null); await load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (p) => { await svc.remove(p.id); load(); };

  return (
    <div>
      <PageHeader title="Timing Master" icon={Clock} subtitle="School & grade-band timings — set periods, breaks & lunch before building timetables"
        actions={<Button onClick={openNew}><Plus size={16} /> New Profile</Button>} />

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>
        : profiles.length === 0 ? <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/50">No timing profiles yet. Create one for Primary, Secondary, etc.</div>
        : (
          <div className="grid md:grid-cols-2 gap-5">
            {profiles.map((p) => {
              const slots = p.slots || []; const periods = slots.filter((s) => s.type === "period").length;
              const start = slots[0]?.start; const end = slots[slots.length - 1]?.end;
              return (
                <div key={p.id} className="glass rounded-xl2 shadow-glass p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl text-navy">{p.name}</h3>
                    <div className="flex items-center gap-2"><span className="text-sm text-navy/50">{start}–{end}</span><button onClick={() => openEdit(p)} className="text-navy/40 hover:text-navy"><Pencil size={15} /></button><button onClick={() => del(p)} className="text-coral-500"><Trash2 size={15} /></button></div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">{(Array.isArray(p.classes) ? p.classes : []).map((c) => <Badge key={c} color="blue">{c}</Badge>)}</div>
                  <p className="text-xs text-navy/50 mt-3">{periods} periods · {slots.length - periods} breaks</p>
                  <div className="flex flex-wrap gap-1 mt-2">{slots.map((s, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: (TYPE_COLOR[s.type] || "#999") + "22", color: TYPE_COLOR[s.type] }}>{s.start}</span>)}</div>
                </div>
              );
            })}
          </div>
        )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit Timing Profile" : "New Timing Profile"}
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block"><span className="block text-xs font-semibold text-navy/60 mb-1.5">Profile name *</span>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Primary (Gr 1–5)" className="h-10 w-full rounded-xl bg-white/70 border border-navy/12 px-3 text-sm outline-none focus:border-royal/45" /></label>
              <div><span className="block text-xs font-semibold text-navy/60 mb-1.5">Applies to classes</span>
                <RefSelect resource="classes" labelKey="name" multiple value={form.classes} onChange={(v) => setForm((f) => ({ ...f, classes: v }))} placeholder="Select classes…" /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-navy/60">Slots (periods, breaks, lunch)</span><button onClick={addSlot} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add slot</button></div>
              <div className="space-y-2 max-h-[40vh] overflow-auto">
                {form.slots.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={s.label} onChange={(e) => setSlot(i, "label", e.target.value)} className="flex-1 h-9 rounded-lg bg-white/70 border border-navy/12 px-2 text-sm outline-none" />
                    <select value={s.type} onChange={(e) => setSlot(i, "type", e.target.value)} className="h-9 rounded-lg bg-white/70 border border-navy/12 px-2 text-sm outline-none"><option value="period">Period</option><option value="break">Break</option><option value="lunch">Lunch</option></select>
                    <input type="time" value={s.start} onChange={(e) => setSlot(i, "start", e.target.value)} className="h-9 rounded-lg bg-white/70 border border-navy/12 px-1 text-sm outline-none" />
                    <input type="time" value={s.end} onChange={(e) => setSlot(i, "end", e.target.value)} className="h-9 rounded-lg bg-white/70 border border-navy/12 px-1 text-sm outline-none" />
                    <button onClick={() => removeSlot(i)} className="text-coral-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
