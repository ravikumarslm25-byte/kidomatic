import { CalendarCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { useToast } from "@/store/toast";

const REQ = [
  { name: "Sneha Das", type: "Casual Leave", days: "8–9 Jul", reason: "Family function", status: "Pending" },
  { name: "Arjun Nair", type: "Sick Leave", days: "5 Jul", reason: "Fever", status: "Approved" },
  { name: "Meera Krishnan", type: "WFH", days: "10 Jul", reason: "Report work", status: "Pending" },
];

export default function StaffLeave() {
  const toast = useToast();
  return (
    <div>
      <PageHeader title="Leave & Attendance" icon={CalendarCheck} subtitle="Staff leave requests and approvals" />
      <Card pad={false}>
        <div className="divide-y divide-navy/6">
          {REQ.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <Avatar name={r.name} size={36} />
              <div className="flex-1"><p className="font-medium text-navy text-sm">{r.name} <span className="text-navy/40 font-normal">· {r.type}</span></p><p className="text-xs text-navy/45">{r.days} — {r.reason}</p></div>
              {r.status === "Pending" ? (
                <div className="flex gap-1.5">
                  <Button size="sm" variant="soft" onClick={() => toast.success(`${r.name}'s leave approved`)}>Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => toast.success(`${r.name}'s leave declined`)}>Decline</Button>
                </div>
              ) : <Badge>{r.status}</Badge>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
