import { useEffect, useState } from "react";
import { BarChart3, IndianRupee, Target, Trophy, Users } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { platformService } from "@/services/platform.service";
import { inr } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Spinner from "@/components/ui/Spinner";

const PIE = ["#446D98", "#E85410", "#2E6BC4", "#6B3FA0"];
const axis = { fontSize: 11, fill: "#446D98" };

export default function Reports() {
  const [d, setD] = useState(null);
  useEffect(() => { platformService.reports().then(setD); }, []);
  if (!d) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;

  return (
    <div>
      <PageHeader title="Reports" icon={BarChart3} subtitle="The numbers behind your next milestone" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Revenue YTD" value={inr(d.kpis.revenueYtd)} format="raw" icon={IndianRupee} tone="royal" />
        <StatCard label="New leads" value={d.kpis.newLeads} icon={Target} tone="coral" />
        <StatCard label="Win rate" value={`${d.kpis.winRate}%`} format="raw" icon={Trophy} tone="sea" />
        <StatCard label="ARPA" value={inr(d.kpis.arpa)} format="raw" icon={Users} tone="navy" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Chart title="Revenue trend" sub="Monthly platform revenue">
          <AreaChart data={d.rev} margin={{ left: -8, right: 8, top: 8 }}>
            <defs><linearGradient id="rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1651A3" stopOpacity={0.5} /><stop offset="100%" stopColor="#1651A3" stopOpacity={0.04} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,51,94,.08)" vertical={false} />
            <XAxis dataKey="m" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 100000}L`} />
            <Tooltip formatter={(v) => inr(v)} contentStyle={{ borderRadius: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="#1651A3" strokeWidth={2.5} fill="url(#rv)" />
          </AreaChart>
        </Chart>
        <Chart title="MRR by plan" sub="Recurring revenue split">
          <BarChart data={d.byPlan} margin={{ left: -8, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,51,94,.08)" vertical={false} />
            <XAxis dataKey="plan" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip formatter={(v) => inr(v)} contentStyle={{ borderRadius: 12 }} />
            <Bar dataKey="mrr" radius={[8, 8, 0, 0]} maxBarSize={60}>{d.byPlan.map((_, i) => <Cell key={i} fill={PIE[i]} />)}</Bar>
          </BarChart>
        </Chart>
        <Chart title="Lead funnel" sub="Pipeline by stage">
          <BarChart layout="vertical" data={d.funnel} margin={{ left: 20, right: 8 }}>
            <XAxis type="number" tick={axis} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="stage" tick={axis} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={{ borderRadius: 12 }} />
            <Bar dataKey="n" radius={[0, 8, 8, 0]} fill="#E85410" maxBarSize={22} />
          </BarChart>
        </Chart>
        <Chart title="Customer mix" sub="Schools by acquisition channel">
          <PieChart>
            <Pie data={d.resellerMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
              {d.resellerMix.map((_, i) => <Cell key={i} fill={PIE[i]} />)}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 12 }} />
          </PieChart>
        </Chart>
        <Chart title="Schools growth" sub="Cumulative schools onboarded" wide>
          <LineChart data={d.growth} margin={{ left: -8, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,51,94,.08)" vertical={false} />
            <XAxis dataKey="m" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12 }} />
            <Line type="monotone" dataKey="schools" stroke="#E85410" strokeWidth={3} dot={{ r: 4, fill: "#E85410" }} />
          </LineChart>
        </Chart>
      </div>
    </div>
  );
}
function Chart({ title, sub, children, wide }) {
  return (
    <Card className={wide ? "lg:col-span-2" : ""}>
      <h3 className="font-display text-navy text-lg">{title}</h3>
      <p className="text-xs text-navy/45 mb-4">{sub}</p>
      <div className="h-60"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
    </Card>
  );
}
