import { useState, useEffect } from "react";
import { UserPlus, LogOut, FileSignature, Plus, Trash2, Check, Printer, ClipboardCheck } from "lucide-react";
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
import { useBranding } from "@/store/branding";
import { LETTER_TYPES, ONBOARD_CHECKLIST, CLEARANCE_DEPTS, letterBody } from "./letterKit";
import OnboardingWizard from "./OnboardingWizard";

const obSvc = resourceService("onboarding");
const exSvc = resourceService("exits");
const rupee = (n) => "₹" + Math.round(+n || 0).toLocaleString("en-IN");

export default function OnboardingExit() {
  const toast = useToast();
  const { user } = useAuth();
  const brand = useBranding();
  const [tab, setTab] = useState("onboard");
  const [obs, setObs] = useState([]); const [exits, setExits] = useState([]); const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [obForm, setObForm] = useState(null); const [exForm, setExForm] = useState(null); const [letter, setLetter] = useState(null);
  const [candidates, setCandidates] = useState([]); const [wizard, setWizard] = useState(null); const [startPick, setStartPick] = useState(false);

  const load = async () => { setLoading(true); const [o, e, s, c] = await Promise.all([obSvc.list({}), exSvc.list({}), resourceService("staff").list({}), resourceService("candidates").list({})]); setObs(normList(o)); setExits(normList(e)); setStaff(normList(s)); setCandidates(normList(c)); setLoading(false); };
  useEffect(() => { load(); }, []);
  const school = { name: brand?.name, address: brand?.school?.address };

  // ---------- Onboarding ----------
  const startOnboard = () => setObForm({ staffId: "", staffName: "", designation: "", checklist: ONBOARD_CHECKLIST.map((task) => ({ task, done: false })), probationMonths: 6, mentor: "", status: "In Progress", startedAt: new Date().toISOString() });
  const editOnboard = (o) => setObForm({ ...o, checklist: o.checklist?.length ? o.checklist : ONBOARD_CHECKLIST.map((task) => ({ task, done: false })) });
  const pickObStaff = (id) => { const s = staff.find((x) => x.id === id); setObForm((f) => ({ ...f, staffId: id, staffName: s?.name || "", designation: s?.designation || s?.role || "" })); };
  const toggleTask = (i) => setObForm((f) => ({ ...f, checklist: f.checklist.map((c, idx) => (idx === i ? { ...c, done: !c.done } : c)) }));
  const saveOb = async () => {
    if (!obForm.staffId) { toast.error("Pick a staff"); return; }
    setSaving(true);
    try {
      const done = obForm.checklist.filter((c) => c.done).length; const status = done === obForm.checklist.length ? "Completed" : "In Progress";
      const probationEnd = obForm.probationMonths && staff.find((s) => s.id === obForm.staffId)?.doj ? new Date(new Date(staff.find((s) => s.id === obForm.staffId).doj).setMonth(new Date(staff.find((s) => s.id === obForm.staffId).doj).getMonth() + (+obForm.probationMonths))).toISOString().slice(0, 10) : "";
      const p = { ...obForm, status, probationEnd, probationMonths: +obForm.probationMonths || 0 };
      if (obForm.id) await obSvc.update(obForm.id, p); else await obSvc.create(p);
      toast.success("Onboarding saved"); setObForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const delOb = async (o) => { await obSvc.remove(o.id); load(); };


  const startFromCandidate = async (c) => {
    setSaving(true);
    try { const rec = await obSvc.create({ candidateId: c.id, staffName: c.name, designation: c.appliedFor, category: "Teaching", subject: c.subject, phone: c.phone, email: c.email, salaryBasic: +c.expectedSalary || 0, employmentType: "Probation", documents: [], data: { name: c.name, phone: c.phone, email: c.email, qualification: c.qualification, hasBEd: c.hasBEd, tetStatus: c.tetStatus, subjects: c.subject }, pageStatus: {}, status: "In Progress", startedAt: new Date().toISOString() }); setStartPick(false); await load(); setWizard({ ...rec, id: rec.id || rec._id }); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  // ---------- Exit ----------
  const startExit = () => setExForm({ staffId: "", staffName: "", designation: "", type: "Resignation", reason: "", noticeDate: "", lastWorkingDay: "", clearance: CLEARANCE_DEPTS.map((dept) => ({ dept, cleared: false })), ktNote: "", exitInterview: "", fnfPending: 0, fnfEncash: 0, fnfRecovery: 0, status: "In Notice", initiatedAt: new Date().toISOString() });
  const editExit = (e) => setExForm({ ...e, clearance: e.clearance?.length ? e.clearance : CLEARANCE_DEPTS.map((dept) => ({ dept, cleared: false })) });
  const pickExStaff = (id) => { const s = staff.find((x) => x.id === id); setExForm((f) => ({ ...f, staffId: id, staffName: s?.name || "", designation: s?.designation || s?.role || "" })); };
  const toggleClear = (i) => setExForm((f) => ({ ...f, clearance: f.clearance.map((c, idx) => (idx === i ? { ...c, cleared: !c.cleared, by: !c.cleared ? user?.name : "" } : c)) }));
  const fnfNet = exForm ? (+exForm.fnfPending || 0) + (+exForm.fnfEncash || 0) - (+exForm.fnfRecovery || 0) : 0;
  const saveExit = async () => {
    if (!exForm.staffId) { toast.error("Pick a staff"); return; }
    setSaving(true);
    try {
      const allClear = exForm.clearance.every((c) => c.cleared);
      const p = { ...exForm, fnfPending: +exForm.fnfPending || 0, fnfEncash: +exForm.fnfEncash || 0, fnfRecovery: +exForm.fnfRecovery || 0, fnfNet, status: allClear ? "Cleared" : exForm.status };
      if (exForm.id) await exSvc.update(exForm.id, p); else await exSvc.create(p);
      toast.success("Exit record saved"); setExForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const relieve = async (e) => { const st = staff.find((x) => x.id === e.staffId); if (st) await resourceService("staff").update(st.id, { status: "Relieved", allowLogin: false }); await exSvc.update(e.id, { status: "Relieved" }); toast.success("Staff relieved & deactivated"); load(); };
  const delExit = async (e) => { await exSvc.remove(e.id); load(); };

  // ---------- Letters ----------
  const genLetter = (type, st, extra = {}) => setLetter(letterBody(type, st, school, extra));

  const TABS = [["onboard", "Onboarding", UserPlus], ["exit", "Exit / Relieving", LogOut], ["letters", "Letters", FileSignature]];

  return (
    <div>
      <PageHeader title="Onboarding & Exit" icon={ClipboardCheck} subtitle="Joining checklists · exit clearance & F&F · auto letter suite" />
      <div className="flex gap-1 mb-5 flex-wrap">
        {TABS.map(([k, label, Icon]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {label}</button>)}
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (<>
        {/* ONBOARDING */}
        {tab === "onboard" && (<>
          <div className="flex justify-end mb-3"><Button onClick={() => setStartPick(true)}><Plus size={16} /> Start onboarding</Button></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {obs.filter((o) => o.status !== "Completed").map((o) => { const done = (o.checklist || []).filter((c) => c.done).length; const total = (o.checklist || []).length; const pct = total ? Math.round(done / total * 100) : 0; return (
              <div key={o.id} className="glass rounded-xl2 shadow-glass p-4">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><Avatar name={o.staffName} size={32} /><div><p className="font-medium text-navy">{o.staffName}</p><p className="text-[11px] text-navy/45">{o.designation}</p></div></div><Badge color={o.status === "Completed" ? "green" : "amber"}>{o.status}</Badge></div>
                <div className="mt-3"><div className="flex justify-between text-xs text-navy/50 mb-1"><span>Checklist</span><span>{done}/{total}</span></div><div className="h-2 rounded-full bg-navy/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--brand-royal,#1651A3)" }} /></div></div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setWizard(o)} className="text-royal text-sm font-semibold">Open wizard</button>
                  <button onClick={() => genLetter("Appointment", staff.find((s) => s.id === o.staffId) || { name: o.staffName, designation: o.designation }, { probationMonths: o.probationMonths })} className="text-navy/50 text-sm">Appointment letter</button>
                  <button onClick={() => delOb(o)} className="text-coral-500 ml-auto"><Trash2 size={14} /></button>
                </div>
              </div>
            ); })}
            {obs.length === 0 && <div className="glass rounded-xl2 shadow-glass py-14 text-center text-navy/50 sm:col-span-3">No onboarding in progress. Hired candidates from Recruitment appear here.</div>}
          </div>
        </>)}

        {/* EXIT */}
        {tab === "exit" && (<>
          <div className="flex justify-end mb-3"><Button onClick={startExit}><Plus size={16} /> Initiate exit</Button></div>
          <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Staff</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Last working day</th><th className="px-4 py-3">Clearance</th><th className="px-4 py-3 text-right">F&F net</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody>
                {exits.map((e) => { const cl = (e.clearance || []).filter((c) => c.cleared).length; const clt = (e.clearance || []).length; return (
                  <tr key={e.id} className="border-b border-navy/5">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Avatar name={e.staffName} size={28} /><span className="font-medium text-navy">{e.staffName}</span></div></td>
                    <td className="px-4 py-2.5">{e.type}</td>
                    <td className="px-4 py-2.5 text-navy/70">{e.lastWorkingDay || "—"}</td>
                    <td className="px-4 py-2.5">{cl}/{clt} cleared</td>
                    <td className="px-4 py-2.5 text-right font-mono">{rupee(e.fnfNet)}</td>
                    <td className="px-4 py-2.5"><Badge color={e.status === "Relieved" ? "gray" : e.status === "Cleared" ? "green" : "amber"}>{e.status}</Badge></td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => editExit(e)} className="text-royal text-sm font-semibold">Open</button>
                      <button onClick={() => genLetter("Relieving", { name: e.staffName, designation: e.designation }, { lastWorkingDay: e.lastWorkingDay })} className="text-navy/50 text-xs">Relieving</button>
                      <button onClick={() => genLetter("Experience", { name: e.staffName, designation: e.designation, doj: staff.find((s) => s.id === e.staffId)?.doj }, { lastWorkingDay: e.lastWorkingDay })} className="text-navy/50 text-xs">Experience</button>
                      {e.status !== "Relieved" && <button onClick={() => relieve(e)} className="text-emerald-600 text-xs font-semibold">Relieve</button>}
                      <button onClick={() => delExit(e)} className="text-coral-500"><Trash2 size={13} /></button>
                    </div></td>
                  </tr>
                ); })}
                {exits.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">No exits in progress.</td></tr>}
              </tbody>
            </table>
          </div>
        </>)}

        {/* LETTERS */}
        {tab === "letters" && <LettersTab staff={staff} onGen={genLetter} />}
      </>)}

      {/* Onboarding modal */}
      <Modal open={!!obForm} onClose={() => setObForm(null)} title="Onboarding" footer={<ModalFooter onCancel={() => setObForm(null)} onSave={saveOb} saving={saving} />}>
        {obForm && (
          <div className="space-y-4">
            <div><span className="lbl">Staff *</span><RefSelect resource="staff" labelKey="name" valueKey="id" value={obForm.staffId} onChange={pickObStaff} placeholder="Select staff…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="lbl">Probation (months)</span><input type="number" value={obForm.probationMonths} onChange={(e) => setObForm((f) => ({ ...f, probationMonths: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Mentor</span><input value={obForm.mentor} onChange={(e) => setObForm((f) => ({ ...f, mentor: e.target.value }))} className="in" /></label>
            </div>
            <div>
              <span className="lbl">Joining checklist</span>
              <div className="space-y-1.5 max-h-[40vh] overflow-auto">
                {obForm.checklist.map((c, i) => (
                  <button key={i} onClick={() => toggleTask(i)} className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl border text-sm ${c.done ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-navy/12 bg-white/60 text-navy/70"}`}>
                    <span className={`h-4.5 w-4.5 rounded grid place-items-center ${c.done ? "bg-emerald-500 text-white" : "border border-navy/25"}`} style={{ height: 18, width: 18 }}>{c.done && <Check size={12} />}</span>{c.task}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Exit modal */}
      <Modal open={!!exForm} onClose={() => setExForm(null)} title="Exit / Relieving" size="lg" footer={<ModalFooter onCancel={() => setExForm(null)} onSave={saveExit} saving={saving} />}>
        {exForm && (
          <div className="space-y-4">
            <div><span className="lbl">Staff *</span><RefSelect resource="staff" labelKey="name" valueKey="id" value={exForm.staffId} onChange={pickExStaff} placeholder="Select staff…" /></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <label className="block"><span className="lbl">Type</span><select value={exForm.type} onChange={(e) => setExForm((f) => ({ ...f, type: e.target.value }))} className="in"><option>Resignation</option><option>Termination</option><option>Retirement</option><option>End of Contract</option></select></label>
              <label className="block"><span className="lbl">Notice date</span><input type="date" value={exForm.noticeDate} onChange={(e) => setExForm((f) => ({ ...f, noticeDate: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Last working day</span><input type="date" value={exForm.lastWorkingDay} onChange={(e) => setExForm((f) => ({ ...f, lastWorkingDay: e.target.value }))} className="in" /></label>
            </div>
            <label className="block"><span className="lbl">Reason</span><input value={exForm.reason} onChange={(e) => setExForm((f) => ({ ...f, reason: e.target.value }))} className="in" /></label>
            <div>
              <span className="lbl">Clearance (multi-department sign-off)</span>
              <div className="space-y-1.5">
                {exForm.clearance.map((c, i) => (
                  <button key={i} onClick={() => toggleClear(i)} className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl border text-sm ${c.cleared ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-navy/12 bg-white/60 text-navy/70"}`}>
                    <span className={`h-[18px] w-[18px] rounded grid place-items-center ${c.cleared ? "bg-emerald-500 text-white" : "border border-navy/25"}`}>{c.cleared && <Check size={12} />}</span>{c.dept}{c.cleared && c.by && <span className="ml-auto text-xs text-navy/40">by {c.by}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="lbl">Full & Final settlement</span>
              <div className="grid grid-cols-3 gap-3">
                <label className="block"><span className="text-[11px] text-navy/50">Pending salary</span><input type="number" value={exForm.fnfPending} onChange={(e) => setExForm((f) => ({ ...f, fnfPending: e.target.value }))} className="in" /></label>
                <label className="block"><span className="text-[11px] text-navy/50">Leave encashment</span><input type="number" value={exForm.fnfEncash} onChange={(e) => setExForm((f) => ({ ...f, fnfEncash: e.target.value }))} className="in" /></label>
                <label className="block"><span className="text-[11px] text-navy/50">Recoveries</span><input type="number" value={exForm.fnfRecovery} onChange={(e) => setExForm((f) => ({ ...f, fnfRecovery: e.target.value }))} className="in" /></label>
              </div>
              <p className="text-sm text-navy/60 mt-2">Net settlement: <b className="text-navy">{rupee(fnfNet)}</b></p>
            </div>
            <label className="block"><span className="lbl">Knowledge transfer / exit interview notes</span><textarea rows={2} value={exForm.ktNote} onChange={(e) => setExForm((f) => ({ ...f, ktNote: e.target.value }))} className="in" style={{ height: "auto", padding: "10px 12px" }} /></label>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => genLetter("Full & Final", { name: exForm.staffName, designation: exForm.designation }, { lastWorkingDay: exForm.lastWorkingDay, fnfPending: exForm.fnfPending, fnfEncash: exForm.fnfEncash, fnfRecovery: exForm.fnfRecovery, fnfNet })}>F&F statement</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Letter preview */}
      <Modal open={!!letter} onClose={() => setLetter(null)} title="Letter preview" size="lg" footer={<ModalFooter onCancel={() => setLetter(null)} onSave={() => window.print()} saveLabel="Print" />}>
        {letter && (
          <div className="bg-white rounded-xl border border-navy/10 p-8">
            <div className="text-center border-b border-navy/15 pb-4 mb-5"><p className="font-display text-xl text-navy">{letter.school}</p>{letter.addr && <p className="text-xs text-navy/50">{letter.addr}</p>}</div>
            <div className="flex justify-between text-xs text-navy/50 mb-4"><span>{letter.refLine}</span><span>{letter.date}</span></div>
            <h3 className="text-center font-display text-lg text-navy underline mb-5">{letter.title}</h3>
            <p className="text-sm text-navy/80 mb-3">{letter.salute}</p>
            {letter.paras.map((p, i) => <p key={i} className="text-sm text-navy/80 mb-3 leading-relaxed text-justify">{p}</p>)}
            <div className="mt-10"><p className="text-sm text-navy/80">{letter.closing}</p><div className="h-10" /><p className="text-sm font-semibold text-navy">{letter.sign}</p></div>
          </div>
        )}
      </Modal>
      {/* Start-onboarding: pick a hired candidate */}
      <Modal open={startPick} onClose={() => setStartPick(false)} title="Start onboarding — pick a hired candidate" footer={null}>
        <div className="space-y-2 max-h-[50vh] overflow-auto">
          {candidates.filter((c) => c.stage === "Hired" && !obs.some((o) => o.candidateId === c.id)).map((c) => (
            <button key={c.id} onClick={() => startFromCandidate(c)} className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl border border-navy/12 bg-white/60 hover:border-royal/40">
              <Avatar name={c.name} size={30} /><div><p className="font-medium text-navy">{c.name}</p><p className="text-[11px] text-navy/45">{c.appliedFor}{c.subject ? " · " + c.subject : ""}</p></div>
            </button>
          ))}
          {candidates.filter((c) => c.stage === "Hired" && !obs.some((o) => o.candidateId === c.id)).length === 0 && <p className="text-navy/40 text-sm py-6 text-center">No hired candidates awaiting onboarding. Hire a candidate in Recruitment first.</p>}
        </div>
      </Modal>

      {wizard && <OnboardingWizard record={wizard} onClose={() => setWizard(null)} onDone={() => { setWizard(null); load(); }} />}
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}

function LettersTab({ staff, onGen }) {
  const [staffId, setStaffId] = useState(""); const [type, setType] = useState("Offer"); const [gross, setGross] = useState("");
  const st = staff.find((s) => s.id === staffId);
  return (
    <div className="glass rounded-xl2 shadow-glass p-6 max-w-2xl">
      <p className="text-sm text-navy/50 mb-4">Generate any HR letter from staff data with the school header — offer, appointment, confirmation, increment, experience, relieving or full & final.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><span className="lbl">Staff</span><RefSelect resource="staff" labelKey="name" valueKey="id" value={staffId} onChange={setStaffId} placeholder="Select staff…" /></div>
        <label className="block"><span className="lbl">Letter type</span><select value={type} onChange={(e) => setType(e.target.value)} className="in">{LETTER_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
        {["Offer", "Increment"].includes(type) && <label className="block"><span className="lbl">Monthly gross (₹)</span><input type="number" value={gross} onChange={(e) => setGross(e.target.value)} className="in" /></label>}
      </div>
      <Button className="mt-4" onClick={() => onGen(type, st || {}, { gross })} disabled={!staffId}><FileSignature size={15} /> Generate letter</Button>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
