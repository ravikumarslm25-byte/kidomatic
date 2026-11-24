import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Megaphone, Mail, Plus, Pencil, Trash2, Eye, Pin, Send, BarChart3, Search, Paperclip, Check, X, FileText, Users2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import FileUpload from "@/components/ui/FileUpload";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";
import { useBranding } from "@/store/branding";
import { CATEGORIES, PRIORITIES, AUDIENCE_TYPES, CHANNELS, priorityMeta, truthy, fmtDate, classOptions, sectionOptions, roleOptions, resolveRecipients, audienceLabel } from "./commKit";

const svc = resourceService("communications");
const ackSvc = resourceService("commAcks");

export default function Communications() {
  const loc = useLocation();
  const type = loc.pathname.includes("circular") ? "Circular" : "Announcement";
  const isCirc = type === "Circular";
  const toast = useToast();
  const { user } = useAuth();
  const brand = useBranding();

  const [rows, setRows] = useState([]); const [acks, setAcks] = useState([]); const [students, setStudents] = useState([]); const [staff, setStaff] = useState([]); const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null); const [view, setView] = useState(null); const [track, setTrack] = useState(null);
  const [fStatus, setFStatus] = useState(""); const [fCat, setFCat] = useState(""); const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const [r, a, st, sf, tp] = await Promise.all([svc.list({}), ackSvc.list({}), resourceService("students").list({}), resourceService("staff").list({}), resourceService("commTemplates").list({})]);
    setRows(normList(r).filter((x) => x.type === type)); setAcks(normList(a)); setStudents(normList(st)); setStaff(normList(sf)); setTemplates(normList(tp).filter((t) => t.type === type)); setLoading(false);
  };
  useEffect(() => { load(); }, [type]);

  const ackAgg = useMemo(() => { const m = {}; acks.forEach((a) => { const g = m[a.commId] = m[a.commId] || { read: 0, ack: 0 }; if (a.status === "Read" || a.status === "Acknowledged") g.read++; if (a.status === "Acknowledged") g.ack++; }); return m; }, [acks]);
  const shown = useMemo(() => rows
    .filter((r) => (!fStatus || r.status === fStatus) && (!fCat || r.category === fCat) && (!q || `${r.title} ${r.body}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (truthy(b.pinned) - truthy(a.pinned)) || (b.createdAt || "").localeCompare(a.createdAt || "")), [rows, fStatus, fCat, q]);

  const blank = () => ({ type, title: "", body: "", category: "General", priority: "Normal", audienceType: "Everyone", audienceClasses: [], audienceSections: [], audienceRoles: [], channels: ["In-app"], attachments: [], pinned: false, requireAck: isCirc, publishAt: "", expiryAt: "" });
  const openNew = () => setForm(blank());
  const openEdit = (r) => setForm({ ...r, audienceClasses: r.audienceClasses || [], audienceSections: r.audienceSections || [], audienceRoles: r.audienceRoles || [], channels: r.channels || ["In-app"], attachments: r.attachments || [], pinned: truthy(r.pinned), requireAck: truthy(r.requireAck) });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleArr = (k, val) => setForm((f) => ({ ...f, [k]: f[k].includes(val) ? f[k].filter((x) => x !== val) : [...f[k], val] }));

  const applyTemplate = (id) => { const t = templates.find((x) => x.id === id); if (t) setForm((f) => ({ ...f, title: t.title, body: t.body, category: t.category || f.category })); };

  const persist = async (publish) => {
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const recips = resolveRecipients(form, students, staff);
      const base = { ...form, createdByName: user?.name || "admin", recipientCount: recips.length };
      if (publish) { base.status = "Published"; base.publishedAt = new Date().toISOString(); if (isCirc && !base.circularNo) base.circularNo = `CIR/${new Date().getFullYear()}/${String(rows.length + 1).padStart(3, "0")}`; }
      else base.status = form.publishAt ? "Scheduled" : (form.status && form.status !== "Published" ? form.status : "Draft");
      if (form.id) await svc.update(form.id, base); else await svc.create({ ...base, createdAt: new Date().toISOString() });
      toast.success(publish ? `${type} published to ${recips.length} recipient(s)` : "Saved as draft");
      setForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (r) => { await svc.remove(r.id); load(); };
  const togglePin = async (r) => { await svc.update(r.id, { pinned: !truthy(r.pinned) }); load(); };
  const publishNow = async (r) => { const recips = resolveRecipients(r, students, staff); await svc.update(r.id, { status: "Published", publishedAt: new Date().toISOString(), recipientCount: recips.length, ...(isCirc && !r.circularNo ? { circularNo: `CIR/${new Date().getFullYear()}/${String(rows.length + 1).padStart(3, "0")}` } : {}) }); toast.success("Published"); load(); };

  const Icon = isCirc ? Mail : Megaphone;
  return (
    <div>
      <PageHeader title={isCirc ? "Circulars" : "Announcements"} icon={Icon}
        subtitle={isCirc ? "Formal circulars with numbering & acknowledgement tracking" : "Notices to parents, students & staff — targeted, scheduled, multi-channel"}
        actions={<Button onClick={openNew}><Plus size={16} /> New {type.toLowerCase()}</Button>} />

      <div className="glass rounded-xl2 shadow-glass p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs"><Search size={15} className="absolute left-3 top-2.5 text-navy/35" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="ctl w-full pl-8" /></div>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="ctl"><option value="">All status</option><option>Draft</option><option>Scheduled</option><option>Published</option><option>Archived</option></select>
        <select value={fCat} onChange={(e) => setFCat(e.target.value)} className="ctl"><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <span className="text-sm text-navy/50 ml-auto">{shown.length}</span>
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (
        <div className="space-y-3">
          {shown.map((r) => { const pm = priorityMeta(r.priority); const agg = ackAgg[r.id] || { read: 0, ack: 0 }; return (
            <div key={r.id} className="glass rounded-xl2 shadow-glass p-4 flex gap-4" style={{ borderLeft: `4px solid ${pm.color}` }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {truthy(r.pinned) && <Pin size={14} className="text-royal" />}
                  {r.circularNo && <span className="font-mono text-xs text-navy/50">{r.circularNo}</span>}
                  <h3 className="font-display text-navy truncate">{r.title}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: pm.bg, color: pm.color }}>{r.priority}</span>
                  <Badge color={r.status === "Published" ? "green" : r.status === "Scheduled" ? "amber" : r.status === "Archived" ? "gray" : "blue"}>{r.status}</Badge>
                </div>
                <p className="text-sm text-navy/60 mt-1 line-clamp-2">{r.body}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-navy/45 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-navy/6">{r.category}</span>
                  <span className="flex items-center gap-1"><Users2 size={12} /> {audienceLabel(r)}</span>
                  {(r.channels || []).length > 0 && <span>{(r.channels || []).join(" · ")}</span>}
                  {(r.attachments || []).length > 0 && <span className="flex items-center gap-1"><Paperclip size={12} /> {(r.attachments || []).length}</span>}
                  <span>{fmtDate(r.publishedAt || r.createdAt)}</span>
                  {r.status === "Published" && <span className="text-royal">{r.recipientCount || 0} sent · {agg.read} read{truthy(r.requireAck) ? ` · ${agg.ack} ack` : ""}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex gap-1.5">
                  <button onClick={() => setView(r)} className="text-navy/40 hover:text-royal" title="View"><Eye size={15} /></button>
                  <button onClick={() => togglePin(r)} className={truthy(r.pinned) ? "text-royal" : "text-navy/40 hover:text-navy"} title="Pin"><Pin size={15} /></button>
                  <button onClick={() => openEdit(r)} className="text-navy/40 hover:text-navy" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => del(r)} className="text-coral-500" title="Delete"><Trash2 size={14} /></button>
                </div>
                {r.status !== "Published" ? <button onClick={() => publishNow(r)} className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><Send size={12} /> Publish</button>
                  : <button onClick={() => setTrack(r)} className="text-xs font-semibold text-royal flex items-center gap-1"><BarChart3 size={12} /> Track</button>}
              </div>
            </div>
          ); })}
          {shown.length === 0 && <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/40">No {type.toLowerCase()}s yet.</div>}
        </div>
      )}

      {form && <Composer type={type} isCirc={isCirc} form={form} set={set} toggleArr={toggleArr} templates={templates} applyTemplate={applyTemplate} students={students} staff={staff} saving={saving} onClose={() => setForm(null)} onDraft={() => persist(false)} onPublish={() => persist(true)} />}
      {view && <Viewer r={view} brand={brand} onClose={() => setView(null)} />}
      {track && <Tracker comm={track} students={students} staff={staff} onClose={() => setTrack(null)} />}
      <style>{`.ctl{height:36px;border-radius:10px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:10px 12px;font-size:14px;color:#14335E;outline:none}.chip{padding:5px 10px;border-radius:9px;font-size:13px;border:1px solid rgba(20,51,94,.14);cursor:pointer}.chip-on{background:#1651A3;color:#fff;border-color:#1651A3}`}</style>
    </div>
  );
}

function Composer({ type, isCirc, form, set, toggleArr, templates, applyTemplate, students, staff, saving, onClose, onDraft, onPublish }) {
  const classes = classOptions(students); const sections = sectionOptions(students); const roles = roleOptions(staff);
  const addFile = (v) => set("attachments", [...(form.attachments || []), v]);
  return (
    <Modal open onClose={onClose} title={`${form.id ? "Edit" : "New"} ${type.toLowerCase()}`} size="lg"
      footer={<div className="flex items-center justify-between w-full"><button onClick={onClose} className="text-sm text-navy/50 px-3">Cancel</button><div className="flex gap-2"><Button variant="outline" onClick={onDraft} disabled={saving}>Save draft</Button><Button onClick={onPublish} disabled={saving}>{saving ? <Spinner size={14} /> : <Send size={15} />} Publish</Button></div></div>}>
      <div className="space-y-4">
        {templates.length > 0 && <label className="block"><span className="lbl">Start from template</span><select onChange={(e) => e.target.value && applyTemplate(e.target.value)} className="in"><option value="">— none —</option>{templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>}
        <label className="block"><span className="lbl">Title *</span><input value={form.title} onChange={(e) => set("title", e.target.value)} className="in" /></label>
        <label className="block"><span className="lbl">Message</span><textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={5} className="in" /></label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block"><span className="lbl">Category</span><select value={form.category} onChange={(e) => set("category", e.target.value)} className="in">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="block"><span className="lbl">Priority</span><select value={form.priority} onChange={(e) => set("priority", e.target.value)} className="in">{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></label>
        </div>
        <div>
          <span className="lbl">Audience</span>
          <select value={form.audienceType} onChange={(e) => set("audienceType", e.target.value)} className="in mb-2">{AUDIENCE_TYPES.map((a) => <option key={a}>{a}</option>)}</select>
          {form.audienceType === "Specific Classes" && <ChipPick opts={classes} sel={form.audienceClasses} onToggle={(v) => toggleArr("audienceClasses", v)} empty="No classes found" />}
          {form.audienceType === "Specific Sections" && <ChipPick opts={sections} sel={form.audienceSections} onToggle={(v) => toggleArr("audienceSections", v)} empty="No sections found" />}
          {form.audienceType === "Specific Roles" && <ChipPick opts={roles} sel={form.audienceRoles} onToggle={(v) => toggleArr("audienceRoles", v)} empty="No roles found" />}
        </div>
        <div>
          <span className="lbl">Delivery channels</span>
          <div className="flex flex-wrap gap-2">{CHANNELS.map((c) => <button key={c} type="button" onClick={() => toggleArr("channels", c)} className={`chip ${form.channels.includes(c) ? "chip-on" : ""}`}>{c}</button>)}</div>
          <p className="text-[11px] text-navy/40 mt-1">In-app is live. Email / SMS / WhatsApp are queued for the delivery gateway (same hook as fee reminders).</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block"><span className="lbl">Schedule publish (optional)</span><input type="datetime-local" value={form.publishAt} onChange={(e) => set("publishAt", e.target.value)} className="in" /></label>
          <label className="block"><span className="lbl">Expiry (optional)</span><input type="date" value={form.expiryAt} onChange={(e) => set("expiryAt", e.target.value)} className="in" /></label>
        </div>
        <div><span className="lbl">Attachments</span>
          <div className="flex flex-wrap gap-2 mb-2">{(form.attachments || []).map((a, i) => <span key={i} className="text-xs px-2 py-1 rounded bg-navy/6 flex items-center gap-1"><Paperclip size={11} /> {a.name || `file ${i + 1}`}<button onClick={() => set("attachments", form.attachments.filter((_, idx) => idx !== i))}><X size={11} /></button></span>)}</div>
          <FileUpload value="" onChange={addFile} folder="communications" />
        </div>
        <div className="flex items-center gap-5">
          <Toggle label="Pin to top" value={form.pinned} onChange={(v) => set("pinned", v)} />
          <Toggle label="Require acknowledgement" value={form.requireAck} onChange={(v) => set("requireAck", v)} />
        </div>
      </div>
    </Modal>
  );
}
const ChipPick = ({ opts, sel, onToggle, empty }) => opts.length === 0 ? <p className="text-sm text-navy/40">{empty}</p> : (
  <div className="flex flex-wrap gap-2">{opts.map((o) => <button key={o} type="button" onClick={() => onToggle(o)} className={`chip ${sel.includes(o) ? "chip-on" : ""}`}>{o}</button>)}</div>
);

function Viewer({ r, brand, onClose }) {
  return (
    <Modal open onClose={onClose} title={r.type} size="lg" footer={<ModalFooter onCancel={onClose} onSave={() => window.print()} saveLabel="Print" />}>
      <div className="bg-white rounded-xl border border-navy/10 p-6">
        <div className="text-center border-b border-navy/10 pb-3 mb-3">
          <p className="font-display text-lg text-navy">{brand?.name || "School"}</p>
          {r.circularNo && <p className="text-xs text-navy/50">Circular No: {r.circularNo} · {fmtDate(r.publishedAt || r.createdAt)}</p>}
        </div>
        <div className="flex items-center gap-2 mb-2"><span className="text-[11px] px-2 py-0.5 rounded" style={{ background: priorityMeta(r.priority).bg, color: priorityMeta(r.priority).color }}>{r.priority}</span><span className="text-xs text-navy/50">{r.category} · {audienceLabel(r)}</span></div>
        <h2 className="font-display text-xl text-navy mb-2">{r.title}</h2>
        <p className="text-sm text-navy/75 whitespace-pre-wrap leading-relaxed">{r.body}</p>
        {(r.attachments || []).length > 0 && <div className="mt-4 pt-3 border-t border-navy/8"><p className="text-xs font-semibold text-navy/50 mb-1">Attachments</p>{r.attachments.map((a, i) => <a key={i} href={a.publicUrl || "#"} target="_blank" rel="noreferrer" className="text-sm text-royal flex items-center gap-1"><Paperclip size={12} /> {a.name || `file ${i + 1}`}</a>)}</div>}
      </div>
    </Modal>
  );
}

function Tracker({ comm, students, staff, onClose }) {
  const toast = useToast();
  const [acks, setAcks] = useState([]); const [loading, setLoading] = useState(true); const [fClass, setFClass] = useState("");
  const recips = useMemo(() => resolveRecipients(comm, students, staff), [comm, students, staff]);
  const load = async () => { setLoading(true); const a = normList(await ackSvc.list({})); setAcks(a.filter((x) => x.commId === comm.id)); setLoading(false); };
  useEffect(() => { load(); }, []);
  const ackFor = (rid) => acks.find((a) => a.recipientId === rid);
  const mark = async (r, status) => {
    const ex = ackFor(r.id); const now = new Date().toISOString();
    const payload = { commId: comm.id, commTitle: comm.title, commType: comm.type, recipientType: r.type, recipientId: r.id, recipientName: r.name, klass: r.klass, section: r.section, status, readAt: status !== "Pending" ? (ex?.readAt || now) : "", ackAt: status === "Acknowledged" ? now : "" };
    try { if (ex) await ackSvc.update(ex.id, payload); else await ackSvc.create(payload); await load(); } catch (e) { toast.error(e.message); }
  };
  const classes = [...new Set(recips.map((r) => r.klass).filter(Boolean))].sort();
  const list = fClass ? recips.filter((r) => r.klass === fClass) : recips;
  const readN = recips.filter((r) => { const a = ackFor(r.id); return a && (a.status === "Read" || a.status === "Acknowledged"); }).length;
  const ackN = recips.filter((r) => { const a = ackFor(r.id); return a && a.status === "Acknowledged"; }).length;
  const pct = (n) => (recips.length ? Math.round((n / recips.length) * 100) : 0);

  return (
    <Modal open onClose={onClose} title="Delivery & acknowledgement" size="lg" footer={<ModalFooter onCancel={onClose} onSave={onClose} saveLabel="Done" />}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Kpi k="Recipients" v={recips.length} />
          <Kpi k="Read" v={`${readN} (${pct(readN)}%)`} c="#16a34a" />
          <Kpi k="Acknowledged" v={`${ackN} (${pct(ackN)}%)`} c="#1651A3" />
        </div>
        <div className="flex items-center gap-2"><span className="text-xs text-navy/50">Filter:</span><select value={fClass} onChange={(e) => setFClass(e.target.value)} className="ctl"><option value="">All</option>{classes.map((c) => <option key={c}>{c}</option>)}</select></div>
        {loading ? <div className="grid place-items-center py-10"><Spinner size={22} /></div> : (
          <div className="rounded-xl border border-navy/10 max-h-[42vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white"><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-3 py-2">Recipient</th><th className="px-3 py-2">Group</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Mark</th></tr></thead>
              <tbody>
                {list.slice(0, 300).map((r) => { const a = ackFor(r.id); const st = a?.status || "Pending"; return (
                  <tr key={r.id} className="border-b border-navy/5"><td className="px-3 py-1.5 text-navy">{r.name}</td><td className="px-3 py-1.5 text-navy/55">{r.klass}{r.section ? ` · ${r.section}` : ""}</td>
                    <td className="px-3 py-1.5"><Badge color={st === "Acknowledged" ? "green" : st === "Read" ? "blue" : "gray"}>{st}</Badge></td>
                    <td className="px-3 py-1.5 text-right"><div className="inline-flex gap-1"><button onClick={() => mark(r, "Read")} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-600">Read</button><button onClick={() => mark(r, "Acknowledged")} className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">Ack</button></div></td>
                  </tr>
                ); })}
                {list.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-navy/40">No recipients.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[11px] text-navy/40">Recipients are resolved live from the audience. Read/Ack update here today; the parent & student portals will record them automatically once live.</p>
      </div>
    </Modal>
  );
}
const Kpi = ({ k, v, c }) => <div className="rounded-xl bg-white/60 border border-navy/8 p-3"><p className="text-[11px] text-navy/45">{k}</p><p className="font-display text-lg" style={{ color: c || "#14335E" }}>{v}</p></div>;
const Toggle = ({ label, value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)} className="flex items-center gap-2">
    <span className="rounded-full transition relative" style={{ width: 40, height: 22, background: value ? "#1651A3" : "rgba(20,51,94,.2)" }}><span className="absolute top-0.5 rounded-full bg-white transition" style={{ height: 18, width: 18, left: value ? 20 : 2 }} /></span>
    <span className="text-sm text-navy/70">{label}</span>
  </button>
);
