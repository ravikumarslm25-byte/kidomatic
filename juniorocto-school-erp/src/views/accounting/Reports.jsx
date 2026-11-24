import { useState, useEffect, useMemo } from "react";
import { PieChart as PieIcon, Printer, BookText, Landmark } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useBranding } from "@/store/branding";
import { rupee, CUR_YEAR, ledgerAll, inYear, byHead, accountFor } from "./accountsKit";

export default function Reports() {
  const brand = useBranding();
  const [tab, setTab] = useState("pl");
  const [tx, setTx] = useState([]); const [payments, setPayments] = useState([]); const [payslips, setPayslips] = useState([]); const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true); const [year, setYear] = useState(CUR_YEAR); const [acct, setAcct] = useState("");

  useEffect(() => { (async () => {
    const [t, p, s, a] = await Promise.all([resourceService("transactions").list({}), resourceService("payments").list({}), resourceService("payslips").list({}), resourceService("cashAccounts").list({})]);
    setTx(normList(t)); setPayments(normList(p)); setPayslips(normList(s)); setAccounts(normList(a)); setLoading(false);
  })(); }, []);

  const all = useMemo(() => ledgerAll(tx, payments, payslips), [tx, payments, payslips]);
  const yearEntries = useMemo(() => inYear(all, year), [all, year]);
  const incHeads = byHead(yearEntries, "Income");
  const expHeads = byHead(yearEntries, "Expense");
  const income = incHeads.reduce((a, h) => a + h.amount, 0);
  const expense = expHeads.reduce((a, h) => a + h.amount, 0);
  const net = income - expense;

  // Cash & bank book: assign each entry to an account, compute running balance
  const book = useMemo(() => {
    const chosen = acct || accounts[0]?.name;
    const acctObj = accounts.find((a) => a.name === chosen);
    const opening = +acctObj?.openingBalance || 0;
    const rows = inYear(all, year).filter((e) => accountFor(e, accounts) === chosen).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    let bal = opening;
    const lined = rows.map((e) => { const inAmt = e.type === "Income" ? +e.amount || 0 : 0; const outAmt = e.type === "Expense" ? +e.amount || 0 : 0; bal += inAmt - outAmt; return { ...e, inAmt, outAmt, bal }; });
    return { chosen, opening, lined, closing: bal, inflow: lined.reduce((a, r) => a + r.inAmt, 0), outflow: lined.reduce((a, r) => a + r.outAmt, 0) };
  }, [all, year, acct, accounts]);

  const acctSummary = useMemo(() => accounts.map((a) => {
    const rows = inYear(all, year).filter((e) => accountFor(e, accounts) === a.name);
    const inflow = rows.filter((e) => e.type === "Income").reduce((s, e) => s + (+e.amount || 0), 0);
    const outflow = rows.filter((e) => e.type === "Expense").reduce((s, e) => s + (+e.amount || 0), 0);
    return { name: a.name, type: a.type, opening: +a.openingBalance || 0, inflow, outflow, closing: (+a.openingBalance || 0) + inflow - outflow };
  }), [all, year, accounts]);

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;

  return (
    <div>
      <PageHeader title="Financial Reports" icon={PieIcon} subtitle="Income & Expenditure statement · cash & bank book"
        actions={<div className="flex gap-2 items-center"><input value={year} onChange={(e) => setYear(e.target.value)} className="h-9 w-24 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm" /><button onClick={() => window.print()} className="h-9 px-3 rounded-xl border border-navy/12 bg-white/60 text-sm flex items-center gap-1.5"><Printer size={14} /> Print</button></div>} />

      <div className="flex gap-1 mb-5">
        {[["pl", "Income & Expenditure", BookText], ["book", "Cash & Bank Book", Landmark]].map(([k, label, Icon]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {label}</button>)}
      </div>

      {tab === "pl" && (
        <div className="glass rounded-xl2 shadow-glass p-6 max-w-3xl">
          <div className="text-center border-b border-navy/10 pb-3 mb-4"><p className="font-display text-lg text-navy">{brand?.name || "School"}</p><p className="text-sm text-navy/55">Income & Expenditure Statement · {year}</p></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700 mb-2">Income</p>
              {incHeads.map((h) => <Row key={h.head} k={h.head} v={h.amount} />)}
              {incHeads.length === 0 && <p className="text-sm text-navy/40">No income recorded.</p>}
              <div className="flex justify-between font-semibold border-t border-navy/10 mt-2 pt-2"><span>Total Income</span><span className="font-mono">{rupee(income)}</span></div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-coral-600 mb-2">Expenditure</p>
              {expHeads.map((h) => <Row key={h.head} k={h.head} v={h.amount} />)}
              {expHeads.length === 0 && <p className="text-sm text-navy/40">No expenses recorded.</p>}
              <div className="flex justify-between font-semibold border-t border-navy/10 mt-2 pt-2"><span>Total Expenditure</span><span className="font-mono">{rupee(expense)}</span></div>
            </div>
          </div>
          <div className={`mt-5 pt-3 border-t-2 border-navy/10 flex justify-between items-center ${net >= 0 ? "text-emerald-700" : "text-coral-600"}`}>
            <span className="font-display text-lg text-navy">{net >= 0 ? "Surplus" : "Deficit"}</span>
            <span className="font-display text-2xl">{rupee(Math.abs(net))}</span>
          </div>
        </div>
      )}

      {tab === "book" && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            {acctSummary.map((a) => (
              <button key={a.name} onClick={() => setAcct(a.name)} className={`glass rounded-xl2 shadow-glass p-4 text-left ${(acct || accounts[0]?.name) === a.name ? "ring-2 ring-royal/40" : ""}`}>
                <div className="flex items-center justify-between"><p className="font-semibold text-navy text-sm">{a.name}</p><span className="text-[10px] px-2 py-0.5 rounded-full bg-navy/8 text-navy/50">{a.type}</span></div>
                <p className="font-display text-xl text-navy mt-1">{rupee(a.closing)}</p>
                <p className="text-[11px] text-navy/45">in {rupee(a.inflow)} · out {rupee(a.outflow)}</p>
              </button>
            ))}
            {acctSummary.length === 0 && <p className="text-navy/40 text-sm">Add cash/bank accounts in Cash & Bank.</p>}
          </div>
          <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
            <div className="px-5 py-3 border-b border-navy/8 flex items-center justify-between"><p className="font-semibold text-navy">{book.chosen} · book</p><p className="text-sm text-navy/55">Opening {rupee(book.opening)} → Closing <b className="text-navy">{rupee(book.closing)}</b></p></div>
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Particulars</th><th className="px-4 py-2.5 text-right">In</th><th className="px-4 py-2.5 text-right">Out</th><th className="px-4 py-2.5 text-right">Balance</th></tr></thead>
              <tbody>
                <tr className="border-b border-navy/5 bg-navy/5"><td className="px-4 py-2" colSpan={4}>Opening balance</td><td className="px-4 py-2 text-right font-mono">{rupee(book.opening)}</td></tr>
                {book.lined.map((r) => (
                  <tr key={r.id} className="border-b border-navy/5"><td className="px-4 py-2 text-navy/55">{r.date}</td><td className="px-4 py-2 text-navy/80">{r.head}{r.party ? <span className="text-navy/40"> · {r.party}</span> : ""}{r.source !== "manual" && <span className="text-[10px] text-royal ml-1">({r.source})</span>}</td><td className="px-4 py-2 text-right font-mono text-emerald-700">{r.inAmt ? rupee(r.inAmt) : ""}</td><td className="px-4 py-2 text-right font-mono text-coral-600">{r.outAmt ? rupee(r.outAmt) : ""}</td><td className="px-4 py-2 text-right font-mono font-semibold">{rupee(r.bal)}</td></tr>
                ))}
                {book.lined.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-navy/40">No movements for this account in {year}.</td></tr>}
                <tr className="border-t-2 border-navy/10 font-semibold"><td className="px-4 py-2.5" colSpan={2}>Closing balance</td><td className="px-4 py-2.5 text-right font-mono text-emerald-700">{rupee(book.inflow)}</td><td className="px-4 py-2.5 text-right font-mono text-coral-600">{rupee(book.outflow)}</td><td className="px-4 py-2.5 text-right font-mono">{rupee(book.closing)}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-navy/40 mt-2">Fees & payroll entries without an assigned account are mapped by payment mode (cash → cash account, else bank). Assign an account when recording a transaction to override.</p>
        </>
      )}
    </div>
  );
}
const Row = ({ k, v }) => <div className="flex justify-between text-sm py-1 border-b border-navy/5"><span className="text-navy/70">{k}</span><span className="font-mono text-navy">{rupee(v)}</span></div>;
