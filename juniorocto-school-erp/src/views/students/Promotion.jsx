import { useState, useEffect } from "react";
import { ArrowUpDown, ArrowRight, Loader2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import RefSelect from "@/components/ui/RefSelect";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";

const LADDER = ["Nursery","LKG","UKG","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const nextOf = (c) => { const i = LADDER.indexOf(c); return i === -1 ? c : i === LADDER.length - 1 ? "Graduated" : LADDER[i + 1]; };
const svc = resourceService("students");

export default function Promotion() {
  const toast = useToast();
  const [from, setFrom] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const to = from ? nextOf(from) : "";

  const load = async () => { setLoading(true); setStudents(normList(await svc.list({}))); setLoading(false); };
  useEffect(() => { load(); }, []);

  const inClass = students.filter((s) => s.klass === from && (s.status || "Active") === "Active");

  const promote = async () => {
    if (!from || inClass.length === 0) return;
    setBusy(true);
    try {
      await Promise.all(inClass.map((s) => svc.update(s.id, { klass: to, section: "" })));
      toast.success(`${inClass.length} students promoted ${from} → ${to}`);
      await load();
    } catch (e) { toast.error(e.message || "Promotion failed"); } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader title="Promotion" icon={ArrowUpDown} subtitle="Move a class up to the next grade for the new session" />
      <Card className="max-w-2xl">
        <p className="text-xs font-semibold text-navy/60 mb-1.5">Class to promote</p>
        <div className="max-w-xs"><RefSelect resource="classes" labelKey="name" value={from} onChange={(v) => setFrom(v)} placeholder="Select a class…" /></div>

        {from && (
          <>
            <div className="flex items-center justify-center gap-5 py-8">
              <div className="text-center"><p className="font-display text-2xl text-navy">{from}</p><Badge color="blue">{loading ? "…" : `${inClass.length} students`}</Badge></div>
              <ArrowRight size={28} className="text-coral" />
              <div className="text-center"><p className="font-display text-2xl text-navy">{to}</p><span className="text-xs text-navy/50">next session</span></div>
            </div>
            <p className="text-xs text-navy/45 mb-3">Sections are cleared on promotion — re-assign after the new session starts.</p>
            <Button className="w-full" onClick={promote} disabled={busy || loading || inClass.length === 0}>
              {busy ? <><Loader2 size={16} className="animate-spin" /> Promoting…</> : `Promote ${inClass.length} students ${from} → ${to}`}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
