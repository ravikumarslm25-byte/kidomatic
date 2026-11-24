import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { School, IndianRupee, Wallet, CreditCard, ArrowRight, Plus, Repeat } from "lucide-react";
import { resellerService } from "@/services/reseller.service";
import { PLANS } from "@/config/plans";
import { inr, dateFmt } from "@/lib/format";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

const txTone = { success: "emerald", failed: "coral", pending: "amber" };

export default function Dashboard() {
  const [rev, setRev] = useState(null);
  const [schools, setSchools] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [r, sc, t] = await Promise.all([resellerService.revenue(), resellerService.schools(), resellerService.transactions()]);
        setRev(r); setSchools(sc); setTxns(t);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><h1 className="font-display text-[26px] text-navy">Partner dashboard</h1><p className="text-sm text-navy/50">Your earnings and network at a glance.</p></div>
        <Link to="/schools"><Button><Plus size={16} /> New School</Button></Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="MRR (your network)" value={inr(rev?.mrr ?? 0)} format="raw" icon={Repeat} tone="royal" sub={`${rev?.activeSubscriptions ?? 0} active subs`} />
        <StatCard label="Earnings this month" value={inr(rev?.thisMonthEarnings ?? 0)} format="raw" icon={IndianRupee} tone="coral" sub={`${rev?.commissionPct ?? 25}% commission`} />
        <StatCard label="Pending payout" value={inr(rev?.pendingPayout ?? 0)} format="raw" icon={Wallet} tone="sea" />
        <StatCard label="Lifetime earnings" value={inr(rev?.lifetimeEarnings ?? 0)} format="raw" icon={CreditCard} tone="navy" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card pad={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="font-display text-navy text-lg">Your schools</h3>
            <Link to="/schools" className="text-sm text-royal font-semibold hover:underline flex items-center gap-1">All <ArrowRight size={14} /></Link>
          </div>
          {loading ? <div className="grid place-items-center py-12"><Spinner size={24} /></div> : (
            <div className="divide-y divide-navy/6">
              {schools.slice(0, 5).map((s) => (
                <Link key={s.id} to={`/schools/${s.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-white/50 transition">
                  <Avatar name={s.branding?.name || s.name} size={34} />
                  <div className="flex-1 min-w-0"><p className="font-medium text-navy text-sm truncate">{s.name}</p><p className="text-xs text-navy/45">{s.board} · {s.students ?? 0} students</p></div>
                  <Badge color="blue">{PLANS[s.planKey]?.name || s.planKey}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card pad={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="font-display text-navy text-lg">Recent transactions</h3>
            <Link to="/billing" className="text-sm text-royal font-semibold hover:underline flex items-center gap-1">Billing <ArrowRight size={14} /></Link>
          </div>
          {loading ? <div className="grid place-items-center py-12"><Spinner size={24} /></div> : (
            <div className="divide-y divide-navy/6">
              {txns.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0"><p className="font-medium text-navy text-sm truncate">{t.schoolName}</p><p className="text-xs text-navy/45 font-mono">{t.txnRef} · {dateFmt(t.date)}</p></div>
                  <div className="text-right"><p className="font-mono text-sm text-navy">{inr(t.amount)}</p><p className="text-[11px] text-emerald-600">+{inr(t.commission)}</p></div>
                  <Badge color={txTone[t.status]}>{t.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
