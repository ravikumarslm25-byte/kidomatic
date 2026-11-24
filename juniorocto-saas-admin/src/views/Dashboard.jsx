import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Store, Building2, CheckCircle2, GraduationCap, ArrowRight } from "lucide-react";
import { platformService } from "@/services/platform.service";
import { PLANS } from "@/config/plans";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Spinner from "@/components/ui/Spinner";

export default function Dashboard() {
  const [sum, setSum] = useState(null);
  const [resellers, setResellers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const [s, r, sc] = await Promise.all([platformService.summary(), platformService.resellers(), platformService.schools()]); setSum(s); setResellers(r); setSchools(sc); } finally { setLoading(false); } })(); }, []);

  return (
    <div className="space-y-5">
      <div><h1 className="font-display text-[26px] text-navy">Platform overview</h1><p className="text-sm text-navy/50">Everything across the KidoMatic network.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Resellers" value={sum?.resellers ?? 0} icon={Store} tone="royal" />
        <StatCard label="Schools" value={sum?.schools ?? 0} icon={Building2} tone="coral" />
        <StatCard label="Active schools" value={sum?.activeSchools ?? 0} icon={CheckCircle2} tone="sea" />
        <StatCard label="Students" value={sum?.students ?? 0} icon={GraduationCap} tone="navy" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card pad={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Resellers</h3><Link to="/resellers" className="text-sm text-royal font-semibold hover:underline flex items-center gap-1">All <ArrowRight size={14} /></Link></div>
          {loading ? <div className="grid place-items-center py-12"><Spinner size={24} /></div> : (
            <div className="divide-y divide-navy/6">
              {resellers.slice(0, 5).map((r) => (
                <Link key={r.id} to="/resellers" className="flex items-center gap-3 px-5 py-3 hover:bg-white/50">
                  <Avatar name={r.name} size={34} />
                  <div className="flex-1 min-w-0"><p className="font-medium text-navy text-sm truncate">{r.name}</p><p className="text-xs text-navy/45">{r.commissionPct}% commission · {r.revenueSharePct}% platform</p></div>
                  <Badge>{r.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
        <Card pad={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Recent schools</h3><Link to="/customers" className="text-sm text-royal font-semibold hover:underline flex items-center gap-1">Customers <ArrowRight size={14} /></Link></div>
          {loading ? <div className="grid place-items-center py-12"><Spinner size={24} /></div> : (
            <div className="divide-y divide-navy/6">
              {schools.slice(0, 5).map((s) => {
                const r = resellers.find((x) => x.id === s.resellerId);
                return (
                  <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={s.name} size={34} />
                    <div className="flex-1 min-w-0"><p className="font-medium text-navy text-sm truncate">{s.name}</p><p className="text-xs text-navy/45">{r ? `via ${r.name}` : "Direct (HackGeniX)"}</p></div>
                    <Badge color="blue">{PLANS[s.planKey]?.name || s.planKey}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
