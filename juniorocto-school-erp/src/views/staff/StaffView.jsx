import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, FileText, CalendarRange, ShieldCheck, Wallet, FileUser, Printer, Download, TrendingUp, Plus, Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useBranding } from "@/store/branding";
import { signGet } from "@/services/upload";
import { CAT_COLOR, daysUntil, truthy, isTeaching } from "./staffKit";
import { grossOf, rupee } from "./payrollKit";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function StaffView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const brand = useBranding();
  const [tab, setTab] = useState("overview");
  const [staff, setStaff] = useState(null);
  const [timetable, setTimetable] = useState([]); const [struct, setStruct] = useState(null); const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(false); const [hikeForm, setHikeForm] = useState(null); const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [all, tt, st, sl] = await Promise.all([resourceService("staff").list({}), resourceService("timetable").list({}), resourceService("salaryStructures").list({}), resourceService("payslips").list({})]);
    const me = normList(all).find((x) => x.id === id);
    setStaff(me); setTimetable(normList(tt));
    setStruct(normList(st).find((x) => x.staffId === id) || null);
    setSlips(normList(sl).filter((x) => x.staffId === id).sort((a, b) => (b.generatedAt || "").localeCompare(a.generatedAt || "")));
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  // timetable grid for this staff
  const grid = useMemo(() => {
    if (!staff) return { g: {}, periods: 6, count: 0 };
    const g = {}; let maxP = 5, count = 0;
    timetable.forEach((doc) => Object.entries(doc.grid || {}).forEach(([key, cell]) => {
      if (cell?.teacher === staff.name) { const [di, pi] = key.split("-").map(Number); g[`${di}-${pi}`] = { klass: doc.klass + (doc.section ? " " + doc.section : ""), subject: cell.subject }; maxP = Math.max(maxP, pi); count++; }
    }));
    return { g, periods: maxP + 1, count };
  }, [staff, timetable]);

  const expDocs = useMemo(() => (staff?.documents || []).map((d) => ({ ...d, days: daysUntil(d.expiryDate) })).filter((d) => d.days !== null && d.days <= 90), [staff]);
  const viewFile = async (f) => { try { const u = f?.publicUrl || (f?.key ? await signGet(f.key) : null); if (u) window.open(u, "_blank"); } catch {} };

  const recordHike = async () => {
    setSaving(true);
    try {
      const hikes = [...(staff.hikes || []), { date: new Date().toISOString().slice(0, 10), oldBasic: +staff.salaryBasic || 0, newBasic: +hikeForm.newBasic || 0, note: hikeForm.note }];
      await resourceService("staff").update(staff.id, { salaryBasic: +hikeForm.newBasic || 0, hikes });
      if (struct) await resourceService("salaryStructures").update(struct.id, { basic: +hikeForm.newBasic || 0 });
      toast.success("Hike recorded"); setHikeForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  if (!staff) return <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/50">Staff not found. <button onClick={() => navigate("/staff")} className="text-royal">Back to directory</button></div>;

  const TABS = [["overview", "Overview", User], ["documents", "Documents", FileText], ["timetable", "Timetable", CalendarRange], ["compliance", "Compliance", ShieldCheck], ["payroll", "Payroll & Hike", Wallet]];

  return (
    <div>
      <button onClick={() => navigate("/staff")} className="flex items-center gap-1.5 text-navy/60 hover:text-navy text-sm mb-4"><ArrowLeft size={16} /> Staff Directory</button>

      {/* Header card */}
      <div className="glass rounded-xl2 shadow-glass p-5 mb-5 flex items-center gap-4 flex-wrap">
        <Avatar name={staff.name} size={64} />
        <div className="flex-1">
          <h1 className="font-display text-2xl text-navy">{staff.name} {truthy(staff.isOutsourced) && <span className="text-xs text-coral-600">· outsourced</span>}</h1>
          <p className="text-navy/60">{staff.designation || staff.role} · {staff.wing}</p>
          <div className="flex flex-wrap gap-1.5 mt-2"><span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: (CAT_COLOR[staff.category] || "#999") + "22", color: CAT_COLOR[staff.category] }}>{staff.category}</span><Badge>{staff.employmentType}</Badge><Badge color={staff.status === "Active" ? "green" : "gray"}>{staff.status}</Badge></div>
        </div>
        <Button onClick={() => setProfile(true)}><FileUser size={15} /> Generate Profile</Button>
      </div>

      <div className="flex gap-1 mb-5 flex-wrap">{TABS.map(([k, label, Icon]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {label}</button>)}</div>

      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-5">
          <Card title="Personal"><Row k="Employee ID" v={staff.empId} /><Row k="Gender" v={staff.gender} /><Row k="Date of birth" v={staff.dob} /><Row k="Blood group" v={staff.bloodGroup} /><Row k="Phone" v={staff.phone} /><Row k="Email" v={staff.email} /><Row k="Emergency contact" v={staff.emergencyContact} /><Row k="Address" v={staff.address} /></Card>
          <Card title="Employment"><Row k="Category" v={staff.category} /><Row k="Department" v={staff.department} /><Row k="Designation" v={staff.designation} /><Row k="Wing" v={staff.wing} /><Row k="Employment type" v={staff.employmentType} /><Row k="Date of joining" v={staff.doj} /></Card>
          <Card title="Qualifications"><Row k="Highest qualification" v={staff.highestQualification} /><Row k="B.Ed / D.El.Ed" v={truthy(staff.hasBEd) ? "Yes" : "No"} /><Row k="TET status" v={staff.tetStatus} /><Row k="TET validity" v={staff.tetExpiry} /><Row k="Subjects" v={Array.isArray(staff.subjects) ? staff.subjects.join(", ") : staff.subjects} /></Card>
          <Card title="Notes"><Row k="Bio" v={staff.bio} /><Row k="Experience" v={staff.experienceNote} /><Row k="Achievements" v={staff.achievements} /></Card>
        </div>
      )}

      {tab === "documents" && (
        <div className="glass rounded-xl2 shadow-glass overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Document</th><th className="px-4 py-3">Number</th><th className="px-4 py-3">Expiry</th><th className="px-4 py-3">Verified</th><th className="px-4 py-3">File</th></tr></thead>
            <tbody>{(staff.documents || []).map((d, i) => <tr key={i} className="border-b border-navy/5"><td className="px-4 py-2.5 font-medium text-navy">{d.type}</td><td className="px-4 py-2.5 font-mono text-navy/70">{d.number || "—"}</td><td className="px-4 py-2.5 text-navy/60">{d.expiryDate || "—"}</td><td className="px-4 py-2.5">{d.verified ? <Badge color="green">Verified</Badge> : <Badge color="amber">Pending</Badge>}</td><td className="px-4 py-2.5">{d.file?.name ? <button onClick={() => viewFile(d.file)} className="text-royal flex items-center gap-1"><Eye size={13} /> View</button> : <span className="text-navy/30">—</span>}</td></tr>)}
              {(staff.documents || []).length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-navy/40">No documents on file.</td></tr>}</tbody></table>
        </div>
      )}

      {tab === "timetable" && (
        <Card noPad>
          <div className="p-4 text-sm text-navy/60">{grid.count} periods / week</div>
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[640px]"><thead><tr className="border-b border-navy/8"><th className="px-4 py-2.5 text-xs uppercase text-navy/40 text-left">Day</th>{Array.from({ length: grid.periods }, (_, i) => <th key={i} className="px-2 py-2.5 text-xs uppercase text-navy/40">P{i + 1}</th>)}</tr></thead>
            <tbody>{DAYS.map((d, di) => <tr key={d} className="border-b border-navy/5"><td className="px-4 py-2 font-semibold text-navy/70">{d}</td>{Array.from({ length: grid.periods }, (_, pi) => { const c = grid.g[`${di}-${pi}`]; return <td key={pi} className="px-2 py-2 text-center">{c ? <div className="rounded-lg bg-royal-100 text-royal px-1.5 py-1"><div className="text-xs font-semibold">{c.klass}</div><div className="text-[10px]">{c.subject}</div></div> : <span className="text-navy/20 text-xs">—</span>}</td>; })}</tr>)}</tbody></table></div>
        </Card>
      )}

      {tab === "compliance" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <ComplCard ok={truthy(staff.policeVerified)} label="Police verification" note={truthy(staff.policeVerified) ? `Verified ${staff.policeVerifyDate || ""}` : "Pending"} />
          <ComplCard ok={truthy(staff.medicalFitness)} label="Medical fitness" note={truthy(staff.medicalFitness) ? "Certified" : "Pending"} />
          {isTeaching(staff) && <ComplCard ok={["Qualified", "Exempted", "Not Applicable"].includes(staff.tetStatus)} label="TET / CTET" note={staff.tetStatus || "—"} />}
          {isTeaching(staff) && <ComplCard ok={truthy(staff.hasBEd)} label="B.Ed / D.El.Ed" note={truthy(staff.hasBEd) ? "Yes" : "Missing"} />}
          <div className="glass rounded-xl2 shadow-glass p-4 sm:col-span-2">
            <p className="text-sm font-semibold text-navy mb-2">Expiring documents (90 days)</p>
            {expDocs.length === 0 ? <p className="text-sm text-navy/40">Nothing expiring soon.</p> : expDocs.map((d, i) => <div key={i} className="flex justify-between text-sm py-1.5 border-b border-navy/5"><span className="text-navy/70">{d.type}</span><span className={d.days < 30 ? "text-coral-600" : "text-amber-600"}>{d.days < 0 ? `Expired ${-d.days}d` : `${d.days}d left`}</span></div>)}
          </div>
        </div>
      )}

      {tab === "payroll" && (
        <div className="space-y-5">
          <div className="glass rounded-xl2 shadow-glass p-5">
            <div className="flex items-center justify-between mb-3"><h3 className="font-display text-navy">Salary</h3><Button variant="outline" onClick={() => setHikeForm({ newBasic: staff.salaryBasic || 0, note: "" })}><TrendingUp size={15} /> Record hike</Button></div>
            {struct ? <div className="grid grid-cols-3 gap-4"><Stat k="Basic" v={rupee(struct.basic)} /><Stat k="Gross" v={rupee(grossOf(struct))} /><Stat k="Statutory" v={[truthy(struct.pfApplicable) && "PF", truthy(struct.esiApplicable) && "ESI", truthy(struct.ptApplicable) && "PT"].filter(Boolean).join(" · ")} /></div>
              : <p className="text-sm text-navy/50">No salary structure set. Current basic: {rupee(staff.salaryBasic)}. Add one in Payroll → Salary Structures.</p>}
          </div>
          {(staff.hikes || []).length > 0 && <div className="glass rounded-xl2 shadow-glass p-5"><h3 className="font-display text-navy mb-3">Hike history</h3>{(staff.hikes || []).slice().reverse().map((h, i) => <div key={i} className="flex justify-between text-sm py-1.5 border-b border-navy/5"><span className="text-navy/60">{h.date} · {h.note}</span><span className="font-mono text-navy">{rupee(h.oldBasic)} → <b>{rupee(h.newBasic)}</b></span></div>)}</div>}
          <div className="glass rounded-xl2 shadow-glass p-5"><h3 className="font-display text-navy mb-3">Recent payslips</h3>{slips.length === 0 ? <p className="text-sm text-navy/40">No payslips generated yet.</p> : slips.slice(0, 6).map((s) => <div key={s.id} className="flex justify-between text-sm py-1.5 border-b border-navy/5"><span className="text-navy/60">{s.monthName} {s.year}</span><span className="font-mono font-semibold text-navy">{rupee(s.net)}</span></div>)}</div>
        </div>
      )}

      {/* Hike modal */}
      <Modal open={!!hikeForm} onClose={() => setHikeForm(null)} title="Record salary hike" footer={<ModalFooter onCancel={() => setHikeForm(null)} onSave={recordHike} saving={saving} />}>
        {hikeForm && <div className="space-y-4"><p className="text-sm text-navy/50">Current basic: {rupee(staff.salaryBasic)}</p><label className="block"><span className="lbl">New basic (₹)</span><input type="number" value={hikeForm.newBasic} onChange={(e) => setHikeForm((f) => ({ ...f, newBasic: e.target.value }))} className="in" /></label><label className="block"><span className="lbl">Note</span><input value={hikeForm.note} onChange={(e) => setHikeForm((f) => ({ ...f, note: e.target.value }))} className="in" placeholder="Annual increment 2026" /></label></div>}
      </Modal>

      {/* Profile modal (no financials) */}
      <Modal open={profile} onClose={() => setProfile(false)} title="Staff Profile" size="lg" footer={<ModalFooter onCancel={() => setProfile(false)} onSave={() => window.print()} saveLabel="Print" />}>
        <div className="bg-white rounded-xl border border-navy/10 p-8">
          <div className="flex items-center gap-4 border-b border-navy/15 pb-4 mb-4"><Avatar name={staff.name} size={56} /><div><p className="font-display text-xl text-navy">{staff.name}</p><p className="text-sm text-navy/60">{staff.designation || staff.role} · {brand?.name || "School"}</p></div></div>
          <Sec title="Summary">{staff.bio || `${staff.name} serves as ${staff.designation || staff.role} in the ${staff.department || staff.wing} at ${brand?.name || "the school"}.`}</Sec>
          <Sec title="Contact">{[staff.phone && `Phone: ${staff.phone}`, staff.email && `Email: ${staff.email}`, staff.address && `Address: ${staff.address}`].filter(Boolean).join(" · ") || "—"}</Sec>
          <Sec title="Education & Qualification">{[staff.highestQualification, truthy(staff.hasBEd) && "B.Ed / D.El.Ed", staff.tetStatus === "Qualified" && "TET Qualified"].filter(Boolean).join(" · ") || "—"}</Sec>
          <Sec title="Experience">{staff.experienceNote || (staff.doj ? `At ${brand?.name || "school"} since ${staff.doj}` : "—")}</Sec>
          <Sec title="Skills / Subjects">{Array.isArray(staff.subjects) ? staff.subjects.join(", ") : staff.subjects || "—"}</Sec>
          <Sec title="Achievements">{staff.achievements || "—"}</Sec>
          <p className="text-[10px] text-navy/40 mt-6">Generated {new Date().toLocaleDateString("en-IN")} · does not include financial information.</p>
        </div>
      </Modal>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const Card = ({ title, children, noPad }) => <div className="glass rounded-xl2 shadow-glass overflow-hidden">{title && <div className="px-4 py-3 border-b border-navy/8"><h3 className="font-display text-navy">{title}</h3></div>}<div className={noPad ? "" : "p-4"}>{children}</div></div>;
const Row = ({ k, v }) => <div className="flex justify-between text-sm py-1.5 border-b border-navy/5 last:border-0"><span className="text-navy/50">{k}</span><span className="text-navy font-medium text-right max-w-[60%]">{v || "—"}</span></div>;
const Stat = ({ k, v }) => <div><p className="text-xs text-navy/45">{k}</p><p className="font-display text-lg text-navy">{v}</p></div>;
const ComplCard = ({ ok, label, note }) => <div className="glass rounded-xl2 shadow-glass p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-xl grid place-items-center text-white" style={{ background: ok ? "#16a34a" : "#dc2626" }}><ShieldCheck size={18} /></div><div><p className="font-semibold text-navy text-sm">{label}</p><p className="text-xs text-navy/50">{note}</p></div></div>;
const Sec = ({ title, children }) => <div className="mb-3"><p className="text-xs font-bold uppercase text-royal mb-1">{title}</p><p className="text-sm text-navy/80">{children}</p></div>;
