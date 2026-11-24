import { useEffect, useState } from "react";
import { KeyRound, Check, Ban } from "lucide-react";
import { platformService } from "@/services/platform.service";
import { BILLING_MODELS } from "@/config/billing";
import { inr } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import DataGrid from "@/components/ui/DataGrid";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/store/toast";

const stat = { active: "emerald", pending: "amber", suspended: "coral", expired: "slate" };
const modelChip = { direct_web: "blue", wholesale_reseller: "amber", referral: "coral", direct_sales: "slate" };

export default function Licenses() {
  const toast = useToast();
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  const load = () => platformService.licenses().then((d) => { setRows(d); setLoading(false); });
  useEffect(() => { load(); }, []);
  const act = async (id) => { await platformService.activateLicense(id); toast.success("Licence activated"); load(); };
  const susp = async (id) => { await platformService.suspendLicense(id); toast.success("Licence suspended"); load(); };

  const columns = [
    { key: "schoolName", label: "School", className: "font-medium text-navy" },
    { key: "model", label: "Model", render: (r) => <Badge color={modelChip[r.model]}>{BILLING_MODELS[r.model]?.label}</Badge>, exportValue: (r) => BILLING_MODELS[r.model]?.label },
    { key: "seats", label: "Users", align: "right", render: (r) => <span className="num font-mono">{r.seats}</span> },
    { key: "amount", label: "₹50 × users", align: "right", render: (r) => <span className="font-mono">{inr(r.amount)}/mo</span>, exportValue: (r) => r.amount },
    { key: "activation", label: "Activation", render: (r) => <span className="text-xs text-navy/55">{BILLING_MODELS[r.model]?.activation}</span> },
    { key: "status", label: "Status", render: (r) => <Badge color={stat[r.status]}>{r.status}</Badge> },
    { key: "act", label: "", render: (r) => r.status === "active"
      ? <button onClick={(e) => { e.stopPropagation(); susp(r.id); }} className="inline-flex items-center gap-1 text-coral-600 font-semibold hover:underline text-sm"><Ban size={13} /> Suspend</button>
      : <button onClick={(e) => { e.stopPropagation(); act(r.id); }} className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline text-sm"><Check size={13} /> Activate</button> },
  ];
  return (
    <div>
      <PageHeader title="Licences" icon={KeyRound} subtitle="Seat-based (₹50/user/month) — activation gated by business model" />
      <DataGrid columns={columns} rows={rows} loading={loading} exportName="licenses"
        searchKeys={["schoolName"]}
        filters={[{ key: "model", label: "Model", options: Object.keys(BILLING_MODELS).map((k) => ({ value: k, label: BILLING_MODELS[k].label })) }, { key: "status", label: "Status", options: [{ value: "active", label: "active" }, { value: "pending", label: "pending" }, { value: "suspended", label: "suspended" }] }]} />
    </div>
  );
}
