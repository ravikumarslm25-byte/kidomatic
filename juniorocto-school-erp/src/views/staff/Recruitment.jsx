import { useState, useEffect, useMemo } from "react";
import { Users, Plus, Trash2, Pencil, Check, X, UserPlus, Star, Briefcase, ClipboardList, FileText } from "lucide-react";
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
import { useAuth } from "@/store/auth";
import { STAGES, STAGE_COLOR, DEMO_CRITERIA, SOURCES, truthy, meetsEligibility, demoTotal, demoMax } from "./recruitKit";
import { WINGS, CATEGORIES } from "./staffKit";

const reqSvc = resourceService("requisitions");
const candSvc = resourceService("candidates");
const obSvc = resourceService("onboarding");

export default function Recruitment() {
  const toast = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState("pipeline");
  const [reqs, setReqs] = useState([]); const [cands, setCands] = useState([]); const [templates, setTemplates] = useState([]); const [desigs, setDesigs] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [reqForm, setReqForm] = useState(null); const [candForm, setCandForm] = useState(null);
  const [fStage, setFStage] = useState("");

  const load = async () => { setLoading(true); const [r, c, t, d] = await Promise.all([reqSvc.list({}), candSvc.list({}), resourceService("eligibilityTemplates").list({}), resourceService("designations").list({})]); setReqs(normList(r)); setCands(normList(c)); setTemplates(normList(t)); setDesigs(normList(d)); setLoading(false); };
  useEffect(() => { load(); }, []);
  const shownCands = useMemo(() => cands.filter((c) => !fStage || c.stage === fStage), [cands, fStage]);

  // Requisitions
  const openReq = (r) => setReqForm(r ? { ...r } : { designation: "", department: "", wing: "Whole School", count: 1, reason: "New position", status: "Open", notes: "", raisedBy: user?.name || "admin", createdAt: new Date().toISOString() });
  const saveReq = async () => { if (!reqForm.designation) { toast.error("Designation required"); return; } setSaving(true); try { const p = { ...reqForm, count: +reqForm.count || 1 }; if (reqForm.id) await reqSvc.update(reqForm.id, p); else await reqSvc.create(p); toast.success("Requisition saved"); setReqForm(null); await load(); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };
  const setReqStatus = async (r, status) => { await reqSvc.update(r.id, { status }); load(); };

  // Candidates
  const openCand = (c) => setCandForm(c ? { ...c, demoScores: c.demoScores || {} } : { name: "", phone: "", email: "", appliedFor: "", subject: "", requisitionId: "", qualification: "", hasBEd: false, tetStatus: "Not Applicable", experience: 0, expectedSalary: 0, resume: "", source: "Referral", stage: "Applied", demoScores: {}, interviewScore: 0, notes: "", appliedAt: new Date().toISOString() });
  const setDemo = (crit, v) => setCandForm((f) => ({ ...f, demoScores: { ...f.demoScores, [crit]: v } }));
  const saveCand = async () => {
    if (!candForm.name) { toast.error("Name required"); return; }
    setSaving(true);
    try { const p = { ...candForm, experience: +candForm.experience || 0, expectedSalary: +candForm.expectedSalary || 0, interviewScore: +candForm.interviewScore || 0 }; if (candForm.id) await candSvc.update(candForm.id, p); else await candSvc.create(p); toast.success("Candidate saved"); setCandForm(null); await load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const advance = async (c) => { const i = STAGES.indexOf(c.stage); const next = STAGES[Math.min(i + 1, 5)]; await candSvc.update(c.id, { stage: next }); load(); };
  const reject = async (c) => { await candSvc.update(c.id, { stage: "Rejected" }); load(); };
  const delCand = async (c) => { await candSvc.remove(c.id); load(); };

  const hireToOnboarding = async (c) => {
    setSaving(true);
    try {
      const cat = desigs.find((d) => d.name === c.appliedFor)?.category || "Teaching";
      await candSvc.update(c.id, { stage: "Hired" });
      await obSvc.create({ candidateId: c.id, staffName: c.name, designation: c.appliedFor, category: cat, subject: c.subject, phone: c.phone, email: c.email,
        salaryBasic: +c.expectedSalary || 0, employmentType: "Probation", documents: [],
        data: { name: c.name, phone: c.phone, email: c.email, qualification: c.qualification, hasBEd: truthy(c.hasBEd), tetStatus: c.tetStatus, subjects: c.subject, experienceNote: (c.experience ? c.experience + " years" : "") },
        pageStatus: {}, checklist: [], probationMonths: 6, status: "In Progress", startedAt: new Date().toISOString() });
      toast.success(`${c.name} hired → moved to Onboarding`); setCandForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const elig = candForm ? meetsEligibility(candForm, templates) : null;
  const TABS = [["pipeline", "Candidate Pipeline", Users], ["reqs", "Manpower Requisitions", ClipboardList]];

  return (
    <div>
      <PageHeader title="Recruitment" icon={Briefcase} subtitle="Requisitions · applications · demo-class scorecard · interviews · convert to staff"
        actions={tab === "pipeline" ? <Button onClick={() => openCand()}><Plus size={16} /> Add candidate</Button> : <Button onClick={() => openReq()}><Plus size={16} /> New requisition</Button>} />
      <div className="flex gap-1 mb-5">{TABS.map(([k, label, Icon]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {label}</button>)}</div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (<>
        {/* PIPELINE */}
        {tab === "pipeline" && (<>
          <div className="flex gap-2 mb-3 flex-wrap">{["", ...STAGES].map((s) => <button key={s} onClick={() => setFStage(s)} className={`px-3 h-8 rounded-lg text-sm ${fStage === s ? "text-white font-semibold" : "bg-white/60 border border-navy/10 text-navy/60"}`} style={fStage === s ? { background: s ? STAGE_COLOR[s] : "#1651A3" } : {}}>{s || "All"} {s && <span className="opacity-70">{cands.filter((c) => c.stage === s).length}</span>}</button>)}</div>
          <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Candidate</th><th className="px-4 py-3">Applied for</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Eligibility</th><th className="px-4 py-3">Demo</th><th className="px-4 py-3">Stage</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody>
                {shownCands.map((c) => { const e = meetsEligibility(c, templates); const dt = demoTotal(c.demoScores); return (
                  <tr key={c.id} className="border-b border-navy/5 hover:bg-white/40">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><Avatar name={c.name} size={30} /><div><p className="font-medium text-navy">{c.name}</p><p className="text-[11px] text-navy/45">{c.qualification}{c.experience ? ` · ${c.experience}y` : ""}</p></div></div></td>
                    <td className="px-4 py-2.5 text-navy/70">{c.appliedFor || "—"}</td><td className="px-4 py-2.5 text-navy/60">{c.subject || "—"}</td>
                    <td className="px-4 py-2.5">{e.ok === null ? <Badge>Manual</Badge> : e.ok ? <Badge color="green">Eligible</Badge> : <Badge color="red">Gaps</Badge>}</td>
                    <td className="px-4 py-2.5">{dt ? <span className="font-mono">{dt}/{demoMax}</span> : <span className="text-navy/30">—</span>}</td>
                    <td className="px-4 py-2.5"><span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: STAGE_COLOR[c.stage] + "22", color: STAGE_COLOR[c.stage] }}>{c.stage}</span></td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => openCand(c)} className="text-royal text-sm font-semibold">Open</button>
                      {!["Hired", "Rejected"].includes(c.stage) && <><button onClick={() => advance(c)} className="text-emerald-600 text-xs font-semibold" title="Advance stage">Advance →</button><button onClick={() => reject(c)} className="text-coral-600" title="Reject"><X size={14} /></button></>}
                      {c.stage === "Offered" && <button onClick={() => hireToOnboarding(c)} className="text-royal text-xs font-semibold flex items-center gap-1"><UserPlus size={13} /> Hire</button>}
                      <button onClick={() => delCand(c)} className="text-navy/30 hover:text-coral-500"><Trash2 size={13} /></button>
                    </div></td>
                  </tr>
                ); })}
                {shownCands.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">No candidates in this stage.</td></tr>}
              </tbody>
            </table>
          </div>
        </>)}

        {/* REQUISITIONS */}
        {tab === "reqs" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reqs.map((r) => (
              <div key={r.id} className="glass rounded-xl2 shadow-glass p-4">
                <div className="flex items-start justify-between"><h3 className="font-display text-navy">{r.designation}</h3><Badge color={r.status === "Approved" ? "green" : r.status === "Closed" ? "gray" : "amber"}>{r.status}</Badge></div>
                <p className="text-xs text-navy/50 mt-1">{r.wing} · {r.count} position(s) · {r.reason}</p>
                {r.notes && <p className="text-xs text-navy/50 mt-2">{r.notes}</p>}
                <div className="flex gap-2 mt-3">
                  {r.status === "Open" && <button onClick={() => setReqStatus(r, "Approved")} className="text-emerald-600 text-sm font-semibold">Approve</button>}
                  {r.status !== "Closed" && <button onClick={() => setReqStatus(r, "Closed")} className="text-navy/50 text-sm">Close</button>}
                  <button onClick={() => openReq(r)} className="text-navy/40 hover:text-navy ml-auto"><Pencil size={14} /></button>
                  <button onClick={async () => { await reqSvc.remove(r.id); load(); }} className="text-coral-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {reqs.length === 0 && <div className="glass rounded-xl2 shadow-glass py-14 text-center text-navy/50 sm:col-span-3">No manpower requisitions yet.</div>}
          </div>
        )}
      </>)}

      {/* Requisition modal */}
      <Modal open={!!reqForm} onClose={() => setReqForm(null)} title={reqForm?.id ? "Edit requisition" : "New manpower requisition"} footer={<ModalFooter onCancel={() => setReqForm(null)} onSave={saveReq} saving={saving} />}>
        {reqForm && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><span className="lbl">Designation *</span><RefSelect resource="designations" labelKey="name" value={reqForm.designation} onChange={(v) => setReqForm((f) => ({ ...f, designation: v }))} placeholder="Designation…" /></div>
              <div><span className="lbl">Department</span><RefSelect resource="departments" labelKey="name" value={reqForm.department} onChange={(v) => setReqForm((f) => ({ ...f, department: v }))} placeholder="Department…" /></div>
              <label className="block"><span className="lbl">Wing</span><select value={reqForm.wing} onChange={(e) => setReqForm((f) => ({ ...f, wing: e.target.value }))} className="in">{WINGS.map((w) => <option key={w}>{w}</option>)}</select></label>
              <label className="block"><span className="lbl">Positions</span><input type="number" value={reqForm.count} onChange={(e) => setReqForm((f) => ({ ...f, count: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Reason</span><select value={reqForm.reason} onChange={(e) => setReqForm((f) => ({ ...f, reason: e.target.value }))} className="in"><option>New position</option><option>Replacement</option><option>Additional load</option></select></label>
            </div>
            <label className="block"><span className="lbl">Notes</span><textarea rows={2} value={reqForm.notes} onChange={(e) => setReqForm((f) => ({ ...f, notes: e.target.value }))} className="in" style={{ height: "auto", padding: "10px 12px" }} /></label>
          </div>
        )}
      </Modal>

      {/* Candidate modal */}
      <Modal open={!!candForm} onClose={() => setCandForm(null)} title={candForm?.id ? candForm.name : "New candidate"} size="lg"
        footer={<div className="flex items-center gap-2 w-full">
          {candForm?.stage === "Offered" && <Button variant="outline" onClick={() => hireToOnboarding(candForm)}><UserPlus size={15} /> Hire → Onboarding</Button>}
          <div className="ml-auto"><ModalFooter onCancel={() => setCandForm(null)} onSave={saveCand} saving={saving} /></div>
        </div>}>
        {candForm && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block"><span className="lbl">Name *</span><input value={candForm.name} onChange={(e) => setCandForm((f) => ({ ...f, name: e.target.value }))} className="in" /></label>
              <div><span className="lbl">Applied for</span><RefSelect resource="designations" labelKey="name" value={candForm.appliedFor} onChange={(v) => setCandForm((f) => ({ ...f, appliedFor: v }))} placeholder="Designation…" /></div>
              <div><span className="lbl">Subject</span><RefSelect resource="subjects" labelKey="name" value={candForm.subject} onChange={(v) => setCandForm((f) => ({ ...f, subject: v }))} placeholder="Subject…" /></div>
              <label className="block"><span className="lbl">Phone</span><input value={candForm.phone} onChange={(e) => setCandForm((f) => ({ ...f, phone: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Email</span><input value={candForm.email} onChange={(e) => setCandForm((f) => ({ ...f, email: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Qualification</span><input value={candForm.qualification} onChange={(e) => setCandForm((f) => ({ ...f, qualification: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Experience (yrs)</span><input type="number" value={candForm.experience} onChange={(e) => setCandForm((f) => ({ ...f, experience: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">TET status</span><select value={candForm.tetStatus} onChange={(e) => setCandForm((f) => ({ ...f, tetStatus: e.target.value }))} className="in"><option>Not Applicable</option><option>Qualified</option><option>Not Qualified</option></select></label>
              <label className="block"><span className="lbl">Expected salary (₹)</span><input type="number" value={candForm.expectedSalary} onChange={(e) => setCandForm((f) => ({ ...f, expectedSalary: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Source</span><select value={candForm.source} onChange={(e) => setCandForm((f) => ({ ...f, source: e.target.value }))} className="in">{SOURCES.map((x) => <option key={x}>{x}</option>)}</select></label>
              <label className="block"><span className="lbl">Stage</span><select value={candForm.stage} onChange={(e) => setCandForm((f) => ({ ...f, stage: e.target.value }))} className="in">{STAGES.map((x) => <option key={x}>{x}</option>)}</select></label>
            </div>
            <label className="flex items-center gap-2 text-sm text-navy/70"><input type="checkbox" checked={truthy(candForm.hasBEd)} onChange={(e) => setCandForm((f) => ({ ...f, hasBEd: e.target.checked }))} /> Holds B.Ed / D.El.Ed</label>
            <div><span className="lbl">Resume</span><FileUpload value={candForm.resume} onChange={(v) => setCandForm((f) => ({ ...f, resume: v }))} folder="resumes" /></div>

            {/* Eligibility */}
            {elig && <div className={`rounded-xl p-3 text-sm ${elig.ok === false ? "bg-coral-50 text-coral-700" : elig.ok ? "bg-emerald-50 text-emerald-700" : "bg-navy/5 text-navy/60"}`}>
              <p className="font-semibold mb-0.5">{elig.ok === false ? "Eligibility gaps" : elig.ok ? "Meets eligibility" : "Manual eligibility check"}</p>
              <p className="text-xs">{elig.reasons.join(" · ")}</p>
            </div>}

            {/* Demo scorecard */}
            <div>
              <span className="lbl">Demo-class scorecard (1–5 each · total {demoTotal(candForm.demoScores)}/{demoMax})</span>
              <div className="space-y-2">
                {DEMO_CRITERIA.map((crit) => (
                  <div key={crit} className="flex items-center gap-3"><span className="text-sm text-navy/70 w-40">{crit}</span>
                    <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setDemo(crit, n)} className={`h-7 w-7 rounded-lg text-xs font-semibold ${(+candForm.demoScores[crit] || 0) >= n ? "text-white" : "bg-white/60 border border-navy/12 text-navy/40"}`} style={(+candForm.demoScores[crit] || 0) >= n ? { background: "#7c3aed" } : {}}>{n}</button>)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview */}
            <label className="block"><span className="lbl">Panel interview score (1–10)</span><input type="number" min={0} max={10} value={candForm.interviewScore} onChange={(e) => setCandForm((f) => ({ ...f, interviewScore: e.target.value }))} className="in" /></label>
            <label className="block"><span className="lbl">Notes</span><textarea rows={2} value={candForm.notes} onChange={(e) => setCandForm((f) => ({ ...f, notes: e.target.value }))} className="in" style={{ height: "auto", padding: "10px 12px" }} /></label>
          </div>
        )}
      </Modal>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
