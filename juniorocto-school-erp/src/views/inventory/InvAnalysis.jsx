import { useState, useEffect, useMemo } from "react";
import { LineChart, TrendingDown, AlertTriangle, CalendarDays, Boxes } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { rupee, periodCost, dailyUse, startOf } from "./invKit";

export default function InvAnalysis() {
  const [items, setItems] = useState([]); const [issues, setIssues] = useState([]); const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true); const [workingDays, setWorkingDays] = useState(24);

  useEffect(() => { (async () => {
    const [it, is, rc] = await Promise.all([resourceService("invItems").list({}), resourceService("invIssues").list({}), resourceService("invReceipts").list({})]);
    setItems(normList(it)); setIssues(normList(is)); setReceipts(normList(rc)); setLoading(false);
  })(); }, []);

  const now = Date.now();
  const usedToday = periodCost(issues, startOf("day"), now);
  const usedWeek = periodCost(issues, startOf("week"), now);
  const usedMonth = periodCost(issues, startOf("month"), now);
  const purchasedMonth = receipts.filter((r) => r.date && new Date(r.date).getTime() >= startOf("month")).reduce((a, r) => a + (+r.total || 0), 0);

  const rows = useMemo(() => items.map((it) => {
    const du = dailyUse(issues, it.id, 30);
    const dailyCost = du * (+it.unitCost || 0);
    const avail = +it.availableCount || 0;
    const daysLeft = du > 0 ? Math.floor(avail / du) : null;
    const need = du * workingDays;
    const shortfall = Math.max(0, Math.ceil(need - avail));
    return { it, du, dailyCost, avail, daysLeft, need, shortfall };
  }).filter((r) => r.du > 0).sort((a, b) => b.dailyCost - a.dailyCost), [items, issues, workingDays]);

  const projMonthly = rows.reduce((a, r) => a + r.dailyCost * workingDays, 0);
  const catProj = useMemo(() => {
    const map = {};
    rows.forEach((r) => { const k = r.it.categoryName || "Other"; map[k] = (map[k] || 0) + r.dailyCost * workingDays; });
    return Object.entries(map).map(([cat, amt]) => ({ cat, amt })).sort((a, b) => b.amt - a.amt);
  }, [rows, workingDays]);

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;

  const kpis = [
    { label: "Used today", value: usedToday, icon: TrendingDown, color: "#1651A3" },
    { label: "Used this week", value: usedWeek, icon: CalendarDays, color: "#7c3aed" },
    { label: "Used this month", value: usedMonth, icon: LineChart, color: "#dc2626" },
    { label: "Purchased this month", value: purchasedMonth, icon: Boxes, color: "#16a34a" },
  ];

  return (
    <div>
      <PageHeader title="Consumption Analysis" icon={LineChart} subtitle="What you actually use (not just buy) — daily run-rate, cost & projections for budgeting"
        actions={<div className="flex items-center gap-2"><span className="text-sm text-navy/55">Working days</span><input type="number" value={workingDays} onChange={(e) => setWorkingDays(+e.target.value || 0)} className="h-9 w-20 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm" /></div>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {kpis.map((k) => (
          <div key={k.label} className="glass rounded-xl2 shadow-glass p-4">
            <div className="flex items-center gap-2 mb-1.5"><span className="h-9 w-9 rounded-xl grid place-items-center text-white" style={{ background: k.color }}><k.icon size={17} /></span><span className="text-sm text-navy/55">{k.label}</span></div>
            <p className="font-display text-2xl text-navy">{rupee(k.value)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl2 border border-royal/20 bg-royal-50/60 p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm text-navy/60">Projected consumption for <b>{workingDays} working days</b></p><p className="font-display text-2xl text-royal">{rupee(projMonthly)}</p></div>
        <p className="text-xs text-navy/55 max-w-sm">This run-rate is the real basis for next month's purchase budget — feed these category figures into <b>Accounts → Budgeting</b>.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 glass rounded-xl2 shadow-glass overflow-x-auto self-start">
          <div className="px-5 py-3 border-b border-navy/8"><p className="font-semibold text-navy text-sm">Per-item run-rate & projection</p></div>
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-2.5">Item</th><th className="px-4 py-2.5 text-right">Daily use</th><th className="px-4 py-2.5 text-right">Daily cost</th><th className="px-4 py-2.5 text-right">Available</th><th className="px-4 py-2.5 text-right">Days left</th><th className="px-4 py-2.5 text-right">Need ({workingDays}d)</th><th className="px-4 py-2.5 text-right">Order</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.it.id} className="border-b border-navy/5">
                  <td className="px-4 py-2 text-navy">{r.it.name}<p className="text-[10px] text-navy/40">{r.it.categoryName}</p></td>
                  <td className="px-4 py-2 text-right font-mono text-navy/70">{r.du.toFixed(1)} {r.it.unit}</td>
                  <td className="px-4 py-2 text-right font-mono">{rupee(r.dailyCost)}</td>
                  <td className="px-4 py-2 text-right font-mono text-navy/70">{r.avail}</td>
                  <td className="px-4 py-2 text-right">{r.daysLeft === null ? "—" : <span className={r.daysLeft <= 7 ? "text-coral-600 font-semibold" : r.daysLeft <= 14 ? "text-amber-600" : "text-navy/70"}>{r.daysLeft}d</span>}</td>
                  <td className="px-4 py-2 text-right font-mono text-navy/70">{Math.ceil(r.need)}</td>
                  <td className="px-4 py-2 text-right font-mono">{r.shortfall > 0 ? <span className="text-coral-600 font-semibold">{r.shortfall}</span> : <span className="text-emerald-600">ok</span>}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">No consumption data yet. Issue some items and this fills in.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-2 space-y-4 self-start">
          <div className="glass rounded-xl2 shadow-glass p-5">
            <p className="font-semibold text-navy text-sm mb-3">Projected spend by category ({workingDays}d)</p>
            {catProj.length === 0 ? <p className="text-sm text-navy/40">No data.</p> : catProj.map((c) => (
              <div key={c.cat} className="mb-2.5"><div className="flex justify-between text-sm mb-1"><span className="text-navy/70">{c.cat}</span><span className="font-mono text-navy">{rupee(c.amt)}</span></div><div className="h-1.5 rounded-full bg-navy/8 overflow-hidden"><div className="h-full rounded-full bg-royal" style={{ width: `${projMonthly ? (c.amt / projMonthly) * 100 : 0}%` }} /></div></div>
            ))}
          </div>
          <div className="glass rounded-xl2 shadow-glass p-5">
            <p className="font-semibold text-navy text-sm mb-2">Purchased vs Used · this month</p>
            <div className="flex items-end gap-4">
              <div><p className="text-[11px] text-navy/45">Purchased</p><p className="font-display text-xl text-emerald-700">{rupee(purchasedMonth)}</p></div>
              <div><p className="text-[11px] text-navy/45">Used (consumed)</p><p className="font-display text-xl text-coral-600">{rupee(usedMonth)}</p></div>
              <div><p className="text-[11px] text-navy/45">Net to stock</p><p className="font-display text-xl text-navy">{rupee(purchasedMonth - usedMonth)}</p></div>
            </div>
            <p className="text-[11px] text-navy/45 mt-2">You buy in bulk but the "used" figure is the true running expense — that's what to budget against.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
