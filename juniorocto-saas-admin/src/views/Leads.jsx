import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { platformService } from "@/services/platform.service";
import { inr, dateFmt } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import DataGrid from "@/components/ui/DataGrid";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";

const stageColor = { New: "amber", Contacted: "blue", Qualified: "blue", Proposal: "amber", Won: "emerald", Lost: "coral" };
const opt = (arr) => [...new Set(arr)].map((v) => ({ value: v, label: v }));

export default function Leads() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { platformService.leads().then((d) => { setRows(d); setLoading(false); }); }, []);
  const columns = [
    { key: "name", label: "Lead", render: (r) => <div className="flex items-center gap-2.5"><Avatar name={r.name} size={30} /><div><p className="font-medium text-navy">{r.name}</p><p className="text-xs text-navy/45">{r.org}</p></div></div> },
    { key: "source", label: "Source" },
    { key: "owner", label: "Owner" },
    { key: "value", label: "Value", align: "right", render: (r) => <span className="font-mono">{inr(r.value)}</span>, exportValue: (r) => r.value },
    { key: "stage", label: "Stage", render: (r) => <Badge color={stageColor[r.stage]}>{r.stage}</Badge> },
    { key: "createdAt", label: "Created", render: (r) => dateFmt(r.createdAt) },
  ];
  return (
    <div>
      <PageHeader title="Leads" icon={Target} subtitle="Your sales pipeline" />
      <DataGrid columns={columns} rows={rows} loading={loading} exportName="leads"
        searchKeys={["name", "org", "email", "phone"]}
        filters={[{ key: "stage", label: "Stage", options: opt(rows.map((r) => r.stage)) }, { key: "source", label: "Source", options: opt(rows.map((r) => r.source)) }, { key: "owner", label: "Owner", options: opt(rows.map((r) => r.owner)) }]}
        rightSlot={<Button><Plus size={16} /> New Lead</Button>} />
    </div>
  );
}
