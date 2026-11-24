import { useState, useEffect } from "react";
import { CalendarDays, Plus, Check } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import RefSelect from "@/components/ui/RefSelect";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DEFAULT_SLOTS = [
  { label: "Period 1", type: "period", start: "09:00", end: "09:45" },
  { label: "Period 2", type: "period", start: "09:45", end: "10:30" },
  { label: "Break", type: "break", start: "10:30", end: "10:45" },
  { label: "Period 3", type: "period", start: "10:45", end: "11:30" },
  { label: "Period 4", type: "period", start: "11:30", end: "12:15" },
  { label: "Lunch", type: "lunch", start: "12:15", end: "13:00" },
  { label: "Period 5", type: "period", start: "13:00", end: "13:45" },
  { label: "Period 6", type: "period", start: "13:45", end: "14:30" },
];
const svc = resourceService("timetable");

export default function Timetable() {
  const toast = useToast();
  const [klass, setKlass] = useState("");
  const [section, setSection] = useState("");
  const [docs, setDocs] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [grid, setGrid] = useState({});
  const [docId, setDocId] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const key = (di, si) => `${di}-${si}`;

  useEffect(() => {
    svc.list({}).then((d) => setDocs(normList(d))).catch(() => {});
    resourceService("timingProfiles").list({}).then((d) => setProfiles(normList(d))).catch(() => {});
  }, []);
  useEffect(() => {
    if (!klass) { setGrid({}); setDocId(null); return; }
    const found = docs.find((d) => d.klass === klass && (d.section || "") === (section || ""));
    setGrid(found?.grid || {}); setDocId(found?.id || null);
  }, [klass, section, docs]);

  const profile = profiles.find((p) => (Array.isArray(p.classes) ? p.classes : []).includes(klass));
  const slots = profile?.slots?.length ? profile.slots : DEFAULT_SLOTS;

  const open = (di, si) => { const c = grid[key(di, si)] || {}; setEdit({ di, si, subject: c.subject || "", teacher: c.teacher || "" }); };
  const save = async () => {
    const nextGrid = { ...grid, [key(edit.di, edit.si)]: { subject: edit.subject, teacher: edit.teacher } };
    setGrid(nextGrid); setEdit(null); setSaving(true);
    try {
      if (docId) await svc.update(docId, { klass, section, grid: nextGrid });
      else { const created = await svc.create({ klass, section, grid: nextGrid }); setDocId(created.id || created._id); setDocs((d) => [...d, { klass, section, grid: nextGrid, id: created.id || created._id }]); }
      setDocs((d) => d.map((x) => (x.klass === klass && (x.section || "") === (section || "") ? { ...x, grid: nextGrid } : x)));
      toast.success("Timetable saved");
    } catch (e) { toast.error(e.message || "Save failed"); } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Timetable" icon={CalendarDays}
        subtitle={profile ? `Using timing: ${profile.name}` : "Set a Timing Master profile for custom periods · saved per class"}
        actions={saving ? <span className="text-sm text-navy/50 flex items-center gap-1.5"><Spinner size={14} /> Saving…</span> : docId ? <span className="text-sm text-emerald-600 flex items-center gap-1"><Check size={15} /> Saved</span> : null} />
      <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-4 items-end">
        <div className="w-52"><label className="block text-xs font-semibold text-navy/60 mb-1.5">Class</label>
          <RefSelect resource="classes" labelKey="name" value={klass} onChange={setKlass} placeholder="Select a class…" /></div>
        <div><label className="block text-xs font-semibold text-navy/60 mb-1.5">Section</label>
          <select value={section} onChange={(e) => setSection(e.target.value)} className="h-10 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm text-navy outline-none focus:border-royal/45"><option value="">Whole class</option>{["A","B","C","D"].map((x) => <option key={x}>{x}</option>)}</select></div>
      </div>

      {!klass ? <Card><div className="py-10 text-center text-navy/50 text-sm">Pick a class to build its weekly timetable.</div></Card> : (
        <Card pad={false} className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead><tr className="border-b border-navy/8">
              <th className="px-4 py-3 text-xs font-semibold uppercase text-navy/40 text-left w-40">Time</th>
              {DAYS.map((d) => <th key={d} className="px-4 py-3 text-xs font-semibold uppercase text-navy/40">{d}</th>)}
            </tr></thead>
            <tbody>
              {slots.map((slot, si) => slot.type !== "period" ? (
                <tr key={si} className="border-b border-navy/5">
                  <td colSpan={DAYS.length + 1} className="px-4 py-1.5 text-center text-xs font-semibold" style={{ background: slot.type === "lunch" ? "#FFF1E8" : "#FEF6E7", color: slot.type === "lunch" ? "#E85410" : "#B45309" }}>
                    {slot.label} · {slot.start}–{slot.end}
                  </td>
                </tr>
              ) : (
                <tr key={si} className="border-b border-navy/5 last:border-0">
                  <td className="px-4 py-3"><div className="text-navy/70 text-xs font-semibold">{slot.label}</div><div className="text-navy/40 text-[10px] font-mono">{slot.start}–{slot.end}</div></td>
                  {DAYS.map((d, di) => { const c = grid[key(di, si)]; return (
                    <td key={d} className="px-2 py-2">
                      <button onClick={() => open(di, si)} className={`w-full rounded-xl px-2 py-2 text-xs font-semibold transition ${c?.subject ? "bg-royal-100 text-royal hover:bg-royal-100/80" : "bg-white/50 text-navy/30 border border-dashed border-navy/15 hover:border-royal/40"}`}>
                        {c?.subject ? (<><div className="truncate">{c.subject}</div><div className="text-[10px] font-normal text-navy/45 truncate">{c.teacher}</div></>) : <Plus size={14} className="mx-auto" />}
                      </button>
                    </td>
                  ); })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit ? `${klass}${section ? " · " + section : ""} · ${DAYS[edit.di]} · ${slots[edit.si]?.label}` : ""}
        footer={<ModalFooter onCancel={() => setEdit(null)} onSave={save} />}>
        {edit && (
          <div className="space-y-4">
            <div><span className="block text-xs font-semibold text-navy/60 mb-1.5">Subject</span>
              <RefSelect resource="subjects" labelKey="name" value={edit.subject} onChange={(v) => setEdit((e) => ({ ...e, subject: v }))} placeholder="Choose subject…" /></div>
            <div><span className="block text-xs font-semibold text-navy/60 mb-1.5">Teacher</span>
              <RefSelect resource="staff" labelKey="name" value={edit.teacher} onChange={(v) => setEdit((e) => ({ ...e, teacher: v }))} placeholder="Choose teacher…" /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
