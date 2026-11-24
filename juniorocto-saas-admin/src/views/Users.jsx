import { useEffect, useState } from "react";
import { Users as UsersIcon, UserPlus } from "lucide-react";
import { platformService } from "@/services/platform.service";
import { dateFmt } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import DataGrid from "@/components/ui/DataGrid";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
const opt = (arr) => [...new Set(arr)].map((v) => ({ value: v, label: v }));
const sc = { active: "emerald", invited: "amber", disabled: "coral" };
export default function Users() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { platformService.users().then((d) => { setRows(d); setLoading(false); }); }, []);
  const columns = [
    { key: "name", label: "User", render: (r) => <div className="flex items-center gap-2.5"><Avatar name={r.name} size={30} /><div><p className="font-medium text-navy">{r.name}</p><p className="text-xs text-navy/45">{r.email}</p></div></div> },
    { key: "role", label: "Role", render: (r) => <Badge color="blue">{r.role}</Badge> },
    { key: "lastActive", label: "Last active", render: (r) => r.lastActive === "—" ? "—" : dateFmt(r.lastActive) },
    { key: "status", label: "Status", render: (r) => <Badge color={sc[r.status]}>{r.status}</Badge> },
  ];
  return (
    <div>
      <PageHeader title="Users" icon={UsersIcon} subtitle="Platform team & access" />
      <DataGrid columns={columns} rows={rows} loading={loading} exportName="users"
        searchKeys={["name", "email"]}
        filters={[{ key: "role", label: "Role", options: opt(rows.map((r) => r.role)) }, { key: "status", label: "Status", options: opt(rows.map((r) => r.status)) }]}
        rightSlot={<Button><UserPlus size={16} /> Invite User</Button>} />
    </div>
  );
}
