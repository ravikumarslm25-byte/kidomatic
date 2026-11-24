import { useState, useEffect, useMemo } from "react";
import { LayoutDashboard, TrendingUp, IndianRupee, Clock, AlertTriangle, Wallet, PiggyBank } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { CUR_YEAR, rupee, billableItems } from "./feeKit";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TERM_MONTHS = [5, 9, 0]; // Jun, Oct, Jan for 3 terms

export default function FeesDashboard() {
  const [inv, setInv] = useState([]); const [pay, setPay] = useState([]); const [structs, setStructs] = useState([]); const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true); const [year, setYear] = useState(CUR_YEAR);

  useEffect(() => { (async () => {
    const [i, p, s, st] = await Promise.all([resourceService("invoices").list({}), resourceService("payments").list({}), resourceService("feeStructures").list({}), resourceService("students").list({})]);
    setInv(normList(i)); setPay(normList(p)); setStructs(normList(s)); setStudents(normList(st)); setLoading(false);
  })(); }, []);

  const today = new Date().toISOString().slice(0, 10);
  const yInv = useMemo(() => inv.filter((x) => (x.academicYear || CUR_YEAR) === year), [inv, year]);
  const prevYear = `${+year.slice(0, 4) - 1}-${year.slice(0, 4).slice(2)}`;

  const kpi = useMemo(() => {
    const invoiced = yInv.reduce((a, x) => a + (+x.total || 0), 0);
    const collected = yInv.reduce((a, x) => a + (+x.paid || 0), 0);
    const pending = yInv.reduce((a, x) => a + (+x.balance || 0), 0);
    const overdue = yInv.filter((x) => (+x.balance || 0) > 0 && x.dueDate && x.dueDate < today).reduce((a, x) => a + (+x.balance || 0), 0);
    const lastYearPending = inv.filter((x) => (x.academicYear || "") === prevYear && (+x.balance || 0) > 0).reduce((a, x) => a + (+x.balance || 0), 0);
    return { invoiced, collected, pending, overdue, lastYearPending, rate: invoiced ? Math.round(collected / invoiced * 100) : 0 };
  }, [yInv, inv, prevYear, today]);

  // Expected annual + monthly projection from structures × active students
  const proj = useMemo(() => {
    const months = new Array(12).fill(0); const perClass = {}; let total = 0;
    structs.filter((s) => (s.academicYear || CUR_YEAR) === year).forEach((st) => {
      const n = students.filter((x) => x.klass === st.klass && (x.status || "Active") === "Active").length;
      const terms = st.terms || [];
      let classAnnual = 0;
      billableItems(st).forEach((it) => {
        if (it.optional) return;
        const amt = it.amount * n; classAnnual += amt;
        if (it.kind === "term") { const ti = terms.indexOf(it.term); months[TERM_MONTHS[ti] ?? 5] += amt; }
        else if (it.kind === "onetime") months[5] += amt;
        else for (let m = 0; m < 12; m++) months[m] += amt / 12;
      });
      perClass[st.klass] = (perClass[st.klass] || 0) + classAnnual; total += classAnnual;
    });
    return { months, perClass, total };
  }, [structs, students, year]);

  const quarters = [0, 1, 2, 3].map((q) => proj.months.slice(q * 3, q * 3 + 3).reduce((a, b) => a + b, 0));
  const maxM = Math.max(1, ...proj.months);
  const curMonth = new Date().getMonth();
  const upcoming = proj.months.map((v, i) => ({ m: i, v })).filter((x) => x.m >= curMonth).slice(0, 4);

  // by class
  const byClass = useMemo(() => {
    const map = {};
    yInv.forEach((x) => { const k = x.klass || "—"; map[k] = map[k] || { klass: k, invoiced: 0, collected: 0, pending: 0 }; map[k].invoiced += +x.total || 0; map[k].collected += +x.paid || 0; map[k].pending += +x.balance || 0; });
    Object.keys(proj.perClass).forEach((k) => { map[k] = map[k] || { klass: k, invoiced: 0, collected: 0, pending: 0 }; map[k].expected = proj.perClass[k]; });
    return Object.values(map).sort((a, b) => (b.expected || b.invoiced) - (a.expected || a.invoiced));
  }, [yInv, proj]);

  const recentPay = [...pay].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 8);

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;

  const cards = [
    { icon: IndianRupee, label: "Invoiced", value: kpi.invoiced, color: "#1651A3" },
    { icon: Wallet, label: "Collected", value: kpi.collected, color: "#16a34a", sub: `${kpi.rate}% collection rate` },
    { icon: Clock, label: "Pending", value: kpi.pending, color: "#d97706" },
    { icon: AlertTriangle, label: "Overdue", value: kpi.overdue, color: "#dc2626" },
  ];

  return (
    <div>
      <PageHeader title="Fees Dashboard" icon={LayoutDashboard} subtitle="Collection, dues, overdue & projected cashflow — end to end"
        actions={<input value={year} onChange={(e) => setYear(e.target.value)} className="h-9 w-28 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm" />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-xl2 shadow-glass p-4">
            <div className="flex items-center gap-2 mb-2"><span className="h-9 w-9 rounded-xl grid place-items-center text-white" style={{ background: c.color }}><c.icon size={17} /></span><span className="text-sm text-navy/55">{c.label}</span></div>
            <p className="font-display text-2xl text-navy">{rupee(c.value)}</p>
            {c.sub && <p className="text-xs text-emerald-600 mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* collection rate + carry forward */}
        <div className="glass rounded-xl2 shadow-glass p-5">
          <p className="text-sm font-semibold text-navy mb-3">Collection progress · {year}</p>
          <div className="h-3 rounded-full bg-navy/10 overflow-hidden mb-2"><div className="h-full rounded-full" style={{ width: `${kpi.rate}%`, background: "linear-gradient(90deg,#1651A3,#16a34a)" }} /></div>
          <p className="text-xs text-navy/55">{rupee(kpi.collected)} of {rupee(kpi.invoiced)} invoiced</p>
          <div className="mt-4 pt-3 border-t border-navy/8 flex items-center gap-2"><PiggyBank size={16} className="text-coral-500" /><div><p className="text-xs text-navy/50">Carry-forward — last year pending</p><p className="font-display text-lg text-coral-600">{rupee(kpi.lastYearPending)}</p></div></div>
        </div>

        {/* monthly projection */}
        <div className="glass rounded-xl2 shadow-glass p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3"><p className="text-sm font-semibold text-navy flex items-center gap-1.5"><TrendingUp size={15} /> Projected collection by month</p><span className="text-xs text-navy/50">Expected annual: <b className="text-navy">{rupee(proj.total)}</b></span></div>
          <div className="flex items-end gap-1.5 h-40">
            {proj.months.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div className="w-full rounded-t-md transition-all" style={{ height: `${(v / maxM) * 100}%`, minHeight: v > 0 ? 3 : 0, background: i === curMonth ? "#E85410" : "#1651A3", opacity: i < curMonth ? 0.4 : 1 }} title={rupee(v)} />
                <span className="text-[9px] text-navy/40">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">{quarters.map((q, i) => <div key={i} className="rounded-lg bg-navy/5 px-2 py-1.5 text-center"><p className="text-[10px] text-navy/45">Q{i + 1}</p><p className="text-sm font-semibold text-navy">{rupee(q)}</p></div>)}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* upcoming cashflow */}
        <div className="glass rounded-xl2 shadow-glass p-5">
          <p className="text-sm font-semibold text-navy mb-3">Upcoming cashflow (expected)</p>
          {upcoming.map((x) => <div key={x.m} className="flex items-center justify-between py-2 border-b border-navy/5"><span className="text-navy/70">{MONTHS[x.m]}</span><span className="font-mono font-semibold text-navy">{rupee(x.v)}</span></div>)}
          {upcoming.every((x) => x.v === 0) && <p className="text-sm text-navy/40">Create fee structures to project cashflow.</p>}
        </div>
        {/* recent payments */}
        <div className="glass rounded-xl2 shadow-glass p-5">
          <p className="text-sm font-semibold text-navy mb-3">Recent payments</p>
          {recentPay.length === 0 ? <p className="text-sm text-navy/40">No payments recorded yet.</p> : recentPay.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-navy/5"><div><p className="text-sm text-navy font-medium">{p.studentName || "—"}</p><p className="text-[11px] text-navy/45">{p.date} · {p.mode}</p></div><span className="font-mono text-emerald-700">{rupee(p.amount)}</span></div>
          ))}
        </div>
      </div>

      {/* by class */}
      <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
        <div className="px-5 py-3 border-b border-navy/8"><p className="text-sm font-semibold text-navy">By class · {year}</p></div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase text-navy/45 border-b border-navy/8"><th className="px-5 py-2.5">Class</th><th className="px-5 py-2.5 text-right">Expected</th><th className="px-5 py-2.5 text-right">Invoiced</th><th className="px-5 py-2.5 text-right">Collected</th><th className="px-5 py-2.5 text-right">Pending</th><th className="px-5 py-2.5">Progress</th></tr></thead>
          <tbody>
            {byClass.map((r) => { const rate = r.invoiced ? Math.round(r.collected / r.invoiced * 100) : 0; return (
              <tr key={r.klass} className="border-b border-navy/5"><td className="px-5 py-2.5 font-medium text-navy">{r.klass}</td><td className="px-5 py-2.5 text-right font-mono text-navy/60">{r.expected ? rupee(r.expected) : "—"}</td><td className="px-5 py-2.5 text-right font-mono">{rupee(r.invoiced)}</td><td className="px-5 py-2.5 text-right font-mono text-emerald-700">{rupee(r.collected)}</td><td className="px-5 py-2.5 text-right font-mono text-coral-600">{rupee(r.pending)}</td>
                <td className="px-5 py-2.5"><div className="h-1.5 w-24 rounded-full bg-navy/10 overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${rate}%` }} /></div></td></tr>
            ); })}
            {byClass.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-navy/40">No data yet — create fee structures and generate invoices.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
