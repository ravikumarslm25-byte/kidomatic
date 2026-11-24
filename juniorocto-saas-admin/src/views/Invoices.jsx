import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Eye } from "lucide-react";
import { platformService } from "@/services/platform.service";
import { BILLING_MODELS } from "@/config/billing";
import { inr, dateFmt } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import DataGrid from "@/components/ui/DataGrid";
import Badge from "@/components/ui/Badge";
const opt = (arr) => [...new Set(arr)].map((v) => ({ value: v, label: v }));
const modelChip = { direct_web: "blue", wholesale_reseller: "amber", referral: "coral", direct_sales: "slate" };
export default function Invoices() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { platformService.invoices().then((d) => { setRows(d.map((i) => ({ ...i, modelLabel: BILLING_MODELS[i.model]?.label, billToName: i.billTo?.name }))); setLoading(false); }); }, []);
  const columns = [
    { key: "number", label: "Invoice", className: "font-mono text-navy", render: (r) => <span className="font-mono text-navy font-semibold">{r.number}</span> },
    { key: "billToName", label: "Bill to", render: (r) => <div><p className="text-navy">{r.billTo?.name}</p><p className="text-[11px] text-navy/45 capitalize">{r.billToType}</p></div> },
    { key: "modelLabel", label: "Model", render: (r) => <Badge color={modelChip[r.model]}>{BILLING_MODELS[r.model]?.label}</Badge> },
    { key: "total", label: "Total", align: "right", render: (r) => <span className="font-mono">{inr(r.total)}</span>, exportValue: (r) => r.total },
    { key: "issueDate", label: "Issued", render: (r) => dateFmt(r.issueDate) },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
    { key: "view", label: "", render: (r) => <button onClick={(e) => { e.stopPropagation(); nav(`/invoices/${r.id}`); }} className="inline-flex items-center gap-1 text-royal font-semibold hover:underline text-sm"><Eye size={14} /> View</button> },
  ];
  return (
    <div>
      <PageHeader title="Invoices" icon={FileText} subtitle="Billing across all four business models" />
      <DataGrid columns={columns} rows={rows} loading={loading} exportName="invoices"
        searchKeys={["number", "billToName", "schoolName"]}
        filters={[{ key: "model", label: "Model", options: Object.keys(BILLING_MODELS).map((k) => ({ value: k, label: BILLING_MODELS[k].label })) }, { key: "status", label: "Status", options: opt(rows.map((r) => r.status)) }]}
        onRowClick={(r) => nav(`/invoices/${r.id}`)} />
    </div>
  );
}
