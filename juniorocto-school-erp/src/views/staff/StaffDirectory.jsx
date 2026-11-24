import { useState, useEffect, useMemo } from "react";
import { Briefcase, Plus, Trash2, Pencil, ShieldCheck, ShieldAlert, FileWarning, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { CATEGORIES, EMPLOYMENT_TYPES, WINGS, DOC_TYPES, TET_STATUS, CAT_COLOR, daysUntil, isTeaching, truthy } from "./staffKit";

const svc = resourceService("staff");
const blankDoc = () => ({ type: "Aadhaar", number: "", issueDate: "", expiryDate: "", verified: false, file: "" });

export default function StaffDirectory() {
  const toast = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fCat, setFCat] = useState(""); const [fType, setFType] = useState(""); const [fWing, setFWing] = useState(""); const [fStatus, setFStatus] = useState(""); const [q, setQ] = useState("");
  const [form, setForm] = useState(null); const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); setRows(normList(await svc.list({}))); setLoading(false); };
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => rows.filter((r) =>
    (r.status !== "Relieved") &&
    (!fCat || r.category === fCat) && (!fType || r.employmentType === fType) && (!fWing || r.wing === fWing) &&
    (!fStatus || (r.status || "Active") === fStatus) && (!q || `${r.name} ${r.empId} ${r.designation}`.toLowerCase().includes(q.toLowerCase()))
  ), [rows, fCat, fType, fWing, fStatus, q]);

  const openNew = () => setForm({ empId: "", name: "", category: "Teaching", department: "", designation: "", wing: "Whole School", employmentType: "Permanent", email: "", phone: "", gender: "", dob: "", bloodGroup: "", address: "", emergencyContact: "", doj: "", highestQualification: "", hasBEd: false, tetStatus: "Not Applicable", tetExpiry: "", subjects: "", classesHandled: "", policeVerified: false, policeVerifyDate: "", medicalFitness: false, documents: [blankDoc()], isOutsourced: false, vendor: "", salaryBasic: 0, status: "Active", allowLogin: false, loginRole: "Class Teacher" });
  const openEdit = (r) => setForm({ ...r, hasBEd: truthy(r.hasBEd), policeVerified: truthy(r.policeVerified), medicalFitness: truthy(r.medicalFitness), isOutsourced: truthy(r.isOutsourced), allowLogin: truthy(r.allowLogin), documents: r.documents?.length ? r.documents : [blankDoc()] });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setDoc = (i, k, v) => setForm((f) => ({ ...f, documents: f.documents.map((d, idx) => (idx === i ? { ...d, [k]: v } : d)) }));
  const addDoc = () => setForm((f) => ({ ...f, documents: [...f.documents, blankDoc()] }));
  const removeDoc = (i) => setForm((f) => ({ ...f, documents: f.documents.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, salaryBasic: +form.salaryBasic || 0, documents: form.documents.filter((d) => d.type && (d.number || d.file || d.expiryDate)) };
      if (form.id) await svc.update(form.id, payload); else await svc.create(payload);
      const prov = (form.id ? null : payload) && null; // provisioning handled server-side
      toast.success("Staff saved"); setForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (r) => { await svc.remove(r.id); load(); };

  const docsExpiringCount = (r) => (r.documents || []).filter((d) => { const dl = daysUntil(d.expiryDate); return dl !== null && dl <= 90; }).length;

  return (
    <div>
      <PageHeader title="Staff Directory" icon={Briefcase} subtitle="All staff — teaching, admin, management & support (incl. outsourced) · KYC & compliance"
        actions={<Button onClick={openNew}><Plus size={16} /> New Staff</Button>} />

      <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-3 items-end">
        <Fl label="Category"><select value={fCat} onChange={(e) => setFCat(e.target.value)} className="ctl"><option value="">All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Fl>
        <Fl label="Employment"><select value={fType} onChange={(e) => setFType(e.target.value)} className="ctl"><option value="">All</option>{EMPLOYMENT_TYPES.map((c) => <option key={c}>{c}</option>)}</select></Fl>
        <Fl label="Wing"><select value={fWing} onChange={(e) => setFWing(e.target.value)} className="ctl"><option value="">All</option>{WINGS.map((c) => <option key={c}>{c}</option>)}</select></Fl>
        <Fl label="Status"><select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="ctl"><option value="">All</option><option>Active</option><option>Inactive</option></select></Fl>
        <div className="flex-1 min-w-[150px]"><Fl label="Search"><div className="relative"><Search size={14} className="absolute left-3 top-3 text-navy/30" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name / ID / role" className="ctl w-full pl-8" /></div></Fl></div>
        <span className="text-sm text-navy/50">{shown.length} staff</span>
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div>
        : (
          <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45">
                <th className="px-4 py-3">Staff</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Designation</th><th className="px-4 py-3">Wing</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Compliance</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 w-10" />
              </tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className="border-b border-navy/5 hover:bg-white/40">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><Avatar name={r.name} size={32} /><div><p className="font-medium text-navy">{r.name} {truthy(r.isOutsourced) && <span className="text-[10px] text-coral-600">· outsourced</span>}</p><p className="text-[11px] text-navy/45 font-mono">{r.empId}</p></div></div></td>
                    <td className="px-4 py-2.5"><span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: (CAT_COLOR[r.category] || "#999") + "22", color: CAT_COLOR[r.category] }}>{r.category || "—"}</span></td>
                    <td className="px-4 py-2.5 text-navy/80">{r.designation || r.role || "—"}</td>
                    <td className="px-4 py-2.5 text-navy/60">{r.wing || "—"}</td>
                    <td className="px-4 py-2.5 text-navy/60">{r.employmentType || "—"}</td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2">
                      {truthy(r.policeVerified) ? <ShieldCheck size={16} className="text-emerald-600" title="Police verified" /> : <ShieldAlert size={16} className="text-coral-600" title="No police verification" />}
                      {isTeaching(r) && (["Qualified", "Exempted", "Not Applicable"].includes(r.tetStatus) ? null : <Badge color="amber">TET?</Badge>)}
                      {docsExpiringCount(r) > 0 && <span className="flex items-center gap-0.5 text-amber-600 text-xs"><FileWarning size={13} /> {docsExpiringCount(r)}</span>}
                    </div></td>
                    <td className="px-4 py-2.5"><Badge color={(r.status || "Active") === "Active" ? "green" : "gray"}>{r.status || "Active"}</Badge></td>
                    <td className="px-4 py-2.5"><div className="flex gap-1.5"><button onClick={() => navigate(`/staff/view/${r.id}`)} className="text-royal hover:text-royal/70" title="View"><Eye size={15} /></button><button onClick={() => openEdit(r)} className="text-navy/40 hover:text-navy" title="Edit"><Pencil size={14} /></button><button onClick={() => del(r)} className="text-coral-500"><Trash2 size={14} /></button></div></td>
                  </tr>
                ))}
                {shown.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-navy/40">No staff match these filters.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit staff" : "New staff"} size="lg"
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="space-y-5">
            <Section title="Personal">
              <div className="grid sm:grid-cols-2 gap-3">
                <L label="Full name *"><input value={form.name} onChange={(e) => set("name", e.target.value)} className="in" /></L>
                <L label="Employee ID"><input value={form.empId} onChange={(e) => set("empId", e.target.value)} className="in" placeholder="EMP-001" /></L>
                <L label="Gender"><select value={form.gender} onChange={(e) => set("gender", e.target.value)} className="in"><option value="">—</option><option>Male</option><option>Female</option><option>Other</option></select></L>
                <L label="Date of birth"><input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} className="in" /></L>
                <L label="Phone"><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="in" /></L>
                <L label="Email"><input value={form.email} onChange={(e) => set("email", e.target.value)} className="in" /></L>
                <L label="Blood group"><input value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)} className="in" /></L>
                <L label="Emergency contact"><input value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} className="in" /></L>
                <L label="Address" full><input value={form.address} onChange={(e) => set("address", e.target.value)} className="in" /></L>
              </div>
            </Section>

            <Section title="Employment">
              <div className="grid sm:grid-cols-2 gap-3">
                <L label="Category"><select value={form.category} onChange={(e) => set("category", e.target.value)} className="in">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></L>
                <L label="Employment type"><select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)} className="in">{EMPLOYMENT_TYPES.map((c) => <option key={c}>{c}</option>)}</select></L>
                <L label="Department"><RefSelect resource="departments" labelKey="name" value={form.department} onChange={(v) => set("department", v)} placeholder="Department…" /></L>
                <L label="Designation"><RefSelect resource="designations" labelKey="name" value={form.designation} onChange={(v) => set("designation", v)} placeholder="Designation…" /></L>
                <L label="Wing"><select value={form.wing} onChange={(e) => set("wing", e.target.value)} className="in">{WINGS.map((c) => <option key={c}>{c}</option>)}</select></L>
                <L label="Date of joining"><input type="date" value={form.doj} onChange={(e) => set("doj", e.target.value)} className="in" /></L>
                <L label="Basic salary (₹)"><input type="number" value={form.salaryBasic} onChange={(e) => set("salaryBasic", e.target.value)} className="in" /></L>
                <L label="Status"><select value={form.status} onChange={(e) => set("status", e.target.value)} className="in"><option>Active</option><option>Inactive</option></select></L>
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                <Toggle label="Outsourced / agency staff" value={form.isOutsourced} onChange={(v) => set("isOutsourced", v)} />
                {form.isOutsourced && <L label="Vendor / agency"><input value={form.vendor} onChange={(e) => set("vendor", e.target.value)} className="in" /></L>}
                <Toggle label="Allow staff login" value={form.allowLogin} onChange={(v) => set("allowLogin", v)} />
              </div>
            </Section>

            <Section title="Qualifications (teaching)">
              <div className="grid sm:grid-cols-2 gap-3">
                <L label="Highest qualification"><input value={form.highestQualification} onChange={(e) => set("highestQualification", e.target.value)} className="in" placeholder="e.g. M.Sc, M.A" /></L>
                <L label="Subjects (comma-sep)"><input value={form.subjects} onChange={(e) => set("subjects", e.target.value)} className="in" placeholder="Maths, Science" /></L>
                <L label="TET / CTET status"><select value={form.tetStatus} onChange={(e) => set("tetStatus", e.target.value)} className="in">{TET_STATUS.map((t) => <option key={t}>{t}</option>)}</select></L>
                <L label="TET validity / expiry"><input type="date" value={form.tetExpiry} onChange={(e) => set("tetExpiry", e.target.value)} className="in" /></L>
              </div>
              <div className="mt-3"><Toggle label="Holds B.Ed / D.El.Ed" value={form.hasBEd} onChange={(v) => set("hasBEd", v)} /></div>
            </Section>

            <Section title="Compliance">
              <div className="flex flex-wrap gap-5">
                <Toggle label="Police verification done" value={form.policeVerified} onChange={(v) => set("policeVerified", v)} />
                {form.policeVerified && <L label="Verified on"><input type="date" value={form.policeVerifyDate} onChange={(e) => set("policeVerifyDate", e.target.value)} className="in" /></L>}
                <Toggle label="Medical fitness certified" value={form.medicalFitness} onChange={(v) => set("medicalFitness", v)} />
              </div>
            </Section>

            <Section title="Documents (KYC) — with expiry & verification">
              <div className="space-y-2">
                {form.documents.map((d, i) => (
                  <div key={i} className="rounded-xl border border-navy/10 bg-white/50 p-2.5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                      <select value={d.type} onChange={(e) => setDoc(i, "type", e.target.value)} className="in2">{DOC_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                      <input value={d.number} onChange={(e) => setDoc(i, "number", e.target.value)} placeholder="Number" className="in2" />
                      <label className="text-[10px] text-navy/45">Issue<input type="date" value={d.issueDate} onChange={(e) => setDoc(i, "issueDate", e.target.value)} className="in2" /></label>
                      <label className="text-[10px] text-navy/45">Expiry<input type="date" value={d.expiryDate} onChange={(e) => setDoc(i, "expiryDate", e.target.value)} className="in2" /></label>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1"><FileUpload value={d.file} onChange={(v) => setDoc(i, "file", v)} folder="staff-kyc" /></div>
                      <label className="flex items-center gap-1.5 text-xs text-navy/60"><input type="checkbox" checked={!!d.verified} onChange={(e) => setDoc(i, "verified", e.target.checked)} /> Verified</label>
                      <button onClick={() => removeDoc(i)} className="text-coral-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                <button onClick={addDoc} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add document</button>
              </div>
            </Section>
          </div>
        )}
      </Modal>
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}.in2{height:34px;width:100%;border-radius:9px;background:rgba(255,255,255,.85);border:1px solid rgba(20,51,94,.12);padding:0 8px;font-size:13px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const Fl = ({ label, children }) => <div><p className="text-xs font-semibold text-navy/60 mb-1.5">{label}</p>{children}</div>;
const Section = ({ title, children }) => <div><p className="text-xs font-bold uppercase tracking-wide text-royal mb-2">{title}</p>{children}</div>;
const L = ({ label, children, full }) => <label className={`block ${full ? "sm:col-span-2" : ""}`}><span className="block text-xs font-semibold text-navy/60 mb-1.5">{label}</span>{children}</label>;
const Toggle = ({ label, value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)} className="flex items-center gap-2">
    <span className={`w-10 h-5.5 rounded-full transition relative ${value ? "bg-royal" : "bg-navy/20"}`} style={{ width: 40, height: 22 }}><span className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition" style={{ left: value ? 20 : 2 }} /></span>
    <span className="text-sm text-navy/70">{label}</span>
  </button>
);
