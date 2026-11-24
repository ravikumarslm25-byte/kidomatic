import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, School as SchoolIcon, Palette, GitBranch, Users, Plus, Check, Copy, Mail,
} from "lucide-react";
import { resellerService } from "@/services/reseller.service";
import { PLANS, planList, maxBranches } from "@/config/plans";
import OctoMark from "@/components/brand/OctoMark";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Field from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import { useToast } from "@/store/toast";

const TABS = [
  { id: "overview", label: "Overview", icon: SchoolIcon },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "branches", label: "Branches", icon: GitBranch },
  { id: "team", label: "Team", icon: Users },
];

export default function SchoolDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  const load = async () => { setLoading(true); try { const all = await resellerService.schools(); setSchool(all.find((s) => s.id === id) || null); } finally { setLoading(false); } };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const patch = async (p) => { const s = await resellerService.updateSchool(id, p); setSchool((cur) => ({ ...cur, ...s, ...p })); };

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  if (!school) return <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/50">School not found.</div>;

  return (
    <div>
      <button onClick={() => nav("/schools")} className="flex items-center gap-1.5 text-sm text-royal font-semibold hover:underline mb-3"><ArrowLeft size={15} /> All schools</button>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="grid place-items-center h-12 w-12 rounded-2xl bg-white/70 shadow-soft"><OctoMark size={30} /></div>
        <div className="flex-1 min-w-0"><h1 className="font-display text-[22px] text-navy truncate">{school.name}</h1><p className="text-sm text-navy/50">{school.board} · {school.session}</p></div>
        <Badge color="blue">{PLANS[school.planKey]?.name || school.planKey}</Badge>
        <Badge>{school.status}</Badge>
      </div>

      <div className="flex gap-1.5 mb-5 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium whitespace-nowrap ${tab === t.id ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/70 hover:bg-white/80"}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview school={school} onPatch={patch} toast={toast} />}
      {tab === "branding" && <Branding school={school} onPatch={patch} toast={toast} />}
      {tab === "branches" && <Branches school={school} toast={toast} />}
      {tab === "team" && <Team school={school} toast={toast} />}
    </div>
  );
}

function Overview({ school, onPatch, toast }) {
  const suspend = async () => { const next = school.status === "active" ? "suspended" : "active"; await onPatch({ status: next }); toast.success(`School ${next}`); };
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <h3 className="font-display text-navy text-lg mb-3">Plan</h3>
        <div className="grid gap-2">
          {planList().map((p) => (
            <button key={p.key} onClick={async () => { await onPatch({ planKey: p.key }); toast.success(`Moved to ${p.name}`); }}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left ${school.planKey === p.key ? "border-royal/50 bg-royal-100" : "border-navy/10 bg-white/50 hover:bg-white/70"}`}>
              <div className="flex-1"><p className="font-semibold text-navy text-sm">{p.name} <span className="text-navy/40 font-normal">· ₹{p.priceMonthly}/mo</span></p><p className="text-xs text-navy/50">{p.blurb}</p></div>
              {school.planKey === p.key && <Check size={18} className="text-royal" />}
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="font-display text-navy text-lg mb-3">Status</h3>
        <p className="text-sm text-navy/60 mb-4">{school.status === "active" ? "This school is live. Its staff can log in and use the ERP." : "This school is suspended. Logins are blocked until reactivated."}</p>
        <Button variant={school.status === "active" ? "danger" : "primary"} onClick={suspend}>
          {school.status === "active" ? "Suspend school" : "Reactivate school"}
        </Button>
        <div className="mt-6 pt-4 border-t border-navy/8 text-sm space-y-1.5">
          <div className="flex justify-between"><span className="text-navy/50">Students</span><span className="font-mono text-navy">{school.students ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-navy/50">Branch limit</span><span className="font-mono text-navy">{maxBranches(school.planKey)}</span></div>
        </div>
      </Card>
    </div>
  );
}

function Branding({ school, onPatch, toast }) {
  const [name, setName] = useState(school.branding?.name || school.name);
  const [blue, setBlue] = useState(school.branding?.colors?.blue || "#1651A3");
  const [coral, setCoral] = useState(school.branding?.colors?.coral || "#E85410");
  const [logoUrl, setLogoUrl] = useState(school.branding?.logoUrl || "");
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); try { await onPatch({ branding: { name, logoUrl, colors: { blue, coral } } }); toast.success("Branding saved — cascades to the school's app"); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <h3 className="font-display text-navy text-lg mb-4">White-label</h3>
        <Field label="Display name" name="name" value={name} onChange={(_, v) => setName(v)} />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <ColorInput label="Primary (blue)" value={blue} onChange={setBlue} />
          <ColorInput label="Accent (coral)" value={coral} onChange={setCoral} />
        </div>
        <div className="mt-4"><Field label="Logo URL (optional)" name="logoUrl" value={logoUrl} onChange={(_, v) => setLogoUrl(v)} /></div>
        <Button className="mt-5" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save branding"}</Button>
      </Card>
      <Card className="!p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-navy/8"><p className="text-xs font-semibold uppercase tracking-wide text-navy/45">Live preview</p></div>
        <div className="p-6 grid place-items-center" style={{ background: `radial-gradient(120% 90% at 50% 0%, ${blue}22, transparent)` }}>
          <div className="w-full max-w-xs rounded-2xl bg-white shadow-glass p-5 text-center">
            <div className="mx-auto grid place-items-center h-14 w-14 rounded-2xl text-white mb-3" style={{ background: `linear-gradient(135deg, ${blue}, ${coral})` }}><OctoMark size={34} /></div>
            <p className="font-display text-lg" style={{ color: blue }}>{name || "School name"}</p>
            <p className="text-xs text-navy/45 mt-0.5">Powered by KidoMatic</p>
            <button className="mt-4 h-10 w-full rounded-xl text-white font-semibold text-sm" style={{ background: `linear-gradient(135deg, ${blue}, ${coral})` }}>Sign in</button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-navy/60 mb-1.5">{label}</span>
      <div className="flex items-center gap-2 rounded-xl bg-white/70 border border-navy/12 px-2 h-11">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-9 rounded cursor-pointer border-0 bg-transparent" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent text-sm font-mono text-navy outline-none" />
      </div>
    </label>
  );
}

function Branches({ school, toast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const load = async () => { setLoading(true); try { setRows(await resellerService.branches(school.id)); } finally { setLoading(false); } };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [school.id]);
  const add = async () => {
    if (!form.name) { toast.error("Branch name is required"); return; }
    setSaving(true);
    try { await resellerService.createBranch(school.id, school, form); setForm(null); toast.success("Branch added"); load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const atLimit = rows.length >= maxBranches(school.planKey);
  return (
    <Card pad={false}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div><h3 className="font-display text-navy text-lg">Branches</h3><p className="text-xs text-navy/45">{rows.length} of {maxBranches(school.planKey)} allowed on {PLANS[school.planKey]?.name}</p></div>
        <Button onClick={() => setForm({})} disabled={atLimit}><Plus size={16} /> Add branch</Button>
      </div>
      {loading ? <div className="grid place-items-center py-14"><Spinner size={24} /></div> : (
        <div className="divide-y divide-navy/6">
          {rows.map((b) => (
            <div key={b.id} className="flex items-center gap-3 px-5 py-3">
              <div className="grid place-items-center h-9 w-9 rounded-xl bg-royal-100 text-royal"><GitBranch size={16} /></div>
              <div className="flex-1"><p className="font-medium text-navy text-sm">{b.name}</p><p className="text-xs text-navy/45">{b.address || "—"}</p></div>
              <Badge>{b.status}</Badge>
            </div>
          ))}
          {rows.length === 0 && <p className="px-5 py-8 text-center text-sm text-navy/45">No branches yet.</p>}
          {atLimit && <p className="px-5 py-3 text-center text-xs text-coral-600">Branch limit reached — upgrade the plan for more.</p>}
        </div>
      )}
      <Modal open={!!form} onClose={() => setForm(null)} title="Add branch" size="sm"
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={add} saving={saving} saveLabel="Add" />}>
        {form && (<div className="space-y-4">
          <Field label="Branch name" name="name" value={form.name} onChange={(_, v) => setForm((f) => ({ ...f, name: v }))} required />
          <Field label="Address" name="address" value={form.address} onChange={(_, v) => setForm((f) => ({ ...f, address: v }))} />
        </div>)}
      </Modal>
    </Card>
  );
}

function Team({ school, toast }) {
  const [form, setForm] = useState({ role: "Principal" });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const invite = async () => {
    if (!form.email) { toast.error("Email is required"); return; }
    setSaving(true);
    try { const res = await resellerService.invite(school.id, form); setResult(res); setForm({ role: "Principal" }); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <h3 className="font-display text-navy text-lg mb-1">Invite a school user</h3>
        <p className="text-sm text-navy/50 mb-4">They'll sign in at the school ERP with a temporary password.</p>
        <div className="space-y-4">
          <Field label="Full name" name="name" value={form.name} onChange={set} />
          <Field label="Email" name="email" type="email" value={form.email} onChange={set} required />
          <Field label="Role" name="role" type="select" options={["Principal", "School Admin", "Accountant", "Counsellor", "Class Teacher"]} value={form.role} onChange={set} />
          <Button onClick={invite} disabled={saving}><Mail size={16} /> {saving ? "Sending…" : "Send invite"}</Button>
        </div>
      </Card>
      {result && (
        <Card>
          <div className="flex items-center gap-2 mb-3"><Check size={18} className="text-emerald-500" /><h3 className="font-display text-navy text-lg">Invite created</h3></div>
          <p className="text-sm text-navy/60 mb-4">Share these credentials with {result.user.name || result.user.email}.</p>
          <div className="rounded-2xl bg-white/60 border border-navy/10 p-4 space-y-2 text-sm">
            <Row k="Email" v={result.user.email} />
            <Row k="Role" v={result.user.role} />
            <Row k="Temp password" v={result.tempPassword} mono copy toast={toast} />
          </div>
        </Card>
      )}
    </div>
  );
}
function Row({ k, v, mono, copy, toast }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-navy/50">{k}</span>
      <span className={`text-navy ${mono ? "font-mono" : "font-medium"} flex items-center gap-2`}>{v}
        {copy && <button onClick={() => { navigator.clipboard?.writeText(v); toast.success("Copied"); }} className="text-navy/40 hover:text-navy"><Copy size={13} /></button>}
      </span>
    </div>
  );
}
