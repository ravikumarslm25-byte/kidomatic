import { useState, useEffect } from "react";
import { User, ShieldCheck, FileText, Lock, Upload, Download, Trash2, Check, Mail, Phone, Briefcase, BadgeCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Avatar from "@/components/ui/Avatar";
import FileUpload from "@/components/ui/FileUpload";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";

const docSvc = resourceService("userDocuments");
const TABS = [
  { id: "info", label: "Basic Info", icon: User },
  { id: "kyc", label: "KYC Documents", icon: ShieldCheck },
  { id: "docs", label: "Letters & Documents", icon: FileText },
  { id: "security", label: "Security", icon: Lock },
];

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("info");
  const [docs, setDocs] = useState([]); const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const all = normList(await docSvc.list({})); setDocs(all.filter((d) => !d.userEmail || d.userEmail === user?.email)); }
    catch { setDocs([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const kyc = docs.filter((d) => d.kind === "KYC");
  const letters = docs.filter((d) => d.kind !== "KYC");

  return (
    <div>
      <PageHeader title="My Profile" icon={User} subtitle="Your information, documents and security" />

      <div className="glass rounded-xl2 shadow-glass p-5 mb-4 flex items-center gap-4">
        <Avatar name={user?.name} size={64} />
        <div className="flex-1">
          <h2 className="font-display text-xl text-navy">{user?.name}</h2>
          <p className="text-sm text-navy/55">{user?.role}</p>
          <p className="text-xs text-navy/45">{user?.email}</p>
        </div>
        <Badge color="emerald">Active</Badge>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-56 shrink-0">
          <div className="glass rounded-xl2 shadow-glass p-2">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition ${tab === t.id ? "btn-grad text-white" : "text-navy/70 hover:bg-white/60"}`}>
                <t.icon size={17} /> {t.label}{t.id === "kyc" && kyc.length > 0 && <span className="ml-auto text-[10px]">{kyc.length}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div> : (
            <>
              {tab === "info" && <BasicInfo user={user} />}
              {tab === "kyc" && <DocList title="KYC Documents" kind="KYC" docs={kyc} user={user} onReload={load} toast={toast} uploadable kinds={["Aadhaar", "PAN", "Passport", "Driving Licence", "Voter ID", "Bank Proof", "Other"]} />}
              {tab === "docs" && <DocList title="Letters & Documents" kind="Document" docs={letters} user={user} onReload={load} toast={toast} uploadable kinds={["Offer Letter", "Appointment Letter", "Experience Letter", "Salary Slip", "Certificate", "Contract", "Other"]} />}
              {tab === "security" && <Security toast={toast} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BasicInfo({ user }) {
  const rows = [
    [User, "Full name", user?.name], [Briefcase, "Role", user?.role],
    [Mail, "Email", user?.email], [Phone, "Phone", user?.phone || "—"],
    [BadgeCheck, "Staff ID", user?.staffId || "—"],
  ];
  return (
    <div className="glass rounded-xl2 shadow-glass p-5">
      <h3 className="font-display text-navy text-lg mb-4">Basic Information</h3>
      <div className="divide-y divide-navy/6">
        {rows.map(([Icon, label, val]) => (
          <div key={label} className="flex items-center gap-3 py-3">
            <span className="h-9 w-9 rounded-xl bg-royal-100 text-royal grid place-items-center"><Icon size={16} /></span>
            <span className="text-sm text-navy/50 w-32">{label}</span>
            <span className="text-sm font-medium text-navy">{val}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-navy/40 mt-3">To change your name, role or staff details, contact your school administrator.</p>
    </div>
  );
}

function DocList({ title, kind, docs, user, onReload, toast, uploadable, kinds }) {
  const [form, setForm] = useState(null); const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!form.fileUrl) { toast.error("Attach a file first"); return; }
    setSaving(true);
    try {
      await docSvc.create({ userEmail: user?.email, userId: user?.id, kind, title: form.title || form.type, number: form.number, fileUrl: form.fileUrl, fileName: form.fileName, issuedOn: form.issuedOn, expiresOn: form.expiresOn, note: form.note, status: "Uploaded", createdAt: new Date().toISOString() });
      toast.success("Document added"); setForm(null); onReload();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (d) => { await docSvc.remove(d.id); onReload(); };

  return (
    <div className="glass rounded-xl2 shadow-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-navy text-lg">{title}</h3>
        {uploadable && <Button onClick={() => setForm({ type: kinds[0], title: "" })}><Upload size={15} /> Add</Button>}
      </div>

      {docs.length === 0 ? <p className="text-sm text-navy/40 py-10 text-center">No documents yet.</p> : (
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white/50 p-3">
              <span className="h-10 w-10 rounded-xl bg-royal-100 text-royal grid place-items-center"><FileText size={18} /></span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy truncate">{d.title}{d.number ? ` · ${d.number}` : ""}</p>
                <p className="text-[11px] text-navy/45">{d.fileName || "file"}{d.issuedOn ? ` · issued ${d.issuedOn}` : ""}{d.expiresOn ? ` · expires ${d.expiresOn}` : ""}</p>
              </div>
              <Badge color={d.status === "Verified" ? "green" : "slate"}>{d.status || "Uploaded"}</Badge>
              {d.fileUrl && <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-royal p-1"><Download size={16} /></a>}
              <button onClick={() => del(d)} className="text-coral-500 p-1"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="mt-4 rounded-xl border border-royal/20 bg-royal-50/40 p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block"><span className="lbl">Type</span><select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, title: e.target.value }))} className="in">{kinds.map((k) => <option key={k}>{k}</option>)}</select></label>
            <label className="block"><span className="lbl">Number / Ref (optional)</span><input value={form.number || ""} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} className="in" /></label>
            <label className="block"><span className="lbl">Issued on</span><input type="date" value={form.issuedOn || ""} onChange={(e) => setForm((f) => ({ ...f, issuedOn: e.target.value }))} className="in" /></label>
            <label className="block"><span className="lbl">Expires on (optional)</span><input type="date" value={form.expiresOn || ""} onChange={(e) => setForm((f) => ({ ...f, expiresOn: e.target.value }))} className="in" /></label>
          </div>
          <div><span className="lbl">File</span><FileUpload value="" onChange={(v) => setForm((f) => ({ ...f, fileUrl: v.publicUrl || v.url, fileName: v.name }))} folder="user-docs" />{form.fileName && <p className="text-[11px] text-emerald-600 mt-1">✓ {form.fileName}</p>}</div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setForm(null)}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? <Spinner size={14} /> : <Check size={15} />} Save</Button></div>
        </div>
      )}
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}

function Security({ toast }) {
  const [f, setF] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const submit = async () => {
    if (!f.currentPassword || !f.newPassword) { toast.error("Fill all fields"); return; }
    if (f.newPassword.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (f.newPassword !== f.confirm) { toast.error("Passwords don't match"); return; }
    setSaving(true);
    try { await authService.changePassword({ currentPassword: f.currentPassword, newPassword: f.newPassword }); toast.success("Password changed"); setF({ currentPassword: "", newPassword: "", confirm: "" }); }
    catch (e) { toast.error(e.message || "Could not change password"); } finally { setSaving(false); }
  };
  return (
    <div className="glass rounded-xl2 shadow-glass p-5 max-w-lg">
      <h3 className="font-display text-navy text-lg mb-1">Reset Password</h3>
      <p className="text-sm text-navy/50 mb-4">Choose a strong password of at least 8 characters.</p>
      <div className="space-y-3">
        <label className="block"><span className="lbl">Current password</span><input type="password" value={f.currentPassword} onChange={(e) => set("currentPassword", e.target.value)} className="in" /></label>
        <label className="block"><span className="lbl">New password</span><input type="password" value={f.newPassword} onChange={(e) => set("newPassword", e.target.value)} className="in" /></label>
        <label className="block"><span className="lbl">Confirm new password</span><input type="password" value={f.confirm} onChange={(e) => set("confirm", e.target.value)} className="in" /></label>
      </div>
      <div className="flex justify-end mt-5"><Button onClick={submit} disabled={saving}>{saving ? <Spinner size={14} /> : <Lock size={15} />} Update password</Button></div>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
