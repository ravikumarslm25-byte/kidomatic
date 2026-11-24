import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, Lock, X } from "lucide-react";
import Button from "@/components/ui/Button";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import FileUpload from "@/components/ui/FileUpload";
import { resourceService } from "@/services/resource";
import { useToast } from "@/store/toast";
import { CATEGORIES, EMPLOYMENT_TYPES, WINGS, DOC_TYPES, TET_STATUS, truthy } from "./staffKit";

const STEPS = [
  { key: "personal", label: "Personal & Employment", mandatory: true },
  { key: "kyc", label: "KYC & Documents", mandatory: true },
  { key: "salary", label: "Salary Structure", mandatory: true },
  { key: "email", label: "Official Email", mandatory: false },
  { key: "login", label: "ERP Login", mandatory: false },
  { key: "assets", label: "Asset Allocation", mandatory: false },
  { key: "induction", label: "Induction & POCSO", mandatory: false },
];
const blankDoc = () => ({ name: "", type: "Aadhaar", number: "", expiryDate: "", file: "", verified: false });

export default function OnboardingWizard({ record, onClose, onDone }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const d0 = record.data || {};
  const [data, setData] = useState({
    name: record.staffName || d0.name || "", phone: record.phone || d0.phone || "", email: record.email || d0.email || "",
    category: record.category || "Teaching", designation: record.designation || "", wing: record.wing || "Whole School",
    employmentType: record.employmentType || "Probation", doj: new Date().toISOString().slice(0, 10), gender: "", dob: "", address: "",
    highestQualification: d0.qualification || "", hasBEd: truthy(d0.hasBEd), tetStatus: d0.tetStatus || "Not Applicable", subjects: record.subject || d0.subjects || "",
  });
  const [docs, setDocs] = useState(record.documents?.length ? record.documents : [blankDoc()]);
  const [salary, setSalary] = useState({ basic: record.salaryBasic || 0, da: 0, hra: 0, conveyance: 0, special: 0, medical: 0 });
  const [ps, setPs] = useState(record.pageStatus || {}); // per-step {notRequired, done}
  const [emailV, setEmailV] = useState({ officialEmail: "", file: "" });
  const [login, setLogin] = useState({ allow: false, role: "Class Teacher" });
  const [assets, setAssets] = useState({ list: "", file: "" });
  const [induction, setInduction] = useState({ pocso: false, orientation: false, mentor: "", note: "" });

  const set = (k, v) => setData((f) => ({ ...f, [k]: v }));
  const setDoc = (i, k, v) => setDocs((a) => a.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const notReq = (key) => !!ps[key]?.notRequired;
  const toggleNotReq = (key) => setPs((p) => ({ ...p, [key]: { ...p[key], notRequired: !p[key]?.notRequired } }));

  const stepComplete = (key) => {
    if (notReq(key)) return true;
    if (key === "kyc") return docs.some((x) => x.name && (x.number || x.file));
    if (key === "salary") return +salary.basic > 0;
    if (key === "personal") return !!data.name && !!data.designation;
    return true; // optional info pages complete once visited (or Not Required)
  };
  const mandatoryDone = STEPS.filter((s) => s.mandatory).every((s) => stepComplete(s.key));

  const finish = async () => {
    if (!mandatoryDone) { toast.error("Complete KYC, Salary and Personal to finish"); return; }
    setSaving(true);
    try {
      const staff = await resourceService("staff").create({
        name: data.name, phone: data.phone, email: notReq("email") ? data.email : (emailV.officialEmail || data.email),
        category: data.category, designation: data.designation, wing: data.wing, employmentType: data.employmentType,
        doj: data.doj, gender: data.gender, dob: data.dob, address: data.address,
        highestQualification: data.highestQualification, hasBEd: data.hasBEd, tetStatus: data.tetStatus, subjects: data.subjects,
        documents: docs.filter((x) => x.name), salaryBasic: +salary.basic || 0,
        allowLogin: notReq("login") ? false : login.allow, loginRole: login.role, status: "Active",
      });
      const sid = staff.id || staff._id;
      await resourceService("salaryStructures").create({ staffId: sid, staffName: data.name, category: data.category, basic: +salary.basic || 0, da: +salary.da || 0, hra: +salary.hra || 0, conveyance: +salary.conveyance || 0, special: +salary.special || 0, medical: +salary.medical || 0, pfApplicable: true, esiApplicable: true, ptApplicable: true, tds: 0 });
      await resourceService("onboarding").update(record.id, { staffId: sid, status: "Completed", pageStatus: ps, documents: docs });
      if (record.candidateId) await resourceService("candidates").update(record.candidateId, { stage: "Hired" }).catch(() => {});
      toast.success(`${data.name} onboarded — now in Staff Directory`); onDone();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const cur = STEPS[step];
  const inp = "h-10 w-full rounded-xl bg-white/70 border border-navy/12 px-3 text-sm text-navy outline-none focus:border-royal/45";
  const lbl = "block text-xs font-semibold text-navy/60 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl2 shadow-lift w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 border-b border-navy/10 flex items-center justify-between">
          <div><h2 className="font-display text-xl text-navy">Onboarding · {data.name}</h2><p className="text-xs text-navy/50">{data.designation}</p></div>
          <button onClick={onClose} className="text-navy/40 hover:text-navy"><X size={20} /></button>
        </div>
        {/* stepper */}
        <div className="px-6 py-3 border-b border-navy/8 flex gap-1.5 overflow-x-auto">
          {STEPS.map((s, i) => { const done = stepComplete(s.key); return (
            <button key={s.key} onClick={() => setStep(i)} className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium whitespace-nowrap ${i === step ? "bg-royal-100 text-royal" : done ? "text-emerald-600" : "text-navy/45"}`}>
              <span className={`h-4 w-4 rounded-full grid place-items-center text-[9px] ${done ? "bg-emerald-500 text-white" : i === step ? "bg-royal text-white" : "bg-navy/15"}`}>{done ? <Check size={10} /> : i + 1}</span>
              {s.label}{s.mandatory && <Lock size={9} className="text-coral-400" />}
            </button>
          ); })}
        </div>

        <div className="p-6 overflow-auto flex-1">
          {!cur.mandatory && (
            <label className="flex items-center gap-2 text-sm text-navy/70 mb-4 bg-navy/5 rounded-lg px-3 py-2 w-fit"><input type="checkbox" checked={notReq(cur.key)} onChange={() => toggleNotReq(cur.key)} /> Not required for this staff</label>
          )}
          {notReq(cur.key) ? <p className="text-navy/40 text-sm py-8 text-center">Marked not required — skipped.</p> : (<>
            {cur.key === "personal" && (
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block"><span className={lbl}>Name *</span><input value={data.name} onChange={(e) => set("name", e.target.value)} className={inp} /></label>
                <div><span className={lbl}>Designation *</span><RefSelect resource="designations" labelKey="name" value={data.designation} onChange={(v) => set("designation", v)} placeholder="Designation…" /></div>
                <label className="block"><span className={lbl}>Category</span><select value={data.category} onChange={(e) => set("category", e.target.value)} className={inp}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
                <label className="block"><span className={lbl}>Employment type</span><select value={data.employmentType} onChange={(e) => set("employmentType", e.target.value)} className={inp}>{EMPLOYMENT_TYPES.map((c) => <option key={c}>{c}</option>)}</select></label>
                <label className="block"><span className={lbl}>Wing</span><select value={data.wing} onChange={(e) => set("wing", e.target.value)} className={inp}>{WINGS.map((c) => <option key={c}>{c}</option>)}</select></label>
                <label className="block"><span className={lbl}>Date of joining</span><input type="date" value={data.doj} onChange={(e) => set("doj", e.target.value)} className={inp} /></label>
                <label className="block"><span className={lbl}>Phone</span><input value={data.phone} onChange={(e) => set("phone", e.target.value)} className={inp} /></label>
                <label className="block"><span className={lbl}>Gender</span><select value={data.gender} onChange={(e) => set("gender", e.target.value)} className={inp}><option value="">—</option><option>Male</option><option>Female</option><option>Other</option></select></label>
                <label className="block"><span className={lbl}>Date of birth</span><input type="date" value={data.dob} onChange={(e) => set("dob", e.target.value)} className={inp} /></label>
                <label className="block"><span className={lbl}>Highest qualification</span><input value={data.highestQualification} onChange={(e) => set("highestQualification", e.target.value)} className={inp} /></label>
                <label className="block"><span className={lbl}>Subjects</span><input value={data.subjects} onChange={(e) => set("subjects", e.target.value)} className={inp} /></label>
                <label className="block"><span className={lbl}>TET status</span><select value={data.tetStatus} onChange={(e) => set("tetStatus", e.target.value)} className={inp}>{TET_STATUS.map((t) => <option key={t}>{t}</option>)}</select></label>
                <label className="block sm:col-span-2"><span className={lbl}>Address</span><input value={data.address} onChange={(e) => set("address", e.target.value)} className={inp} /></label>
                <label className="flex items-center gap-2 text-sm text-navy/70"><input type="checkbox" checked={data.hasBEd} onChange={(e) => set("hasBEd", e.target.checked)} /> Holds B.Ed / D.El.Ed</label>
              </div>
            )}
            {cur.key === "kyc" && (
              <div className="space-y-3">
                <p className="text-sm text-navy/50">Upload each document with a document name. At least one is required.</p>
                {docs.map((doc, i) => (
                  <div key={i} className="rounded-xl border border-navy/10 bg-white/50 p-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <label className="block col-span-2"><span className="text-[10px] text-navy/50">Document name *</span><input value={doc.name} onChange={(e) => setDoc(i, "name", e.target.value)} placeholder="e.g. Aadhaar Card" className="h-9 w-full rounded-lg bg-white/80 border border-navy/12 px-2 text-sm" /></label>
                      <label className="block"><span className="text-[10px] text-navy/50">Type</span><select value={doc.type} onChange={(e) => setDoc(i, "type", e.target.value)} className="h-9 w-full rounded-lg bg-white/80 border border-navy/12 px-1 text-sm">{DOC_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
                      <label className="block"><span className="text-[10px] text-navy/50">Number</span><input value={doc.number} onChange={(e) => setDoc(i, "number", e.target.value)} className="h-9 w-full rounded-lg bg-white/80 border border-navy/12 px-2 text-sm" /></label>
                    </div>
                    <div className="flex items-center gap-3 mt-2"><div className="flex-1"><FileUpload value={doc.file} onChange={(v) => setDoc(i, "file", v)} folder="staff-kyc" /></div><label className="text-xs flex items-center gap-1.5"><input type="checkbox" checked={doc.verified} onChange={(e) => setDoc(i, "verified", e.target.checked)} /> Verified</label><button onClick={() => setDocs((a) => a.filter((_, idx) => idx !== i))} className="text-coral-500"><Trash2 size={14} /></button></div>
                  </div>
                ))}
                <button onClick={() => setDocs((a) => [...a, blankDoc()])} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add document</button>
              </div>
            )}
            {cur.key === "salary" && (
              <div><p className="text-sm text-navy/50 mb-3">Basic is required. This becomes the staff salary structure.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[["basic", "Basic *"], ["da", "DA"], ["hra", "HRA"], ["conveyance", "Conveyance"], ["special", "Special allow."], ["medical", "Medical"]].map(([k, label]) => (
                    <label key={k} className="block"><span className={lbl}>{label}</span><input type="number" value={salary[k]} onChange={(e) => setSalary((s) => ({ ...s, [k]: e.target.value }))} className={inp} /></label>
                  ))}
                </div>
                <p className="text-sm text-navy/60 mt-3">Gross: <b>₹{(["basic", "da", "hra", "conveyance", "special", "medical"].reduce((s, k) => s + (+salary[k] || 0), 0)).toLocaleString("en-IN")}</b></p>
              </div>
            )}
            {cur.key === "email" && (
              <div className="space-y-3"><label className="block"><span className={lbl}>Official email</span><input value={emailV.officialEmail} onChange={(e) => setEmailV((s) => ({ ...s, officialEmail: e.target.value }))} className={inp} placeholder="name@school.edu" /></label><div><span className={lbl}>Confirmation (optional file)</span><FileUpload value={emailV.file} onChange={(v) => setEmailV((s) => ({ ...s, file: v }))} folder="onboarding" /></div></div>
            )}
            {cur.key === "login" && (
              <div className="space-y-3"><label className="flex items-center gap-2 text-sm text-navy/70"><input type="checkbox" checked={login.allow} onChange={(e) => setLogin((s) => ({ ...s, allow: e.target.checked }))} /> Enable ERP login for this staff</label>{login.allow && <label className="block"><span className={lbl}>Login role</span><input value={login.role} onChange={(e) => setLogin((s) => ({ ...s, role: e.target.value }))} className={inp} /></label>}</div>
            )}
            {cur.key === "assets" && (
              <div className="space-y-3"><label className="block"><span className={lbl}>Assets issued</span><input value={assets.list} onChange={(e) => setAssets((s) => ({ ...s, list: e.target.value }))} className={inp} placeholder="ID card, keys, laptop…" /></label><div><span className={lbl}>Acknowledgement (optional file)</span><FileUpload value={assets.file} onChange={(v) => setAssets((s) => ({ ...s, file: v }))} folder="onboarding" /></div></div>
            )}
            {cur.key === "induction" && (
              <div className="space-y-3"><label className="flex items-center gap-2 text-sm text-navy/70"><input type="checkbox" checked={induction.orientation} onChange={(e) => setInduction((s) => ({ ...s, orientation: e.target.checked }))} /> Orientation completed</label><label className="flex items-center gap-2 text-sm text-navy/70"><input type="checkbox" checked={induction.pocso} onChange={(e) => setInduction((s) => ({ ...s, pocso: e.target.checked }))} /> POCSO / child-safety training done</label><label className="block"><span className={lbl}>Mentor assigned</span><input value={induction.mentor} onChange={(e) => setInduction((s) => ({ ...s, mentor: e.target.value }))} className={inp} /></label></div>
            )}
          </>)}
        </div>

        <div className="px-6 py-4 border-t border-navy/10 flex items-center justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="flex items-center gap-1 text-navy/60 disabled:opacity-30"><ChevronLeft size={16} /> Back</button>
          <div className="flex items-center gap-2">
            {!mandatoryDone && <span className="text-xs text-navy/40">Complete KYC, Salary & Personal to finish</span>}
            {step < STEPS.length - 1 ? <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>Next <ChevronRight size={15} /></Button>
              : <Button onClick={finish} disabled={saving || !mandatoryDone}>{saving ? <><Spinner size={14} /> Finishing…</> : <><Check size={15} /> Complete & add to Staff</>}</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
