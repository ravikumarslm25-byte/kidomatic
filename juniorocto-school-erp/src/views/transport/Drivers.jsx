import { useState, useEffect, useMemo } from "react";
import { UserCog, Plus, Pencil, Trash2, Search, ShieldCheck, ShieldAlert, IdCard } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import FileUpload from "@/components/ui/FileUpload";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";

const svc = resourceService("drivers");
const truthy = (v) => v === true || v === "true" || v === 1;
const daysUntil = (d) => (d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null);
const blankDoc = () => ({ name: "", number: "", expiry: "", file: "" });

export default function Drivers() {
  const toast = useToast();
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null); const [q, setQ] = useState("");

  const load = async () => { setLoading(true); setRows(normList(await svc.list({}))); setLoading(false); };
  useEffect(() => { load(); }, []);
  const shown = useMemo(() => rows.filter((r) => !q || `${r.name} ${r.phone} ${r.licenseNo}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);

  const openNew = () => setForm({ name: "", phone: "", altPhone: "", dob: "", address: "", licenseNo: "", licenseType: "LMV / Heavy", licenseExpiry: "", badgeNo: "", experienceYears: 0, joiningDate: "", bloodGroup: "", emergencyContact: "", policeVerified: false, photo: "", documents: [blankDoc()], status: "Active", notes: "" });
  const openEdit = (r) => setForm({ ...r, policeVerified: truthy(r.policeVerified), documents: r.documents?.length ? r.documents : [blankDoc()] });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setDoc = (i, k, v) => setForm((f) => ({ ...f, documents: f.documents.map((d, idx) => (idx === i ? { ...d, [k]: v } : d)) }));

  const save = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    setSaving(true);
    try { const p = { ...form, experienceYears: +form.experienceYears || 0, documents: form.documents.filter((d) => d.name || d.number || d.file) }; if (form.id) await svc.update(form.id, p); else await svc.create(p); toast.success("Driver saved"); setForm(null); await load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (r) => { await svc.remove(r.id); load(); };

  return (
    <div>
      <PageHeader title="Drivers" icon={UserCog} subtitle="Full profile · licence · experience · verification"
        actions={<Button onClick={openNew}><Plus size={16} /> New driver</Button>} />
      <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm"><Search size={15} className="absolute left-3 top-3 text-navy/35" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name / phone / licence" className="ctl w-full pl-8" /></div>
        <span className="text-sm text-navy/50 ml-auto">{shown.length} drivers</span>
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (
        <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Driver</th><th className="px-4 py-3">Licence</th><th className="px-4 py-3">Experience</th><th className="px-4 py-3">Verify</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 w-16" /></tr></thead>
            <tbody>
              {shown.map((r) => { const lexp = daysUntil(r.licenseExpiry); return (
                <tr key={r.id} className="border-b border-navy/5 hover:bg-white/40">
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><Avatar name={r.name} size={32} /><div><p className="font-medium text-navy">{r.name}</p><p className="text-[11px] text-navy/45">{r.phone}</p></div></div></td>
                  <td className="px-4 py-2.5"><span className="font-mono text-navy/70">{r.licenseNo || "—"}</span><p className="text-[11px] text-navy/40">{r.licenseType}{lexp !== null && lexp <= 60 && <span className="text-coral-600 ml-1">· exp {lexp < 0 ? "over" : lexp + "d"}</span>}</p></td>
                  <td className="px-4 py-2.5 text-navy/70">{r.experienceYears || 0} yrs</td>
                  <td className="px-4 py-2.5">{truthy(r.policeVerified) ? <ShieldCheck size={16} className="text-emerald-600" /> : <ShieldAlert size={16} className="text-coral-500" />}</td>
                  <td className="px-4 py-2.5"><Badge color={(r.status || "Active") === "Active" ? "green" : "gray"}>{r.status || "Active"}</Badge></td>
                  <td className="px-4 py-2.5"><div className="flex gap-1.5"><button onClick={() => openEdit(r)} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button><button onClick={() => del(r)} className="text-coral-500"><Trash2 size={14} /></button></div></td>
                </tr>
              ); })}
              {shown.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-navy/40">No drivers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit driver" : "New driver"} size="lg" footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="space-y-5">
            <Section title="Personal">
              <div className="grid sm:grid-cols-2 gap-3">
                <L label="Full name *"><input value={form.name} onChange={(e) => set("name", e.target.value)} className="in" /></L>
                <L label="Phone"><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="in" /></L>
                <L label="Alternate phone"><input value={form.altPhone} onChange={(e) => set("altPhone", e.target.value)} className="in" /></L>
                <L label="Date of birth"><input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} className="in" /></L>
                <L label="Blood group"><input value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)} className="in" /></L>
                <L label="Emergency contact"><input value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} className="in" /></L>
                <L label="Address" full><input value={form.address} onChange={(e) => set("address", e.target.value)} className="in" /></L>
              </div>
            </Section>
            <Section title="Licence & experience">
              <div className="grid sm:grid-cols-2 gap-3">
                <L label="Licence number"><input value={form.licenseNo} onChange={(e) => set("licenseNo", e.target.value)} className="in" /></L>
                <L label="Licence type"><select value={form.licenseType} onChange={(e) => set("licenseType", e.target.value)} className="in"><option>LMV / Heavy</option><option>Heavy (HMV)</option><option>Transport / PSV</option><option>LMV</option></select></L>
                <L label="Licence expiry"><input type="date" value={form.licenseExpiry} onChange={(e) => set("licenseExpiry", e.target.value)} className="in" /></L>
                <L label="Badge / PSV no."><input value={form.badgeNo} onChange={(e) => set("badgeNo", e.target.value)} className="in" /></L>
                <L label="Experience (years)"><input type="number" value={form.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} className="in" /></L>
                <L label="Joining date"><input type="date" value={form.joiningDate} onChange={(e) => set("joiningDate", e.target.value)} className="in" /></L>
              </div>
              <div className="mt-3 flex items-center gap-4"><Toggle label="Police verification done" value={form.policeVerified} onChange={(v) => set("policeVerified", v)} /><L label="Status"><select value={form.status} onChange={(e) => set("status", e.target.value)} className="in"><option>Active</option><option>Inactive</option></select></L></div>
            </Section>
            <Section title="Documents">
              <div className="space-y-2">
                {form.documents.map((d, i) => (
                  <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center rounded-xl border border-navy/10 bg-white/50 p-2">
                    <input value={d.name} onChange={(e) => setDoc(i, "name", e.target.value)} placeholder="Doc name" className="in2" />
                    <input value={d.number} onChange={(e) => setDoc(i, "number", e.target.value)} placeholder="Number" className="in2" />
                    <input type="date" value={d.expiry} onChange={(e) => setDoc(i, "expiry", e.target.value)} className="in2" />
                    <FileUpload value={d.file} onChange={(v) => setDoc(i, "file", v)} folder="drivers" />
                  </div>
                ))}
                <button onClick={() => set("documents", [...form.documents, blankDoc()])} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add document</button>
              </div>
            </Section>
          </div>
        )}
      </Modal>
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}.in2{height:34px;width:100%;border-radius:9px;background:rgba(255,255,255,.85);border:1px solid rgba(20,51,94,.12);padding:0 8px;font-size:13px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const Section = ({ title, children }) => <div><p className="text-xs font-bold uppercase tracking-wide text-royal mb-2">{title}</p>{children}</div>;
const L = ({ label, children, full }) => <label className={`block ${full ? "sm:col-span-2" : ""}`}><span className="block text-xs font-semibold text-navy/60 mb-1.5">{label}</span>{children}</label>;
const Toggle = ({ label, value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)} className="flex items-center gap-2">
    <span className="rounded-full transition relative" style={{ width: 40, height: 22, background: value ? "#1651A3" : "rgba(20,51,94,.2)" }}><span className="absolute top-0.5 rounded-full bg-white transition" style={{ height: 18, width: 18, left: value ? 20 : 2 }} /></span>
    <span className="text-sm text-navy/70">{label}</span>
  </button>
);
