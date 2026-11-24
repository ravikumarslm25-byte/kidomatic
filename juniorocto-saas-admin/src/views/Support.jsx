import { useEffect, useState } from "react";
import { LifeBuoy, Plus } from "lucide-react";
import { platformService } from "@/services/platform.service";
import { dateFmt } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import DataGrid from "@/components/ui/DataGrid";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
const opt = (arr) => [...new Set(arr)].map((v) => ({ value: v, label: v }));
const sc = { Open: "amber", Pending: "blue", Resolved: "emerald", Closed: "slate" };
const pc = { Low: "slate", Medium: "blue", High: "coral" };
export default function Support() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { platformService.tickets().then((d) => { setRows(d); setLoading(false); }); }, []);
  const columns = [
    { key: "id", label: "Ticket", className: "font-mono text-navy text-xs" },
    { key: "subject", label: "Subject", className: "font-medium text-navy" },
    { key: "customer", label: "Customer" },
    { key: "priority", label: "Priority", render: (r) => <Badge color={pc[r.priority]}>{r.priority}</Badge> },
    { key: "assignee", label: "Assignee" },
    { key: "status", label: "Status", render: (r) => <Badge color={sc[r.status]}>{r.status}</Badge> },
    { key: "updatedAt", label: "Updated", render: (r) => dateFmt(r.updatedAt) },
  ];
  return (
    <div>
      <PageHeader title="Support" icon={LifeBuoy} subtitle="Customer tickets" />
      <DataGrid columns={columns} rows={rows} loading={loading} exportName="tickets"
        searchKeys={["id", "subject", "customer"]}
        filters={[{ key: "status", label: "Status", options: opt(rows.map((r) => r.status)) }, { key: "priority", label: "Priority", options: opt(rows.map((r) => r.priority)) }]}
        rightSlot={<Button><Plus size={16} /> New Ticket</Button>} />
    </div>
  );
}
