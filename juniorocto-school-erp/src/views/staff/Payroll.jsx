import { useState, useEffect, useMemo } from "react";
import { Wallet, Plus, Pencil, Trash2, Play, FileText, Landmark, Coins, Download } from "lucide-react";
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
import { MONTHS, rupee, grossOf, computePayslip, truthy } from "./payrollKit";

const structSvc = resourceService("salaryStructures");
const slipSvc = resourceService("payslips");
const runSvc = resourceService("payrollRuns");
const loanSvc = resourceService("loans");
const setSvc = resourceService("payrollSettings");
const now = new Date();

export default function Payroll() {
  const toast = useToast();
  const { user } = useAuth();
  const b = useBranding();
  const [tab, setTab] = useState("run");
  const [structs, setStructs] = useState([]); const [staff, setStaff] = useState([]);
  const [leaveApps, setLeaveApps] = useState([]); const [exams, setExams] = useState([]); const [loans, setLoans] = useState([]);
  const [slips, setSlips] = useState([]); const [settings, setSettings] = useState({ examDutyRate: 300, pfCap: 15000 });
  const [setId, setSetId] = useState(null);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(now.getMonth()); const [year, setYear] = useState(now.getFullYear());
  const [structForm, setStructForm] = useState(null); const [loanForm, setLoanForm] = useState(null); const [viewSlip, setViewSlip] = useState(null);

  const load = async () => {
    setLoading(true);
    const [st, sf, la, ex, ln, sl, se] = await Promise.all([structSvc.list({}), resourceService("staff").list({}), resourceService("leaveApplications").list({}), resourceService("exams").list({}), loanSvc.list({}), slipSvc.list({}), setSvc.list({})]);
    setStructs(normList(st)); setStaff(normList(sf)); setLeaveApps(normList(la)); setExams(normList(ex)); setLoans(normList(ln)); setSlips(normList(sl));
    const s0 = normList(se)[0]; if (s0) { setSettings({ examDutyRate: s0.examDutyRate || 300, pfCap: s0.pfCap || 15000 }); setSetId(s0.id); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const preview = useMemo(() => structs.map((st) => computePayslip({ st, month, year, leaveApps, exams, loans, settings })), [structs, month, year, leaveApps, exams, loans, settings]);
  const runKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const existingRun = slips.filter((s) => s.runKey === runKey);

  const generate = async () => {
    if (!structs.length) { toast.error("Add salary structures first"); return; }
    setSaving(true);
    try {
      await Promise.all(existingRun.map((s) => slipSvc.remove(s.id)));
      await Promise.all(preview.map((p) => slipSvc.create({ ...p, runKey, month, year, monthName: MONTHS[month], generatedAt: new Date().toISOString() })));
      await runSvc.create({ month, year, monthName: MONTHS[month], status: "Generated", staffCount: preview.length, totalGross: preview.reduce((s, p) => s + p.totalEarnings, 0), totalDeductions: preview.reduce((s, p) => s + p.totalDeductions, 0), totalNet: preview.reduce((s, p) => s + p.net, 0), generatedBy: user?.name || "admin", generatedAt: new Date().toISOString() });
      toast.success(`Payroll generated for ${MONTHS[month]} ${year}`); await load(); setTab("payslips");
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const openStruct = (st) => setStructForm(st ? { ...st } : { staffId: "", staffName: "", category: "", basic: 0, da: 0, hra: 0, conveyance: 0, special: 0, medical: 0, pfApplicable: true, esiApplicable: true, ptApplicable: true, tds: 0, effectiveFrom: "" });
  const pickStaff = (id) => { const s = staff.find((x) => x.id === id); setStructForm((f) => ({ ...f, staffId: id, staffName: s?.name || "", category: s?.category || "", basic: f.basic || +s?.salaryBasic || 0 })); };
  const saveStruct = async () => {
    if (!structForm.staffId) { toast.error("Pick a staff"); return; }
    setSaving(true);
    try { const p = { ...structForm }; ["basic", "da", "hra", "conveyance", "special", "medical", "tds"].forEach((k) => (p[k] = +p[k] || 0)); if (structForm.id) await structSvc.update(structForm.id, p); else await structSvc.create(p); toast.success("Structure saved"); setStructForm(null); await load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const delStruct = async (st) => { await structSvc.remove(st.id); load(); };

  const openLoan = (l) => setLoanForm(l ? { ...l } : { staffId: "", staffName: "", type: "Advance", amount: 0, emi: 0, balance: 0, startMonth: runKey, status: "Active" });
  const pickLoanStaff = (id) => { const s = staff.find((x) => x.id === id); setLoanForm((f) => ({ ...f, staffId: id, staffName: s?.name || "" })); };
  const saveLoan = async () => { setSaving(true); try { const p = { ...loanForm, amount: +loanForm.amount || 0, emi: +loanForm.emi || 0, balance: +loanForm.balance || +loanForm.amount || 0 }; if (loanForm.id) await loanSvc.update(loanForm.id, p); else await loanSvc.create(p); toast.success("Saved"); setLoanForm(null); await load(); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };

  const saveSettings = async () => { try { if (setId) await setSvc.update(setId, settings); else { const r = await setSvc.create(settings); setSetId(r.id || r._id); } toast.success("Rates saved"); } catch (e) { toast.error(e.message); } };

  const bankFile = () => {
    const rows = existingRun.map((s) => { const st = staff.find((x) => x.id === s.staffId); return [s.staffName, st?.empId || "", s.net].map((x) => `"${x}"`).join(","); });
    const blob = new Blob(["Name,EmpID,NetAmount\n" + rows.join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `bank-${runKey}.csv`; a.click();
  };

  const TABS = [["run", "Run Payroll", Play], ["payslips", "Payslips", FileText], ["structures", "Salary Structures", Coins], ["loans", "Loans / Advances", Landmark]];
  const YEARS = [year - 1, year, year + 1];

  return (
    <div>
      <PageHeader title="Payroll" icon={Wallet} subtitle="Salary structures · monthly run with LOP & exam-duty · statutory PF/ESI/PT · payslips" />
      <div className="flex gap-1 mb-5 flex-wrap">
        {TABS.map(([k, label, Icon]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {label}</button>)}
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (<>
        {tab === "run" && (<>
          <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-3 items-end">
            <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Month</p><select value={month} onChange={(e) => setMonth(+e.target.value)} className="ctl">{MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}</select></div>
            <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Year</p><select value={year} onChange={(e) => setYear(+e.target.value)} className="ctl">{YEARS.map((y) => <option key={y}>{y}</option>)}</select></div>
            <div className="ml-auto flex gap-2 items-center">
              {existingRun.length > 0 && <span className="text-sm text-emerald-600">✓ {existingRun.length} payslips</span>}
              <Button onClick={generate} disabled={saving}>{saving ? <><Spinner size={14} /> Running…</> : <><Play size={15} /> {existingRun.length ? "Re-generate" : "Generate payroll"}</>}</Button>
            </div>
          </div>
          {structs.length === 0 ? <div className="glass rounded-xl2 shadow-glass py-14 text-center text-navy/50">Add salary structures first (Salary Structures tab).</div> : (
            <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Staff</th><th className="px-4 py-3 text-right">Gross</th><th className="px-4 py-3 text-center">LOP</th><th className="px-4 py-3 text-right">Exam duty</th><th className="px-4 py-3 text-right">Deductions</th><th className="px-4 py-3 text-right">Net pay</th></tr></thead>
                <tbody>
                  {preview.map((p) => (
                    <tr key={p.staffId} className="border-b border-navy/5 hover:bg-white/40">
                      <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Avatar name={p.staffName} size={28} /><span className="font-medium text-navy">{p.staffName}</span></div></td>
                      <td className="px-4 py-2.5 text-right font-mono">{rupee(p.gross)}</td>
                      <td className="px-4 py-2.5 text-center">{p.lopDays ? <Badge color="red">{p.lopDays}d</Badge> : <span className="text-navy/30">—</span>}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-emerald-700">{p.examDuty ? rupee(p.examDuty) : "—"}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-coral-600">{rupee(p.totalDeductions)}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-navy">{rupee(p.net)}</td>
                    </tr>
                  ))}
                  <tr className="bg-navy/5 font-semibold"><td className="px-4 py-2.5">Total ({preview.length})</td><td className="px-4 py-2.5 text-right font-mono">{rupee(preview.reduce((s, p) => s + p.gross, 0))}</td><td /><td className="px-4 py-2.5 text-right font-mono text-emerald-700">{rupee(preview.reduce((s, p) => s + p.examDuty, 0))}</td><td className="px-4 py-2.5 text-right font-mono text-coral-600">{rupee(preview.reduce((s, p) => s + p.totalDeductions, 0))}</td><td className="px-4 py-2.5 text-right font-mono">{rupee(preview.reduce((s, p) => s + p.net, 0))}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </>)}

        {tab === "payslips" && (<>
          <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-3 items-end">
            <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Month</p><select value={month} onChange={(e) => setMonth(+e.target.value)} className="ctl">{MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}</select></div>
            <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Year</p><select value={year} onChange={(e) => setYear(+e.target.value)} className="ctl">{YEARS.map((y) => <option key={y}>{y}</option>)}</select></div>
            {existingRun.length > 0 && <Button variant="outline" className="ml-auto" onClick={bankFile}><Download size={15} /> Bank file (CSV)</Button>}
          </div>
          {existingRun.length === 0 ? <div className="glass rounded-xl2 shadow-glass py-14 text-center text-navy/50">No payslips for {MONTHS[month]} {year}. Generate payroll first.</div> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingRun.map((s) => (
                <button key={s.id} onClick={() => setViewSlip(s)} className="glass rounded-xl2 shadow-glass p-4 text-left hover:shadow-lift transition">
                  <div className="flex items-center gap-2.5"><Avatar name={s.staffName} size={32} /><div><p className="font-medium text-navy">{s.staffName}</p><p className="text-[11px] text-navy/45">{s.monthName} {s.year}</p></div></div>
                  <p className="font-display text-2xl text-navy mt-3">{rupee(s.net)}</p><p className="text-xs text-navy/45">net · gross {rupee(s.totalEarnings)}</p>
                </button>
              ))}
            </div>
          )}
        </>)}

        {tab === "structures" && (<>
          <div className="flex justify-end mb-3"><Button onClick={() => openStruct()}><Plus size={16} /> Add structure</Button></div>
          <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Staff</th><th className="px-4 py-3 text-right">Basic</th><th className="px-4 py-3 text-right">Gross</th><th className="px-4 py-3">Statutory</th><th className="px-4 py-3 w-10" /></tr></thead>
              <tbody>
                {structs.map((st) => (
                  <tr key={st.id} className="border-b border-navy/5"><td className="px-4 py-2.5 font-medium text-navy">{st.staffName}</td><td className="px-4 py-2.5 text-right font-mono">{rupee(st.basic)}</td><td className="px-4 py-2.5 text-right font-mono font-semibold">{rupee(grossOf(st))}</td><td className="px-4 py-2.5 text-xs text-navy/50">{[truthy(st.pfApplicable) && "PF", truthy(st.esiApplicable) && "ESI", truthy(st.ptApplicable) && "PT"].filter(Boolean).join(" · ")}</td><td className="px-4 py-2.5"><div className="flex gap-1.5"><button onClick={() => openStruct(st)} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button><button onClick={() => delStruct(st)} className="text-coral-500"><Trash2 size={14} /></button></div></td></tr>
                ))}
                {structs.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-navy/40">No salary structures yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="glass rounded-xl2 shadow-glass p-4 mt-4 flex flex-wrap gap-4 items-end">
            <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Exam-duty rate (₹/paper)</p><input type="number" value={settings.examDutyRate} onChange={(e) => setSettings((s) => ({ ...s, examDutyRate: +e.target.value }))} className="ctl w-40" /></div>
            <div><p className="text-xs font-semibold text-navy/60 mb-1.5">PF wage cap (₹)</p><input type="number" value={settings.pfCap} onChange={(e) => setSettings((s) => ({ ...s, pfCap: +e.target.value }))} className="ctl w-40" /></div>
            <Button onClick={saveSettings}>Save rates</Button>
          </div>
        </>)}

        {tab === "loans" && (<>
          <div className="flex justify-end mb-3"><Button onClick={() => openLoan()}><Plus size={16} /> New loan / advance</Button></div>
          <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Staff</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">EMI</th><th className="px-4 py-3 text-right">Balance</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 w-10" /></tr></thead>
              <tbody>
                {loans.map((l) => (
                  <tr key={l.id} className="border-b border-navy/5"><td className="px-4 py-2.5 font-medium text-navy">{l.staffName}</td><td className="px-4 py-2.5">{l.type}</td><td className="px-4 py-2.5 text-right font-mono">{rupee(l.amount)}</td><td className="px-4 py-2.5 text-right font-mono">{rupee(l.emi)}</td><td className="px-4 py-2.5 text-right font-mono">{rupee(l.balance)}</td><td className="px-4 py-2.5"><Badge color={(l.status || "Active") === "Active" ? "amber" : "green"}>{l.status || "Active"}</Badge></td><td className="px-4 py-2.5"><div className="flex gap-1.5"><button onClick={() => openLoan(l)} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button><button onClick={async () => { await loanSvc.remove(l.id); load(); }} className="text-coral-500"><Trash2 size={14} /></button></div></td></tr>
                ))}
                {loans.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">No loans/advances. EMIs here auto-deduct in payroll.</td></tr>}
              </tbody>
            </table>
          </div>
        </>)}
      </>)}

      <Modal open={!!structForm} onClose={() => setStructForm(null)} title={structForm?.id ? "Edit salary structure" : "New salary structure"} footer={<ModalFooter onCancel={() => setStructForm(null)} onSave={saveStruct} saving={saving} />}>
        {structForm && (
          <div className="space-y-4">
            <div><span className="lbl">Staff *</span><RefSelect resource="staff" labelKey="name" valueKey="id" value={structForm.staffId} onChange={pickStaff} placeholder="Select staff…" /></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[["basic", "Basic"], ["da", "DA"], ["hra", "HRA"], ["conveyance", "Conveyance"], ["special", "Special allow."], ["medical", "Medical"]].map(([k, label]) => (
                <label key={k} className="block"><span className="lbl">{label}</span><input type="number" value={structForm[k]} onChange={(e) => setStructForm((f) => ({ ...f, [k]: e.target.value }))} className="in" /></label>
              ))}
            </div>
            <p className="text-sm text-navy/60">Gross: <b className="text-navy">{rupee(grossOf(structForm))}</b></p>
            <label className="block"><span className="lbl">Monthly TDS (₹, optional)</span><input type="number" value={structForm.tds} onChange={(e) => setStructForm((f) => ({ ...f, tds: e.target.value }))} className="in" /></label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={truthy(structForm.pfApplicable)} onChange={(e) => setStructForm((f) => ({ ...f, pfApplicable: e.target.checked }))} /> PF</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={truthy(structForm.esiApplicable)} onChange={(e) => setStructForm((f) => ({ ...f, esiApplicable: e.target.checked }))} /> ESI</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={truthy(structForm.ptApplicable)} onChange={(e) => setStructForm((f) => ({ ...f, ptApplicable: e.target.checked }))} /> Professional Tax</label>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!loanForm} onClose={() => setLoanForm(null)} title={loanForm?.id ? "Edit loan/advance" : "New loan/advance"} footer={<ModalFooter onCancel={() => setLoanForm(null)} onSave={saveLoan} saving={saving} />}>
        {loanForm && (
          <div className="space-y-4">
            <div><span className="lbl">Staff *</span><RefSelect resource="staff" labelKey="name" valueKey="id" value={loanForm.staffId} onChange={pickLoanStaff} placeholder="Select staff…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="lbl">Type</span><select value={loanForm.type} onChange={(e) => setLoanForm((f) => ({ ...f, type: e.target.value }))} className="in"><option>Advance</option><option>Loan</option><option>Festival Advance</option></select></label>
              <label className="block"><span className="lbl">Status</span><select value={loanForm.status} onChange={(e) => setLoanForm((f) => ({ ...f, status: e.target.value }))} className="in"><option>Active</option><option>Closed</option></select></label>
              <label className="block"><span className="lbl">Amount (₹)</span><input type="number" value={loanForm.amount} onChange={(e) => setLoanForm((f) => ({ ...f, amount: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Monthly EMI (₹)</span><input type="number" value={loanForm.emi} onChange={(e) => setLoanForm((f) => ({ ...f, emi: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Balance (₹)</span><input type="number" value={loanForm.balance} onChange={(e) => setLoanForm((f) => ({ ...f, balance: e.target.value }))} className="in" /></label>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!viewSlip} onClose={() => setViewSlip(null)} title="Payslip" size="lg" footer={<ModalFooter onCancel={() => setViewSlip(null)} onSave={() => window.print()} saveLabel="Print" />}>
        {viewSlip && (
          <div className="bg-white rounded-xl border border-navy/10 overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: "var(--brand-navy,#14335E)" }}>
              <div className="text-white"><p className="font-display">{b?.name || "School"}</p><p className="text-[10px] text-white/70">Payslip · {viewSlip.monthName} {viewSlip.year}</p></div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4"><Avatar name={viewSlip.staffName} size={40} /><div><p className="font-display text-navy">{viewSlip.staffName}</p>{viewSlip.lopDays ? <p className="text-xs text-coral-600">LOP: {viewSlip.lopDays} day(s)</p> : null}</div></div>
              <div className="grid grid-cols-2 gap-6">
                <div><p className="text-xs font-bold uppercase text-emerald-700 mb-2">Earnings</p>{viewSlip.earnings.map((e, i) => <div key={i} className="flex justify-between text-sm py-1 border-b border-navy/5"><span className="text-navy/70">{e.label}</span><span className="font-mono text-navy">{rupee(e.amount)}</span></div>)}<div className="flex justify-between text-sm py-1.5 font-semibold"><span>Total earnings</span><span className="font-mono">{rupee(viewSlip.totalEarnings)}</span></div></div>
                <div><p className="text-xs font-bold uppercase text-coral-600 mb-2">Deductions</p>{viewSlip.deductions.map((d, i) => <div key={i} className="flex justify-between text-sm py-1 border-b border-navy/5"><span className="text-navy/70">{d.label}</span><span className="font-mono text-navy">{rupee(d.amount)}</span></div>)}<div className="flex justify-between text-sm py-1.5 font-semibold"><span>Total deductions</span><span className="font-mono">{rupee(viewSlip.totalDeductions)}</span></div></div>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-navy/10 flex justify-between items-center"><span className="font-display text-navy">Net Pay</span><span className="font-display text-2xl text-navy">{rupee(viewSlip.net)}</span></div>
            </div>
          </div>
        )}
      </Modal>
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
