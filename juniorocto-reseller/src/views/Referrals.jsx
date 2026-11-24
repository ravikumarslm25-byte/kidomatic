import { useEffect, useState } from "react";
import { Share2, Copy, Check, Link2, Users, TrendingUp } from "lucide-react";
import { resellerService } from "@/services/reseller.service";
import { PLANS } from "@/config/plans";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import StatCard from "@/components/ui/StatCard";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/store/toast";

export default function Referrals() {
  const toast = useToast();
  const [ref, setRef] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try { const [r, sc] = await Promise.all([resellerService.referral(), resellerService.schools()]); setRef(r); setSchools(sc); }
      finally { setLoading(false); }
    })();
  }, []);

  const referred = schools.filter((s) => s.referred);
  const copy = () => { navigator.clipboard?.writeText(ref?.link || ""); setCopied(true); toast.success("Referral link copied"); setTimeout(() => setCopied(false), 1500); };

  return (
    <div>
      <PageHeader title="Referrals" icon={Share2} subtitle="Share your link — schools that sign up are attributed to you" />

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3"><Link2 size={18} className="text-royal" /><h3 className="font-display text-navy text-lg">Your referral link</h3></div>
          <div className="flex items-stretch gap-2">
            <div className="flex-1 rounded-xl bg-white/70 border border-navy/12 px-3 flex items-center font-mono text-sm text-navy/80 overflow-x-auto whitespace-nowrap">{loading ? "…" : ref?.link}</div>
            <button onClick={copy} className="btn-grad text-white font-semibold px-4 rounded-xl shadow-soft flex items-center gap-2 shrink-0">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}</button>
          </div>
          <p className="text-xs text-navy/45 mt-3">Any school that registers through this link is automatically added to your network, and you earn commission on their subscription. Your code: <span className="font-mono text-navy/70">{ref?.code}</span></p>
        </Card>
        <StatCard label="Referred schools" value={referred.length} icon={Users} tone="coral" sub="via your link" />
      </div>

      <Card pad={false}>
        <div className="px-5 pt-5 pb-3 flex items-center gap-2"><TrendingUp size={18} className="text-royal" /><h3 className="font-display text-navy text-lg">Schools from your link</h3></div>
        {loading ? <div className="grid place-items-center py-14"><Spinner size={24} /></div> : referred.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-navy/45">No referred schools yet — share your link to get started.</p>
        ) : (
          <div className="divide-y divide-navy/6">
            {referred.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={s.branding?.name || s.name} size={36} />
                <div className="flex-1 min-w-0"><p className="font-medium text-navy text-sm truncate">{s.name}</p><p className="text-xs text-navy/45">{s.board} · {s.session}</p></div>
                <Badge color="blue">{PLANS[s.planKey]?.name || s.planKey}</Badge>
                <Badge color="emerald">Referred</Badge>
                <span className="hidden sm:inline font-mono text-sm text-navy/70 w-14 text-right">{s.students ?? 0}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
