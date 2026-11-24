import { useState, useEffect, useMemo } from "react";
import { BadgePercent, Plus, Pencil, Trash2, Users2, Settings2, PiggyBank } from "lucide-react";
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
import { rupee, CUR_YEAR } from "../accounting/accountsKit";

const typeSvc = resourceService("concessions");
const scSvc = resourceService("studentConcessions");
const CTYPES = ["Sibling", "Staff Ward", "RTE", "Merit", "Hardship", "Other"];

export default function Concessions() {
  const toast = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState("students");
  const [types, setTypes] = useState([]); const [assigns, setAssigns] = useState([]); const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [typeForm, setTypeForm] = useState(null); const [asgForm, setAsgForm] = useState(null);
  const year = CUR_YEAR + "-" + String(+CUR_YEAR + 1).slice(2);

  const load = async () => {
    setLoading(true);
    const [t, a, i] = await Promise.all([typeSvc.list({}), scSvc.list({}), resourceService("invoices").list({})]);
    setTypes(normList(t)); setAssigns(normList(a)); setInvoices(normList(i)); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const concessionGiven = useMemo(() => invoices.reduce((s, i) => s + (+i.concession || 0), 0), [invoices]);
  const byType = useMemo(() => {
    const map = {};
    assigns.forEach((a) => { map[a.type || "Other"] = (map[a.type || "Other"] || 0) + 1; });
    return map;
  }, [assigns]);

  // Types CRUD
  const openType = (t) => setTypeForm(t ? { ...t } : { name: "", type: "Sibling", mode: "Percent", value: 0, note: "", active: true });
  const saveType = async () => { if (!typeForm.name) { toast.error("Name required"); return; } setSaving(true); try { const p = { ...typeForm, value: +typeForm.value || 0 }; if (typeForm.id) await typeSvc.update(typeForm.id, p); else await typeSvc.create(p); toast.success("Saved"); setTypeForm(null); await load(); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };

  // Assign CRUD
  const openAsg = (a) => setAsgForm(a ? { ...a } : { studentId: "", studentName: "", klass: "", concessionId: "", concessionName: "", type: "", mode: "Percent", value: 0, academicYear: year, reason: "", status: "Active" });
  const pickStudent = (id) => { const s = null; setAsgForm((f) => ({ ...f, studentId: id })); };
  const pickType = (id) => { const t = types.find((x) => x.id === id); setAsgForm((f) => ({ ...f, concessionId: id, concessionName: t?.name || "", type: t?.type || "", mode: t?.mode || "Percent", value: t?.value || 0 })); };
  const saveAsg = async () => {
    if (!asgForm.studentId || !asgForm.concessionId) { toast.error("Pick student and concession"); return; }
    setSaving(true);
    try {
      const stu = students.find((x) => x.id === asgForm.studentId);
      const p = { ...asgForm, studentName: stu?.name || asgForm.studentName, klass: stu?.klass || "", value: +asgForm.value || 0, approvedBy: user?.name || "admin" };
      if (asgForm.id) await scSvc.update(asgForm.id, p); else await scSvc.create(p);
      toast.success("Concession assigned"); setAsgForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const delAsg = async (a) => { await scSvc.remove(a.id); load(); };

  const [students, setStudents] = useState([]);
  useEffect(() => { resourceService("students").list({}).then((r) => setStudents(normList(r))); }, []);

  return (
    <div>
      <PageHeader title="Fee Concessions" icon={BadgePercent} subtitle="Sibling · staff ward · RTE · merit · hardship — auto-applied at invoicing"
        actions={tab === "students" ? <Button onClick={() => openAsg()}><Plus size={16} /> Assign concession</Button> : <Button onClick={() => openType()}><Plus size={16} /> New type</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="glass rounded-xl2 shadow-glass p-4"><div className="flex items-center gap-2 mb-1"><PiggyBank size={18} className="text-coral-500" /><span className="text-sm text-navy/55">Concessions given</span></div><p className="font-display text-2xl text-navy">{rupee(concessionGiven)}</p></div>
        <div className="glass rounded-xl2 shadow-glass p-4"><span className="text-sm text-navy/55">Students on concession</span><p className="font-display text-2xl text-navy">{assigns.filter((a) => (a.status || "Active") === "Active").length}</p></div>
        <div className="glass rounded-xl2 shadow-glass p-4 lg:col-span-2"><span className="text-sm text-navy/55">By type</span><div className="flex flex-wrap gap-2 mt-1.5">{Object.entries(byType).map(([t, n]) => <span key={t} className="text-xs px-2 py-1 rounded-lg bg-royal-100 text-royal">{t}: {n}</span>)}{Object.keys(byType).length === 0 && <span className="text-navy/40 text-sm">None yet</span>}</div></div>
      </div>

      <div className="flex gap-1 mb-5">
        {[["students", "Student Concessions", Users2], ["types", "Concession Types", Settings2]].map(([k, label, Icon]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {label}</button>)}
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (<>
        {tab === "students" && (
          <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Student</th><th className="px-4 py-3">Concession</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Value</th><th className="px-4 py-3">Year</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 w-16" /></tr></thead>
              <tbody>
                {assigns.map((a) => (
                  <tr key={a.id} className="border-b border-navy/5">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Avatar name={a.studentName} size={28} /><div><p className="font-medium text-navy">{a.studentName}</p><p className="text-[11px] text-navy/45">{a.klass}</p></div></div></td>
                    <td className="px-4 py-2.5 text-navy/70">{a.concessionName}</td>
                    <td className="px-4 py-2.5"><Badge>{a.type}</Badge></td>
                    <td className="px-4 py-2.5 text-right font-mono">{a.mode === "Percent" ? `${a.value}%` : rupee(a.value)}</td>
                    <td className="px-4 py-2.5 text-navy/55">{a.academicYear}</td>
                    <td className="px-4 py-2.5"><Badge color={(a.status || "Active") === "Active" ? "green" : "gray"}>{a.status || "Active"}</Badge></td>
                    <td className="px-4 py-2.5"><div className="flex gap-1.5"><button onClick={() => openAsg(a)} className="text-navy/40 hover:text-navy"><Pencil size={13} /></button><button onClick={() => delAsg(a)} className="text-coral-500"><Trash2 size={13} /></button></div></td>
                  </tr>
                ))}
                {assigns.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">No student concessions. Assign one — it auto-applies when invoices are generated.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {tab === "types" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((t) => (
              <div key={t.id} className="glass rounded-xl2 shadow-glass p-4">
                <div className="flex items-start justify-between"><div><h3 className="font-display text-navy">{t.name}</h3><Badge>{t.type}</Badge></div><div className="flex gap-1.5"><button onClick={() => openType(t)} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button><button onClick={async () => { await typeSvc.remove(t.id); load(); }} className="text-coral-500"><Trash2 size={14} /></button></div></div>
                <p className="font-display text-xl text-navy mt-2">{t.mode === "Percent" ? `${t.value}%` : rupee(t.value)}</p>
                {t.note && <p className="text-xs text-navy/50 mt-1">{t.note}</p>}
              </div>
            ))}
            {types.length === 0 && <div className="glass rounded-xl2 shadow-glass py-14 text-center text-navy/50 sm:col-span-3">No concession types.</div>}
          </div>
        )}
      </>)}

      {/* Assign modal */}
      <Modal open={!!asgForm} onClose={() => setAsgForm(null)} title={asgForm?.id ? "Edit concession" : "Assign concession"} footer={<ModalFooter onCancel={() => setAsgForm(null)} onSave={saveAsg} saving={saving} />}>
        {asgForm && (
          <div className="space-y-4">
            <div><span className="lbl">Student *</span><RefSelect resource="students" labelKey="name" valueKey="id" value={asgForm.studentId} onChange={pickStudent} placeholder="Select student…" /></div>
            <label className="block"><span className="lbl">Concession *</span><select value={asgForm.concessionId} onChange={(e) => pickType(e.target.value)} className="in"><option value="">Select concession…</option>{types.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.mode === "Percent" ? t.value + "%" : rupee(t.value)})</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="lbl">Mode</span><select value={asgForm.mode} onChange={(e) => setAsgForm((f) => ({ ...f, mode: e.target.value }))} className="in"><option>Percent</option><option>Fixed</option></select></label>
              <label className="block"><span className="lbl">Value {asgForm.mode === "Percent" ? "(%)" : "(₹)"}</span><input type="number" value={asgForm.value} onChange={(e) => setAsgForm((f) => ({ ...f, value: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Academic year</span><input value={asgForm.academicYear} onChange={(e) => setAsgForm((f) => ({ ...f, academicYear: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Status</span><select value={asgForm.status} onChange={(e) => setAsgForm((f) => ({ ...f, status: e.target.value }))} className="in"><option>Active</option><option>Inactive</option></select></label>
            </div>
            <label className="block"><span className="lbl">Reason / remarks</span><input value={asgForm.reason} onChange={(e) => setAsgForm((f) => ({ ...f, reason: e.target.value }))} className="in" /></label>
          </div>
        )}
      </Modal>

      {/* Type modal */}
      <Modal open={!!typeForm} onClose={() => setTypeForm(null)} title={typeForm?.id ? "Edit type" : "New concession type"} footer={<ModalFooter onCancel={() => setTypeForm(null)} onSave={saveType} saving={saving} />}>
        {typeForm && (
          <div className="space-y-4">
            <label className="block"><span className="lbl">Name</span><input value={typeForm.name} onChange={(e) => setTypeForm((f) => ({ ...f, name: e.target.value }))} className="in" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="lbl">Category</span><select value={typeForm.type} onChange={(e) => setTypeForm((f) => ({ ...f, type: e.target.value }))} className="in">{CTYPES.map((c) => <option key={c}>{c}</option>)}</select></label>
              <label className="block"><span className="lbl">Mode</span><select value={typeForm.mode} onChange={(e) => setTypeForm((f) => ({ ...f, mode: e.target.value }))} className="in"><option>Percent</option><option>Fixed</option></select></label>
              <label className="block"><span className="lbl">Value {typeForm.mode === "Percent" ? "(%)" : "(₹)"}</span><input type="number" value={typeForm.value} onChange={(e) => setTypeForm((f) => ({ ...f, value: e.target.value }))} className="in" /></label>
            </div>
            <label className="block"><span className="lbl">Note</span><input value={typeForm.note} onChange={(e) => setTypeForm((f) => ({ ...f, note: e.target.value }))} className="in" /></label>
          </div>
        )}
      </Modal>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
