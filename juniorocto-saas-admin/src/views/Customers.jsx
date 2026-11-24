import { useEffect, useMemo, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { platformService } from "@/services/platform.service";
import { PLANS } from "@/config/plans";
import PageHeader from "@/components/ui/PageHeader";
import DataGrid from "@/components/ui/DataGrid";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

export default function Customers() {
  const [schools, setSchools] = useState([]); const [resellers, setResellers] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { const [sc, r] = await Promise.all([platformService.schools(), platformService.resellers()]); setResellers(r); setSchools(sc.map((s) => ({ ...s, resellerName: r.find((x) => x.id === s.resellerId)?.name || "Direct" }))); setLoading(false); })(); }, []);

  const columns = [
    { key: "name", label: "School", render: (r) => <div className="flex items-center gap-2.5"><Avatar name={r.name} size={30} /><span className="font-medium text-navy">{r.name}</span></div> },
    { key: "board", label: "Board" },
    { key: "resellerName", label: "Reseller", render: (r) => r.resellerName === "Direct" ? <span className="text-navy/40">Direct</span> : r.resellerName },
    { key: "planKey", label: "Plan", render: (r) => <Badge color="blue">{PLANS[r.planKey]?.name || r.planKey}</Badge>, exportValue: (r) => PLANS[r.planKey]?.name },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ];
  const resellerOptions = useMemo(() => [{ value: "Direct", label: "Direct" }, ...resellers.map((r) => ({ value: r.name, label: r.name }))], [resellers]);

  return (
    <div>
      <PageHeader title="Customers" icon={Building2} subtitle="Every school on the platform" />
      <DataGrid columns={columns} rows={schools} loading={loading} exportName="customers"
        searchKeys={["name", "board"]}
        filters={[{ key: "resellerName", label: "Reseller", options: resellerOptions }, { key: "status", label: "Status", options: [{ value: "active", label: "active" }, { value: "suspended", label: "suspended" }] }]}
        rightSlot={<Button><Plus size={16} /> New School</Button>} />
    </div>
  );
}
