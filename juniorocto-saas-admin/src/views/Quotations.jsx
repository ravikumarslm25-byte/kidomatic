import { useEffect, useState } from "react";
import { FileSignature, Plus } from "lucide-react";
import { platformService } from "@/services/platform.service";
import { inr, dateFmt } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import DataGrid from "@/components/ui/DataGrid";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
const opt = (arr) => [...new Set(arr)].map((v) => ({ value: v, label: v }));
const c = { Draft: "slate", Sent: "blue", Accepted: "emerald", Rejected: "coral" };
export default function Quotations() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { platformService.quotations().then((d) => { setRows(d); setLoading(false); }); }, []);
  const columns = [
    { key: "number", label: "Quote", className: "font-mono text-navy" },
    { key: "customer", label: "Customer" },
    { key: "plan", label: "Plan", render: (r) => <Badge color="blue">{r.plan}</Badge> },
    { key: "amount", label: "Amount", align: "right", render: (r) => <span className="font-mono">{inr(r.amount)}</span>, exportValue: (r) => r.amount },
    { key: "date", label: "Date", render: (r) => dateFmt(r.date) },
    { key: "status", label: "Status", render: (r) => <Badge color={c[r.status]}>{r.status}</Badge> },
  ];
  return (
    <div>
      <PageHeader title="Quotations" icon={FileSignature} subtitle="Proposals sent to prospects" />
      <DataGrid columns={columns} rows={rows} loading={loading} exportName="quotations"
        searchKeys={["number", "customer"]}
        filters={[{ key: "status", label: "Status", options: opt(rows.map((r) => r.status)) }, { key: "plan", label: "Plan", options: opt(rows.map((r) => r.plan)) }]}
        rightSlot={<Button><Plus size={16} /> New Quote</Button>} />
    </div>
  );
}
