import { useEffect, useState, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { resellerService } from "@/services/reseller.service";
import { PLANS } from "@/config/plans";
import { inr } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

const PLAN_COLORS = { starter: "#446D98", growth: "#2E6BC4", pro: "#E85410" };

export default function Reports() {
  const [payouts, setPayouts] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const [p, s] = await Promise.all([resellerService.payouts(), resellerService.subscriptions()]); setPayouts(p); setSubs(s); }
      finally { setLoading(false); }
    })();
  }, []);

  const earnings = useMemo(() => [...payouts].sort((a, b) => a.period.localeCompare(b.period)).map((p) => ({ period: p.period.slice(5), amount: p.amount })), [payouts]);
  const byPlan = useMemo(() => {
    const m = {};
    subs.filter((s) => s.status !== "cancelled").forEach((s) => { m[s.planKey] = (m[s.planKey] || 0) + (s.amount || 0); });
    return Object.entries(m).map(([plan, mrr]) => ({ plan: PLANS[plan]?.name || plan, key: plan, mrr }));
  }, [subs]);

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;

  return (
    <div>
      <PageHeader title="Reports" icon={BarChart3} subtitle="Your commission and revenue trends" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display text-navy text-lg mb-1">Monthly earnings</h3>
          <p className="text-xs text-navy/45 mb-4">Your commission payout per month</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earnings} margin={{ left: -10, right: 8, top: 8 }}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E85410" stopOpacity={0.5} /><stop offset="100%" stopColor="#E85410" stopOpacity={0.04} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,51,94,.08)" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#446D98" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#446D98" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => inr(v)} contentStyle={{ borderRadius: 12, border: "1px solid rgba(20,51,94,.1)" }} />
                <Area type="monotone" dataKey="amount" stroke="#E85410" strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-navy text-lg mb-1">MRR by plan</h3>
          <p className="text-xs text-navy/45 mb-4">Recurring revenue split across your schools' plans</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPlan} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,51,94,.08)" vertical={false} />
                <XAxis dataKey="plan" tick={{ fontSize: 12, fill: "#446D98" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#446D98" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => inr(v)} cursor={{ fill: "rgba(20,51,94,.04)" }} contentStyle={{ borderRadius: 12, border: "1px solid rgba(20,51,94,.1)" }} />
                <Bar dataKey="mrr" radius={[8, 8, 0, 0]} maxBarSize={64}>
                  {byPlan.map((d) => <Cell key={d.key} fill={PLAN_COLORS[d.key] || "#2E6BC4"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
