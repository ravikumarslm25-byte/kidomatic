import { useState, useEffect, useMemo } from "react";
import { ArrowLeftRight, Plus, Trash2, ArrowDownCircle, ArrowUpCircle, Link2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import FileUpload from "@/components/ui/FileUpload";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { rupee, MONTHS, MODES, CUR_YEAR, ledgerAll, inYear } from "./accountsKit";

const txSvc = resourceService("transactions");

export default function Ledger() {
  const toast = useToast();
  const [tx, setTx] = useState([]); const [payments, setPayments] = useState([]); const [payslips, setPayslips] = useState([]); const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [fType, setFType] = useState(""); const [fMonth, setFMonth] = useState(""); const [fSource, setFSource] = useState(""); const [year, setYear] = useState(CUR_YEAR);

  const load = async () => {
    setLoading(true);
    const [t, p, s, h] = await Promise.all([txSvc.list({}), resourceService("payments").list({}), resourceService("payslips").list({}), resourceService("accountHeads").list({})]);
    setTx(normList(t)); setPayments(normList(p)); setPayslips(normList(s)); setHeads(normList(h)); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const all = useMemo(() => ledgerAll(tx, payments, payslips), [tx, payments, payslips]);
  const shown = useMemo(() => inYear(all, year).filter((e) =>
    (!fType || e.type === fType) && (fMonth === "" || new Date(e.date).getMonth() === +fMonth) && (!fSource || e.source === fSource)
  ), [all, year, fType, fMonth, fSource]);
  const totals = useMemo(() => {
    const income = shown.filter((e) => e.type === "Income").reduce((a, e) => a + (+e.amount || 0), 0);
    const expense = shown.filter((e) => e.type === "Expense").reduce((a, e) => a + (+e.amount || 0), 0);
    return { income, expense, net: income - expense };
  }, [shown]);

  const open = (type) => setForm({ date: new Date().toISOString().slice(0, 10), type, head: "", department: "", account: "", amount: 0, mode: "Cash", party: "", reference: "", note: "", attachment: "" });
  const save = async () => {
    if (!form.head || !form.amount) { toast.error("Head and amount are required"); return; }
    setSaving(true);
    try { await txSvc.create({ ...form, amount: +form.amount || 0, source: "manual" }); toast.success("Transaction recorded"); setForm(null); await load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (e) => { if (e.source !== "manual") return; await txSvc.remove(e.id); load(); };

  const headOptions = heads.filter((h) => !form || h.type === form.type);

  return (
    <div>
      <PageHeader title="Ledger — Income & Expense" icon={ArrowLeftRight} subtitle="Every rupee in and out · fees & payroll auto-linked"
        actions={<div className="flex gap-2"><Button variant="outline" onClick={() => open("Income")}><ArrowDownCircle size={15} /> Income</Button><Button onClick={() => open("Expense")}><ArrowUpCircle size={15} /> Expense</Button></div>} />

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Kpi label="Income" value={totals.income} color="#16a34a" icon={ArrowDownCircle} />
        <Kpi label="Expense" value={totals.expense} color="#dc2626" icon={ArrowUpCircle} />
        <Kpi label="Net" value={totals.net} color={totals.net >= 0 ? "#1651A3" : "#dc2626"} icon={ArrowLeftRight} signed />
      </div>

      <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div><p className="lbl">Year</p><input value={year} onChange={(e) => setYear(e.target.value)} className="ctl w-24" /></div>
        <div><p className="lbl">Type</p><select value={fType} onChange={(e) => setFType(e.target.value)} className="ctl"><option value="">All</option><option>Income</option><option>Expense</option></select></div>
        <div><p className="lbl">Month</p><select value={fMonth} onChange={(e) => setFMonth(e.target.value)} className="ctl"><option value="">All</option>{MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}</select></div>
        <div><p className="lbl">Source</p><select value={fSource} onChange={(e) => setFSource(e.target.value)} className="ctl"><option value="">All</option><option value="manual">Manual</option><option value="fees">Fees</option><option value="payroll">Payroll</option></select></div>
        <span className="ml-auto text-sm text-navy/50">{shown.length} entries</span>
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (
        <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Date</th><th className="px-4 py-3">Head</th><th className="px-4 py-3">Party</th><th className="px-4 py-3">Mode</th><th className="px-4 py-3">Source</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 w-8" /></tr></thead>
            <tbody>
              {shown.map((e) => (
                <tr key={e.id} className="border-b border-navy/5 hover:bg-white/40">
                  <td className="px-4 py-2.5 text-navy/60">{e.date}</td>
                  <td className="px-4 py-2.5"><span className="font-medium text-navy">{e.head}</span>{e.department && <span className="text-[11px] text-navy/45 ml-1">· {e.department}</span>}{e.note && <span className="text-[11px] text-navy/40 ml-1">· {e.note}</span>}</td>
                  <td className="px-4 py-2.5 text-navy/70">{e.party || "—"}</td>
                  <td className="px-4 py-2.5 text-navy/60">{e.mode || "—"}</td>
                  <td className="px-4 py-2.5">{e.source === "manual" ? <Badge color="gray">Manual</Badge> : <span className="text-xs flex items-center gap-1 text-royal"><Link2 size={12} /> {e.source}</span>}</td>
                  <td className={`px-4 py-2.5 text-right font-mono font-semibold ${e.type === "Income" ? "text-emerald-700" : "text-coral-600"}`}>{e.type === "Income" ? "+" : "−"}{rupee(e.amount)}</td>
                  <td className="px-4 py-2.5">{e.source === "manual" && <button onClick={() => del(e)} className="text-navy/30 hover:text-coral-500"><Trash2 size={13} /></button>}</td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">No entries. Record income/expense, or collect fees / run payroll to auto-populate.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form ? `Record ${form.type.toLowerCase()}` : ""} footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="lbl">Date</span><input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Amount (₹)</span><input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="in" /></label>
            </div>
            <label className="block"><span className="lbl">Account head</span><select value={form.head} onChange={(e) => setForm((f) => ({ ...f, head: e.target.value }))} className="in"><option value="">Select head…</option>{headOptions.map((h) => <option key={h.id}>{h.name}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="lbl">Department</span><RefSelect resource="departments" labelKey="name" value={form.department} onChange={(v) => setForm((f) => ({ ...f, department: v }))} placeholder="Optional…" /></div>
              <div><span className="lbl">Cash / Bank account</span><RefSelect resource="cashAccounts" labelKey="name" value={form.account} onChange={(v) => setForm((f) => ({ ...f, account: v }))} placeholder="Optional…" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="lbl">Mode</span><select value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))} className="in">{MODES.map((m) => <option key={m}>{m}</option>)}</select></label>
              {form.type === "Expense"
                ? <div><span className="lbl">Vendor / party</span><RefSelect resource="vendors" labelKey="name" value={form.party} onChange={(v) => setForm((f) => ({ ...f, party: v }))} placeholder="Vendor…" /></div>
                : <label className="block"><span className="lbl">Received from</span><input value={form.party} onChange={(e) => setForm((f) => ({ ...f, party: e.target.value }))} className="in" /></label>}
            </div>
            <label className="block"><span className="lbl">Reference</span><input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} className="in" placeholder="Bill / txn no." /></label>
            <label className="block"><span className="lbl">Note</span><input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} className="in" /></label>
            <div><span className="lbl">Attachment (bill / receipt)</span><FileUpload value={form.attachment} onChange={(v) => setForm((f) => ({ ...f, attachment: v }))} folder="ledger" /></div>
          </div>
        )}
      </Modal>
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const Kpi = ({ label, value, color, icon: Icon, signed }) => (
  <div className="glass rounded-xl2 shadow-glass p-4 flex items-center gap-3">
    <span className="h-10 w-10 rounded-xl grid place-items-center text-white shrink-0" style={{ background: color }}><Icon size={18} /></span>
    <div><p className="text-xs text-navy/50">{label}</p><p className="font-display text-xl text-navy">{signed && value >= 0 ? "+" : ""}{rupee(value)}</p></div>
  </div>
);
