import { useState, useEffect, useMemo } from "react";
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, Scale, Landmark } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { rupee, MONTHS, CUR_YEAR, ledgerAll, inYear, monthAgg, byHead } from "./accountsKit";

export default function AccountsDashboard() {
  const [tx, setTx] = useState([]); const [payments, setPayments] = useState([]); const [payslips, setPayslips] = useState([]); const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true); const [year, setYear] = useState(CUR_YEAR);

  useEffect(() => { (async () => {
    const [t, p, s, a] = await Promise.all([resourceService("transactions").list({}), resourceService("payments").list({}), resourceService("payslips").list({}), resourceService("cashAccounts").list({})]);
    setTx(normList(t)); setPayments(normList(p)); setPayslips(normList(s)); setAccounts(normList(a)); setLoading(false);
  })(); }, []);

  const all = useMemo(() => ledgerAll(tx, payments, payslips), [tx, payments, payslips]);
  const yearEntries = useMemo(() => inYear(all, year), [all, year]);
  const income = yearEntries.filter((e) => e.type === "Income").reduce((a, e) => a + (+e.amount || 0), 0);
  const expense = yearEntries.filter((e) => e.type === "Expense").reduce((a, e) => a + (+e.amount || 0), 0);
  const openingTotal = accounts.reduce((a, x) => a + (+x.openingBalance || 0), 0);
  const cashPosition = openingTotal + all.filter((e) => e.type === "Income").reduce((a, e) => a + (+e.amount || 0), 0) - all.filter((e) => e.type === "Expense").reduce((a, e) => a + (+e.amount || 0), 0);

  const { inc, exp } = useMemo(() => monthAgg(all, year), [all, year]);
  const maxM = Math.max(1, ...inc, ...exp);
  const incHeads = byHead(yearEntries, "Income").slice(0, 6);
  const expHeads = byHead(yearEntries, "Expense").slice(0, 6);
  const recent = yearEntries.slice(0, 8);

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;

  const cards = [
    { icon: ArrowDownCircle, label: "Total Income", value: income, color: "#16a34a" },
    { icon: ArrowUpCircle, label: "Total Expense", value: expense, color: "#dc2626" },
    { icon: Scale, label: income - expense >= 0 ? "Surplus" : "Deficit", value: income - expense, color: income - expense >= 0 ? "#1651A3" : "#dc2626" },
    { icon: Landmark, label: "Cash + Bank", value: cashPosition, color: "#7c3aed" },
  ];

  return (
    <div>
      <PageHeader title="Accounts Dashboard" icon={LayoutDashboard} subtitle="Income, expense, surplus & cash position — fees and payroll included"
        actions={<input value={year} onChange={(e) => setYear(e.target.value)} className="h-9 w-24 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm" />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-xl2 shadow-glass p-4">
            <div className="flex items-center gap-2 mb-2"><span className="h-9 w-9 rounded-xl grid place-items-center text-white" style={{ background: c.color }}><c.icon size={17} /></span><span className="text-sm text-navy/55">{c.label}</span></div>
            <p className="font-display text-2xl text-navy">{rupee(c.value)}</p>
          </div>
        ))}
      </div>

      {/* monthly income vs expense */}
      <div className="glass rounded-xl2 shadow-glass p-5 mb-5">
        <p className="text-sm font-semibold text-navy mb-3">Income vs Expense · {year}</p>
        <div className="flex items-end gap-2 h-44">
          {MONTHS.map((m, i) => (
            <div key={m} className="flex-1 flex flex-col items-center justify-end gap-1">
              <div className="w-full flex items-end justify-center gap-0.5 h-full">
                <div className="w-1/2 rounded-t bg-emerald-500" style={{ height: `${(inc[i] / maxM) * 100}%`, minHeight: inc[i] > 0 ? 2 : 0 }} title={`Income ${rupee(inc[i])}`} />
                <div className="w-1/2 rounded-t bg-coral-500" style={{ height: `${(exp[i] / maxM) * 100}%`, minHeight: exp[i] > 0 ? 2 : 0 }} title={`Expense ${rupee(exp[i])}`} />
              </div>
              <span className="text-[9px] text-navy/40">{m}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs"><span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Income</span><span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-coral-500" /> Expense</span></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <HeadBreak title="Top income heads" heads={incHeads} color="#16a34a" total={income} />
        <HeadBreak title="Top expense heads" heads={expHeads} color="#dc2626" total={expense} />
      </div>

      <div className="glass rounded-xl2 shadow-glass overflow-hidden">
        <div className="px-5 py-3 border-b border-navy/8"><p className="text-sm font-semibold text-navy">Recent transactions</p></div>
        <table className="w-full text-sm">
          <tbody>{recent.map((e) => (
            <tr key={e.id} className="border-b border-navy/5"><td className="px-5 py-2.5 text-navy/50 w-28">{e.date}</td><td className="px-5 py-2.5 text-navy">{e.head}<span className="text-navy/40 text-xs ml-1">{e.party ? "· " + e.party : ""}</span></td><td className={`px-5 py-2.5 text-right font-mono ${e.type === "Income" ? "text-emerald-700" : "text-coral-600"}`}>{e.type === "Income" ? "+" : "−"}{rupee(e.amount)}</td></tr>
          ))}
          {recent.length === 0 && <tr><td className="px-5 py-8 text-center text-navy/40">No transactions this year.</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}
const HeadBreak = ({ title, heads, color, total }) => (
  <div className="glass rounded-xl2 shadow-glass p-5">
    <p className="text-sm font-semibold text-navy mb-3">{title}</p>
    {heads.length === 0 ? <p className="text-sm text-navy/40">No data yet.</p> : heads.map((h) => (
      <div key={h.head} className="mb-2.5"><div className="flex justify-between text-sm mb-1"><span className="text-navy/70">{h.head}</span><span className="font-mono text-navy">{rupee(h.amount)}</span></div>
        <div className="h-1.5 rounded-full bg-navy/8 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${total ? (h.amount / total) * 100 : 0}%`, background: color }} /></div></div>
    ))}
  </div>
);
