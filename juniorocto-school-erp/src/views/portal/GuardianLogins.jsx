import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Check, KeyRound, Copy } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Avatar from "@/components/ui/Avatar";
import RefSelect from "@/components/ui/RefSelect";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { portalService } from "@/services/portal.service";
import { useToast } from "@/store/toast";

const linkSvc = resourceService("guardianLinks");
const stuSvc = resourceService("students");

export default function GuardianLogins() {
  const toast = useToast();
  const [links, setLinks] = useState([]); const [students, setStudents] = useState([]); const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); const [saving, setSaving] = useState(false); const [created, setCreated] = useState(null); const [reset, setReset] = useState(null);

  const load = async () => {
    setLoading(true);
    const [l, s] = await Promise.all([linkSvc.list({}), stuSvc.list({})]);
    setLinks(normList(l)); setStudents(normList(s)); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.studentId || !form.name || !form.email) { toast.error("Student, guardian name and email are required"); return; }
    setSaving(true);
    try {
      const stu = students.find((s) => s.id === form.studentId);
      const res = await portalService.provisionGuardian({ studentId: form.studentId, studentName: stu?.name, klass: stu?.klass, section: stu?.section, name: form.name, email: form.email, phone: form.phone, relationship: form.relationship, password: form.password, isPrimary: form.isPrimary, canPay: form.canPay !== false });
      setCreated({ email: form.email, tempPassword: res?.tempPassword }); setForm(null); load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (l) => { await linkSvc.remove(l.id); load(); };
  const doReset = async () => {
    setSaving(true);
    try { const res = await portalService.resetGuardianPassword({ parentUserId: reset.parentUserId, email: reset.email, password: reset.password || undefined }); setCreated({ email: res?.email || reset.email, tempPassword: res?.tempPassword }); setReset(null); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Guardian Logins" icon={Users} subtitle="Create parent logins and link them to students (siblings share one login)"
        actions={<Button onClick={() => setForm({ studentId: "", name: "", email: "", phone: "", relationship: "Father", isPrimary: true, canPay: true })}><Plus size={16} /> Add guardian login</Button>} />

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (
        <div className="glass rounded-xl2 shadow-glass p-2">
          <div className="divide-y divide-navy/6">
            {links.map((l) => (
              <div key={l.id} className="flex items-center gap-3 px-3 py-3">
                <Avatar name={l.parentName} size={36} />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy">{l.parentName} <span className="text-navy/40 font-normal">· {l.relationship}</span></p><p className="text-xs text-navy/45">{l.parentEmail}</p></div>
                <div className="text-right"><p className="text-sm text-navy">{l.studentName}</p><p className="text-[11px] text-navy/45">{l.klass}{l.section ? `-${l.section}` : ""}</p></div>
                {l.isPrimary && <Badge color="blue">Primary</Badge>}
                {l.canPay && <Badge color="emerald">Can pay</Badge>}
                <button onClick={() => setReset({ parentUserId: l.parentUserId, email: l.parentEmail, password: "" })} className="text-navy/40 hover:text-royal p-1" title="Reset password"><KeyRound size={15} /></button>
                <button onClick={() => del(l)} className="text-coral-500 p-1"><Trash2 size={15} /></button>
              </div>
            ))}
            {links.length === 0 && <p className="px-3 py-10 text-center text-navy/40 text-sm">No guardian logins yet. Add one to give a parent portal access.</p>}
          </div>
        </div>
      )}

      {form && (
        <Modal open onClose={() => setForm(null)} title="Add guardian login" footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} saveLabel="Create login" />}>
          <div className="space-y-3">
            <label className="block"><span className="lbl">Student</span><RefSelect resource="students" labelKey="name" valueKey="id" value={form.studentId} onChange={(v) => setForm((f) => ({ ...f, studentId: v }))} placeholder="Pick a student…" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="lbl">Guardian name</span><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Relationship</span><select value={form.relationship} onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))} className="in">{["Father", "Mother", "Guardian", "Grandparent", "Other"].map((r) => <option key={r}>{r}</option>)}</select></label>
              <label className="block"><span className="lbl">Email (login)</span><input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Phone</span><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Set password (optional)</span><input value={form.password || ""} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="in" placeholder="Auto-generated if blank" /></label>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-navy/60"><input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm((f) => ({ ...f, isPrimary: e.target.checked }))} /> Primary guardian</label>
              <label className="flex items-center gap-2 text-sm text-navy/60"><input type="checkbox" checked={form.canPay !== false} onChange={(e) => setForm((f) => ({ ...f, canPay: e.target.checked }))} /> Can pay fees</label>
            </div>
            <p className="text-[11px] text-navy/45">To link a sibling, create another login with the <b>same email</b> and a different student — they'll share one login and switch between children.</p>
          </div>
          <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
        </Modal>
      )}

      {reset && (
        <Modal open onClose={() => setReset(null)} title="Reset parent password" footer={<ModalFooter onCancel={() => setReset(null)} onSave={doReset} saving={saving} saveLabel="Reset password" />}>
          <div className="space-y-3">
            <p className="text-sm text-navy/60">Resetting the login password for <b>{reset.email}</b>.</p>
            <label className="block"><span className="lbl">New password (optional)</span><input value={reset.password} onChange={(e) => setReset((r) => ({ ...r, password: e.target.value }))} className="in" placeholder="Leave blank to auto-generate" /></label>
            <p className="text-[11px] text-navy/45">The parent should sign in with the new password and change it from their profile.</p>
          </div>
          <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
        </Modal>
      )}

      {created && (
        <Modal open onClose={() => setCreated(null)} title="Login created" footer={<ModalFooter onCancel={() => setCreated(null)} onSave={() => setCreated(null)} saveLabel="Done" />}>
          <div className="text-center py-2">
            <span className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center mx-auto mb-3"><KeyRound size={22} /></span>
            <p className="text-sm text-navy/70 mb-3">Share these credentials with the guardian:</p>
            <div className="rounded-xl bg-navy/5 p-3 text-left text-sm space-y-1">
              <p><span className="text-navy/45">Email:</span> <b>{created.email}</b></p>
              {created.tempPassword && <p><span className="text-navy/45">Password:</span> <b className="font-mono">{created.tempPassword}</b></p>}
            </div>
            <p className="text-[11px] text-navy/45 mt-3">Ask them to sign in at the Parent Portal and change the password.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
