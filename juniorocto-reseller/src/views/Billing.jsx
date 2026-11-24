import { useEffect, useState } from "react";
import { Receipt, Repeat, ArrowLeftRight, Wallet } from "lucide-react";
import { resellerService } from "@/services/reseller.service";
import { PLANS } from "@/config/plans";
import { inr, dateFmt } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";

const TABS = [
  { id: "subscriptions", label: "Subscriptions", icon: Repeat },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "payouts", label: "Payouts", icon: Wallet },
];
const subTone = { active: "emerald", trialing: "blue", past_due: "amber", cancelled: "coral" };
const txTone = { success: "emerald", failed: "coral", pending: "amber" };
const poTone = { paid: "emerald", pending: "amber", processing: "blue" };

export default function Billing() {
  const [tab, setTab] = useState("subscriptions");
  const [data, setData] = useState({ subscriptions: [], transactions: [], payouts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [subscriptions, transactions, payouts] = await Promise.all([
          resellerService.subscriptions(), resellerService.transactions(), resellerService.payouts(),
        ]);
        setData({ subscriptions, transactions, payouts });
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Billing" icon={Receipt} subtitle="Subscriptions, transactions and your monthly payouts" />
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium whitespace-nowrap ${tab === t.id ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/70 hover:bg-white/80"}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <Card pad={false}>
        {loading ? <div className="grid place-items-center py-16"><Spinner size={26} /></div> : (
          <div className="overflow-x-auto">
            {tab === "subscriptions" && (
              <Table head={["School", "Plan", "Amount / mo", "Next billing", "Status"]}
                rows={data.subscriptions.map((s) => [s.schoolName, PLANS[s.planKey]?.name || s.planKey, inr(s.amount), dateFmt(s.nextBillingAt), <Badge color={subTone[s.status]}>{s.status.replace("_", " ")}</Badge>])} />
            )}
            {tab === "transactions" && (
              <Table head={["Date", "School", "Ref", "Amount", "Commission", "Status"]}
                rows={data.transactions.map((t) => [dateFmt(t.date), t.schoolName, <span className="font-mono text-xs">{t.txnRef}</span>, inr(t.amount), <span className="text-emerald-600">+{inr(t.commission)}</span>, <Badge color={txTone[t.status]}>{t.status}</Badge>])} />
            )}
            {tab === "payouts" && (
              <Table head={["Period", "Gross revenue", "Your payout", "Status", "Paid on"]}
                rows={data.payouts.map((p) => [p.period, inr(p.gross), <span className="font-semibold text-navy">{inr(p.amount)}</span>, <Badge color={poTone[p.status]}>{p.status}</Badge>, dateFmt(p.paidAt)])} />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function Table({ head, rows }) {
  return (
    <table className="w-full text-sm">
      <thead><tr className="text-left text-navy/45 border-b border-navy/8">
        {head.map((h, i) => <th key={i} className="font-semibold uppercase text-[11px] tracking-wide px-5 py-3">{h}</th>)}
      </tr></thead>
      <tbody className="divide-y divide-navy/6">
        {rows.length === 0 ? <tr><td colSpan={head.length} className="px-5 py-10 text-center text-navy/45">Nothing here yet.</td></tr> :
          rows.map((r, i) => <tr key={i} className="hover:bg-white/50">{r.map((c, j) => <td key={j} className="px-5 py-3 text-navy/80">{c}</td>)}</tr>)}
      </tbody>
    </table>
  );
}
