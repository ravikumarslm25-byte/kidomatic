import { useState, useEffect, useMemo } from "react";
import { HandCoins, Search, CreditCard, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";
import { rupee } from "./feeKit";

const invSvc = resourceService("invoices");
const paySvc = resourceService("payments");

export default function CollectFees() {
  const toast = useToast();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [q, setQ] = useState(""); const [sel, setSel] = useState(null);
  const [mode, setMode] = useState("UPI"); const [paying, setPaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [st, inv] = await Promise.all([resourceService("students").list({}), invSvc.list({})]);
    setStudents(normList(st)); setInvoices(normList(inv)); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const results = q ? students.filter((s) => `${s.name} ${s.admissionNo}`.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : [];
  const dues = useMemo(() => (sel ? invoices.filter((i) => i.studentId === sel.id && (+i.balance || 0) > 0) : []), [sel, invoices]);
  const totalDue = dues.reduce((a, i) => a + (+i.balance || 0), 0);

  const collect = async () => {
    if (!totalDue) return;
    setPaying(true);
    try {
      for (const inv of dues) {
        const amt = +inv.balance || 0;
        await invSvc.update(inv.id, { paid: (+inv.paid || 0) + amt, balance: 0, status: "Paid" });
        await paySvc.create({ receiptNo: `RCP-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 9)}`, invoiceId: inv.id, invoiceNo: inv.invoiceNo, studentId: sel.id, studentName: sel.name, amount: amt, mode, reference: "", note: "Collected via Collect Fees", date: new Date().toISOString().slice(0, 10), receivedBy: user?.name || "admin" });
      }
      toast.success(`${rupee(totalDue)} collected via ${mode} · receipt generated`);
      setSel(null); setQ(""); await load();
    } catch (e) { toast.error(e.message || "Payment failed"); } finally { setPaying(false); }
  };

  return (
    <div>
      <PageHeader title="Collect Fees" icon={HandCoins} subtitle="Search a student, review outstanding invoices, collect" />
      <div className="grid lg:grid-cols-5 gap-4">
        {/* picker */}
        <Card className="lg:col-span-2 h-fit">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setSel(null); }} placeholder="Search name or admission no…" className="h-11 w-full rounded-xl bg-white/70 border border-navy/12 pl-9 pr-3 text-sm outline-none focus:border-royal/45 text-navy" />
          </div>
          <div className="mt-3 space-y-1.5">
            {results.map((s) => { const bal = invoices.filter((i) => i.studentId === s.id).reduce((a, i) => a + (+i.balance || 0), 0); return (
              <button key={s.id} onClick={() => setSel(s)} className={`flex items-center gap-3 w-full rounded-2xl px-3 py-2.5 text-left transition ${sel?.id === s.id ? "bg-royal-100 ring-1 ring-royal/25" : "hover:bg-white/60"}`}>
                <Avatar name={s.name} size={34} />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy truncate">{s.name}</p><p className="text-xs text-navy/45 font-mono">{s.admissionNo} · {s.klass}</p></div>
                {bal > 0 && <Badge color="amber">{rupee(bal)}</Badge>}
              </button>
            ); })}
            {q && results.length === 0 && <p className="text-sm text-navy/45 px-1 py-3">No students match “{q}”.</p>}
            {!q && <p className="text-sm text-navy/45 px-1 py-3">Start typing to find a student.</p>}
          </div>
        </Card>

        {/* cost sheet */}
        <Card className="lg:col-span-3">
          {!sel ? <div className="grid place-items-center py-16 text-navy/40 text-sm">Select a student to see outstanding fees.</div>
            : loading ? <div className="grid place-items-center py-16"><Spinner size={26} /></div>
            : dues.length === 0 ? <div className="grid place-items-center py-16 text-emerald-600 text-sm font-semibold">No outstanding dues for {sel.name} 🎉</div>
            : (<>
              <div className="flex items-center gap-3 pb-4 border-b border-navy/8">
                <Avatar name={sel.name} size={44} />
                <div className="flex-1"><p className="font-display text-navy text-lg">{sel.name}</p><p className="text-xs text-navy/45 font-mono">{sel.admissionNo} · {sel.klass}{sel.section ? `-${sel.section}` : ""}</p></div>
                <Badge color="amber">{dues.length} invoice{dues.length > 1 ? "s" : ""}</Badge>
              </div>
              <div className="py-4 space-y-3">
                {dues.map((inv) => (
                  <div key={inv.id} className="rounded-xl border border-navy/10 bg-white/50 p-3">
                    <div className="flex justify-between items-center mb-1.5"><span className="font-mono text-xs text-navy/60">{inv.invoiceNo}</span><Badge color={inv.status === "Partial" ? "blue" : "amber"}>{inv.status}</Badge></div>
                    {(inv.items || []).map((it, i) => <div key={i} className="flex justify-between text-sm"><span className="text-navy/70">{it.title}</span><span className="font-mono text-navy">{rupee(it.amount)}</span></div>)}
                    <div className="flex justify-between text-sm mt-1.5 pt-1.5 border-t border-navy/8"><span className="text-navy/60">Balance</span><span className="font-mono font-semibold text-coral-600">{rupee(inv.balance)}</span></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center py-3 border-t border-navy/8">
                <span className="font-semibold text-navy">Total balance due</span><span className="font-display text-2xl text-navy">{rupee(totalDue)}</span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-navy/60 mb-2">Payment mode</p>
                <div className="flex flex-wrap gap-2">{["UPI", "Card", "Net Banking", "Cash"].map((m) => <button key={m} onClick={() => setMode(m)} className={`h-9 px-4 rounded-xl text-sm font-medium ${mode === m ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/70"}`}>{m}</button>)}</div>
              </div>
              <Button className="w-full mt-5" onClick={collect} disabled={paying}><CreditCard size={16} /> {paying ? "Collecting…" : `Collect ${rupee(totalDue)}`}</Button>
              <p className="mt-3 text-[11px] text-navy/40 flex items-center gap-1.5 justify-center"><ShieldCheck size={13} /> Settles directly to the school's Razorpay account</p>
            </>)}
        </Card>
      </div>
    </div>
  );
}
