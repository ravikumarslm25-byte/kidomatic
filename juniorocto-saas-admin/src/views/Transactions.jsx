import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { platformService } from "@/services/platform.service";
import { inr, dateFmt } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import DataGrid from "@/components/ui/DataGrid";
import Badge from "@/components/ui/Badge";
const opt = (arr) => [...new Set(arr)].map((v) => ({ value: v, label: v }));
const c = { success: "emerald", failed: "coral", pending: "amber" };
export default function Transactions() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { platformService.transactions().then((d) => { setRows(d); setLoading(false); }); }, []);
  const columns = [
    { key: "ref", label: "Reference", className: "font-mono text-navy text-xs" },
    { key: "customer", label: "Customer" },
    { key: "method", label: "Method" },
    { key: "type", label: "Type" },
    { key: "amount", label: "Amount", align: "right", render: (r) => <span className="font-mono">{inr(r.amount)}</span>, exportValue: (r) => r.amount },
    { key: "date", label: "Date", render: (r) => dateFmt(r.date) },
    { key: "status", label: "Status", render: (r) => <Badge color={c[r.status]}>{r.status}</Badge> },
  ];
  return (
    <div>
      <PageHeader title="Transactions" icon={ArrowLeftRight} subtitle="All payment activity" />
      <DataGrid columns={columns} rows={rows} loading={loading} exportName="transactions"
        searchKeys={["ref", "customer"]}
        filters={[{ key: "status", label: "Status", options: opt(rows.map((r) => r.status)) }, { key: "method", label: "Method", options: opt(rows.map((r) => r.method)) }, { key: "type", label: "Type", options: opt(rows.map((r) => r.type)) }]} />
    </div>
  );
}
