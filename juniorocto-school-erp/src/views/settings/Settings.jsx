import { useState, useEffect } from "react";
import { Settings as Cog, School, Palette, GraduationCap, Users, Plug, Check, Plus, Pencil, Trash2, Shield, Upload } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import FileUpload from "@/components/ui/FileUpload";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useBranding } from "@/store/branding";
import { useToast } from "@/store/toast";
import { FEATURES } from "@/config/features";

const setSvc = resourceService("appSettings");
const roleSvc = resourceService("roles");
const userSvc = resourceService("appUsers");

const TABS = [
  { id: "school", label: "School Profile", icon: School },
  { id: "brand", label: "Branding", icon: Palette },
  { id: "academic", label: "Academic Model", icon: GraduationCap },
  { id: "roles", label: "Users & Roles", icon: Users },
  { id: "integrations", label: "Integrations", icon: Plug },
];

const INTEGRATIONS = [
  { key: "razorpay", name: "Razorpay", desc: "Fee collection & payouts", fields: [["keyId", "Key ID"], ["keySecret", "Key Secret", true]] },
  { key: "whatsapp", name: "WhatsApp Business", desc: "Notices & reminders", fields: [["apiKey", "API Key", true], ["sender", "Sender number"]] },
  { key: "sms", name: "SMS Gateway", desc: "OTP & alerts", fields: [["apiKey", "API Key", true], ["senderId", "Sender ID"]] },
  { key: "email", name: "Email (SMTP / SES)", desc: "Transactional email", fields: [["host", "SMTP host"], ["user", "Username"], ["pass", "Password", true], ["from", "From address"]] },
  { key: "biometric", name: "Biometric Device", desc: "Staff attendance", fields: [["deviceIp", "Device IP"], ["port", "Port"]] },
  { key: "gps", name: "GPS Tracker", desc: "Bus live tracking", fields: [["provider", "Provider"], ["apiKey", "API Key", true]] },
];

export default function Settings() {
  const b = useBranding();
  const toast = useToast();
  const [tab, setTab] = useState("school");
  const [settings, setSettings] = useState(null); const [roles, setRoles] = useState([]); const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [s, r, u] = await Promise.all([setSvc.list({}), roleSvc.list({}), userSvc.list({})]);
    const doc = normList(s)[0] || null;
    setSettings(doc || { schoolName: b?.school?.name || b?.name || "", board: b?.school?.board || "", integrations: {} });
    setRoles(normList(r)); setUsers(normList(u));
    if (doc?.logoUrl || doc?.iconUrl) localStorage.setItem("jo_brand_assets", JSON.stringify({ logoUrl: doc.logoUrl, iconUrl: doc.iconUrl }));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveSettings = async (patch, msg = "Saved") => {
    try {
      const next = { ...settings, ...patch, updatedAt: new Date().toISOString() };
      if (settings?.id) await setSvc.update(settings.id, patch); else { const c = await setSvc.create(next); next.id = c.id || c._id; }
      setSettings(next); toast.success(msg); return next;
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <PageHeader title="Settings" icon={Cog} subtitle="School profile, branding, roles & integrations" />
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-56 shrink-0">
          <div className="glass rounded-xl2 shadow-glass p-2">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition ${tab === t.id ? "btn-grad text-white" : "text-navy/70 hover:bg-white/60"}`}>
                <t.icon size={17} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div> : (
            <>
              {tab === "school" && <SchoolProfile settings={settings} onSave={saveSettings} />}
              {tab === "brand" && <Branding settings={settings} branding={b} onSave={saveSettings} />}
              {tab === "academic" && <AcademicModel />}
              {tab === "roles" && <UsersRoles roles={roles} users={users} onReload={load} toast={toast} />}
              {tab === "integrations" && <Integrations settings={settings} onSave={saveSettings} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SchoolProfile({ settings, onSave }) {
  const [f, setF] = useState(settings || {});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = async () => { setSaving(true); await onSave(f, "School profile saved"); setSaving(false); };
  const F = ({ k, label, ...p }) => <label className="block"><span className="lbl">{label}</span><input value={f[k] || ""} onChange={(e) => set(k, e.target.value)} className="in" {...p} /></label>;
  return (
    <div className="glass rounded-xl2 shadow-glass p-5">
      <h3 className="font-display text-navy text-lg mb-4">School Profile</h3>
      <p className="text-xs font-bold uppercase text-royal mb-2">Identity</p>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <F k="schoolName" label="School name" />
        <F k="legalName" label="Legal / registered name" />
        <F k="registrationNo" label="Registration no." />
        <F k="affiliationNo" label="Affiliation / recognition no." />
        <F k="udiseCode" label="UDISE code" />
        <label className="block"><span className="lbl">Board</span><select value={f.board || ""} onChange={(e) => set("board", e.target.value)} className="in"><option value="">Select\u2026</option>{["CBSE", "ICSE", "State Board", "IB", "IGCSE", "NIOS"].map((x) => <option key={x}>{x}</option>)}</select></label>
        <F k="medium" label="Medium of instruction" />
        <F k="category" label="Category (e.g. Co-ed, Day)" />
        <F k="established" label="Established (year)" />
      </div>
      <p className="text-xs font-bold uppercase text-royal mb-2">Contact</p>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <F k="principalName" label="Principal / Head" />
        <F k="email" label="Email" type="email" />
        <F k="phone" label="Phone" />
        <F k="altPhone" label="Alternate phone" />
        <F k="website" label="Website" />
      </div>
      <p className="text-xs font-bold uppercase text-royal mb-2">Address & statutory</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block sm:col-span-2"><span className="lbl">Address line</span><input value={f.addressLine || ""} onChange={(e) => set("addressLine", e.target.value)} className="in" /></label>
        <F k="city" label="City" /><F k="district" label="District" /><F k="state" label="State" /><F k="pincode" label="Pincode" />
        <F k="gstin" label="GSTIN" /><F k="pan" label="PAN" />
      </div>
      <div className="flex justify-end mt-5"><Button onClick={save} disabled={saving}>{saving ? <Spinner size={14} /> : <Check size={15} />} Save changes</Button></div>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}

function Branding({ settings, branding, onSave }) {
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || "");
  const [iconUrl, setIconUrl] = useState(settings?.iconUrl || "");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    localStorage.setItem("jo_brand_assets", JSON.stringify({ logoUrl, iconUrl }));
    await onSave({ logoUrl, iconUrl }, "Branding saved \u2014 reloading to apply");
    setSaving(false);
    setTimeout(() => window.location.reload(), 700);
  };
  return (
    <div className="glass rounded-xl2 shadow-glass p-5">
      <div className="flex items-center justify-between mb-4"><h3 className="font-display text-navy text-lg">Branding</h3><Badge color="blue">White-label</Badge></div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <p className="lbl">Full logo <span className="text-navy/40 font-normal">\u2014 header, invoices, printables</span></p>
          <div className="rounded-xl border border-navy/10 bg-white/60 p-4 mb-2 grid place-items-center min-h-[80px]">{logoUrl ? <img src={logoUrl} alt="logo" className="max-h-16 object-contain" /> : <span className="text-navy/35 text-sm">No logo uploaded</span>}</div>
          <FileUpload value="" onChange={(v) => setLogoUrl(v.publicUrl || v.url)} folder="branding" />
        </div>
        <div>
          <p className="lbl">Icon / mark <span className="text-navy/40 font-normal">\u2014 favicon, small logo, mobile</span></p>
          <div className="rounded-xl border border-navy/10 bg-white/60 p-4 mb-2 grid place-items-center min-h-[80px]">{iconUrl ? <img src={iconUrl} alt="icon" className="h-14 w-14 object-contain rounded-lg" /> : <span className="text-navy/35 text-sm">No icon uploaded</span>}</div>
          <FileUpload value="" onChange={(v) => setIconUrl(v.publicUrl || v.url)} folder="branding" />
        </div>
      </div>

      <p className="text-xs font-semibold text-navy/60 mt-5 mb-2">Brand colours</p>
      <div className="flex flex-wrap gap-3">
        {Object.entries(branding?.colors || {}).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 rounded-xl bg-white/60 border border-navy/10 px-3 py-2">
            <span className="h-6 w-6 rounded-lg border border-white/70" style={{ background: v }} />
            <div><p className="text-xs font-semibold text-navy capitalize">{k}</p><p className="text-[10px] font-mono text-navy/50">{v}</p></div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-5"><Button onClick={save} disabled={saving}>{saving ? <Spinner size={14} /> : <Upload size={15} />} Save branding</Button></div>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}`}</style>
    </div>
  );
}

function AcademicModel() {
  return (
    <div className="glass rounded-xl2 shadow-glass p-5">
      <h3 className="font-display text-navy text-lg mb-1">Academic Model</h3>
      <p className="text-sm text-navy/50 mb-4">Drives whether classes use observation-based or exam-based assessment.</p>
      <div className="grid sm:grid-cols-3 gap-3">
        {[["Early Years", "Nursery\u2013UKG \u00b7 observations, milestones, portfolio"], ["K-12", "Grade 1\u201312 \u00b7 exams, marks, marksheets"], ["Both (this school)", "Runs Early Years + K-12 side by side"]].map(([t, d], i) => (
          <div key={t} className={`rounded-2xl border p-4 ${i === 2 ? "border-royal/40 bg-royal-100" : "border-navy/10 bg-white/50"}`}>
            <div className="flex items-center justify-between"><p className="font-semibold text-navy">{t}</p>{i === 2 && <Check size={16} className="text-royal" />}</div>
            <p className="text-xs text-navy/55 mt-1">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersRoles({ roles, users, onReload, toast }) {
  const [sub, setSub] = useState("roles");
  const [roleForm, setRoleForm] = useState(null); const [userForm, setUserForm] = useState(null); const [saving, setSaving] = useState(false);
  const userCount = (rid, rname) => users.filter((u) => u.roleId === rid || u.roleName === rname).length;

  const saveRole = async () => {
    if (!roleForm.name) { toast.error("Role name required"); return; }
    setSaving(true);
    try { const p = { name: roleForm.name, description: roleForm.description, isSystem: roleForm.isSystem || false, permissions: roleForm.permissions || {} }; if (roleForm.id) await roleSvc.update(roleForm.id, p); else await roleSvc.create(p); toast.success("Role saved"); setRoleForm(null); onReload(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const delRole = async (r) => { if (r.isSystem) { toast.error("System roles can't be deleted"); return; } await roleSvc.remove(r.id); onReload(); };
  const saveUser = async () => {
    if (!userForm.name || !userForm.email) { toast.error("Name and email required"); return; }
    setSaving(true);
    try { const role = roles.find((r) => r.id === userForm.roleId); const p = { ...userForm, roleName: role?.name || "" }; if (userForm.id) await userSvc.update(userForm.id, p); else await userSvc.create({ ...p, status: p.status || "Active", createdAt: new Date().toISOString() }); toast.success("User saved"); setUserForm(null); onReload(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const delUser = async (u) => { await userSvc.remove(u.id); onReload(); };

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {[["roles", "Roles & Permissions"], ["users", "Users"]].map(([k, l]) => <button key={k} onClick={() => setSub(k)} className={`px-4 h-9 rounded-xl text-sm font-medium ${sub === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}>{l}</button>)}
      </div>

      {sub === "roles" ? (
        <div className="glass rounded-xl2 shadow-glass p-2">
          <div className="flex justify-between items-center px-3 py-2"><p className="font-semibold text-navy">Roles</p><Button onClick={() => setRoleForm({ name: "", description: "", isSystem: false, permissions: {} })}><Plus size={15} /> New role</Button></div>
          <div className="divide-y divide-navy/6">
            {roles.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-3">
                <span className="h-9 w-9 rounded-xl bg-royal-100 text-royal grid place-items-center"><Shield size={16} /></span>
                <div className="flex-1"><p className="font-medium text-navy text-sm flex items-center gap-2">{r.name}{r.isSystem && <Badge color="blue">System</Badge>}</p><p className="text-xs text-navy/45">{r.description}</p></div>
                <Badge color="gray">{userCount(r.id, r.name)} users</Badge>
                <button onClick={() => setRoleForm({ ...r, permissions: r.permissions || {} })} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button>
                {!r.isSystem && <button onClick={() => delRole(r)} className="text-coral-500"><Trash2 size={14} /></button>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl2 shadow-glass p-2">
          <div className="flex justify-between items-center px-3 py-2"><p className="font-semibold text-navy">Users</p><Button onClick={() => setUserForm({ name: "", email: "", phone: "", roleId: roles[0]?.id || "", status: "Active" })}><Plus size={15} /> New user</Button></div>
          <div className="divide-y divide-navy/6">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-3 py-3">
                <span className="h-9 w-9 rounded-xl bg-navy/8 text-navy grid place-items-center text-sm font-semibold">{(u.name || "?").slice(0, 1)}</span>
                <div className="flex-1"><p className="font-medium text-navy text-sm">{u.name}</p><p className="text-xs text-navy/45">{u.email}</p></div>
                <Badge color="blue">{u.roleName || "\u2014"}</Badge>
                <Badge color={u.status === "Active" ? "green" : "gray"}>{u.status}</Badge>
                <button onClick={() => setUserForm({ ...u })} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button>
                <button onClick={() => delUser(u)} className="text-coral-500"><Trash2 size={14} /></button>
              </div>
            ))}
            {users.length === 0 && <p className="px-3 py-8 text-center text-navy/40 text-sm">No users yet.</p>}
          </div>
        </div>
      )}

      {roleForm && <RoleEditor form={roleForm} setForm={setRoleForm} onClose={() => setRoleForm(null)} onSave={saveRole} saving={saving} />}
      {userForm && <UserEditor form={userForm} setForm={setUserForm} roles={roles} onClose={() => setUserForm(null)} onSave={saveUser} saving={saving} />}
    </div>
  );
}

function RoleEditor({ form, setForm, onClose, onSave, saving }) {
  const sysFull = form.isSystem && /admin|principal/i.test(form.name || "");
  const perm = form.permissions || {};
  const setPerm = (fk, level, val) => setForm((f) => { const p = { ...(f.permissions || {}) }; const cur = { ...(p[fk] || {}) }; cur[level] = val; if (level === "manage" && val) cur.view = true; if (level === "view" && !val) cur.manage = false; p[fk] = cur; return { ...f, permissions: p }; });
  const allView = FEATURES.every((ft) => perm[ft.key]?.view);
  const toggleAll = (on) => setForm((f) => ({ ...f, permissions: Object.fromEntries(FEATURES.map((ft) => [ft.key, { view: on, manage: on }])) }));
  return (
    <Modal open onClose={onClose} title={form.id ? "Edit role" : "New role"} size="lg" footer={<ModalFooter onCancel={onClose} onSave={onSave} saving={saving} />}>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block"><span className="lbl">Role name</span><input value={form.name} disabled={form.isSystem} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="in disabled:opacity-60" /></label>
          <label className="block"><span className="lbl">Description</span><input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="in" /></label>
        </div>
        {sysFull ? <div className="rounded-xl bg-royal-50 border border-royal/20 p-3 text-sm text-navy/70">This is a system role with <b>full access</b> to every feature. Permissions can't be narrowed.</div> : (
          <div>
            <div className="flex items-center justify-between mb-2"><p className="lbl mb-0">Permissions</p><button onClick={() => toggleAll(!allView)} className="text-xs text-royal font-semibold">{allView ? "Clear all" : "Grant all"}</button></div>
            <div className="rounded-xl border border-navy/10 overflow-hidden max-h-[46vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white"><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-3 py-2">Feature</th><th className="px-3 py-2 text-center w-20">View</th><th className="px-3 py-2 text-center w-20">Manage</th></tr></thead>
                <tbody>
                  {FEATURES.map((ft) => (
                    <tr key={ft.key} className="border-b border-navy/5">
                      <td className="px-3 py-2 text-navy">{ft.label}</td>
                      <td className="px-3 py-2 text-center"><input type="checkbox" checked={!!perm[ft.key]?.view} onChange={(e) => setPerm(ft.key, "view", e.target.checked)} /></td>
                      <td className="px-3 py-2 text-center"><input type="checkbox" checked={!!perm[ft.key]?.manage} onChange={(e) => setPerm(ft.key, "manage", e.target.checked)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-navy/45 mt-2">View = can open & read. Manage = can create / edit / delete. An empty matrix means the role isn't restricted yet.</p>
          </div>
        )}
      </div>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </Modal>
  );
}

function UserEditor({ form, setForm, roles, onClose, onSave, saving }) {
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Modal open onClose={onClose} title={form.id ? "Edit user" : "New user"} footer={<ModalFooter onCancel={onClose} onSave={onSave} saving={saving} />}>
      <div className="space-y-4">
        <label className="block"><span className="lbl">Full name</span><input value={form.name} onChange={(e) => set("name", e.target.value)} className="in" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="lbl">Email</span><input value={form.email} onChange={(e) => set("email", e.target.value)} className="in" /></label>
          <label className="block"><span className="lbl">Phone</span><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="in" /></label>
          <label className="block"><span className="lbl">Role</span><select value={form.roleId} onChange={(e) => set("roleId", e.target.value)} className="in"><option value="">Select\u2026</option>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
          <label className="block"><span className="lbl">Status</span><select value={form.status} onChange={(e) => set("status", e.target.value)} className="in"><option>Active</option><option>Inactive</option></select></label>
        </div>
        <p className="text-[11px] text-navy/45">Assigning a role here controls what this user can see and do across the ERP.</p>
      </div>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </Modal>
  );
}

function Integrations({ settings, onSave }) {
  const [cfg, setCfg] = useState(settings?.integrations || {});
  const [saving, setSaving] = useState(false);
  const setField = (key, k, v) => setCfg((c) => ({ ...c, [key]: { ...(c[key] || {}), [k]: v } }));
  const toggle = (key) => setCfg((c) => ({ ...c, [key]: { ...(c[key] || {}), enabled: !(c[key]?.enabled) } }));
  const save = async () => { setSaving(true); await onSave({ integrations: cfg }, "Integrations saved"); setSaving(false); };
  return (
    <div className="space-y-3">
      {INTEGRATIONS.map((it) => { const on = !!cfg[it.key]?.enabled; return (
        <div key={it.key} className="glass rounded-xl2 shadow-glass p-4">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 rounded-2xl bg-white/70 shadow-soft grid place-items-center text-royal"><Plug size={18} /></span>
            <div className="flex-1"><p className="font-semibold text-navy text-sm">{it.name}</p><p className="text-xs text-navy/45">{it.desc}</p></div>
            <button onClick={() => toggle(it.key)} className="flex items-center gap-2"><span className="rounded-full transition relative" style={{ width: 42, height: 24, background: on ? "#16a34a" : "rgba(20,51,94,.2)" }}><span className="absolute top-0.5 rounded-full bg-white transition" style={{ height: 20, width: 20, left: on ? 20 : 2 }} /></span></button>
          </div>
          {on && <div className="grid sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-navy/6">
            {it.fields.map(([k, label, secret]) => <label key={k} className="block"><span className="lbl">{label}</span><input type={secret ? "password" : "text"} value={cfg[it.key]?.[k] || ""} onChange={(e) => setField(it.key, k, e.target.value)} className="in" /></label>)}
          </div>}
        </div>
      ); })}
      <div className="flex justify-end"><Button onClick={save} disabled={saving}>{saving ? <Spinner size={14} /> : <Check size={15} />} Save integrations</Button></div>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
