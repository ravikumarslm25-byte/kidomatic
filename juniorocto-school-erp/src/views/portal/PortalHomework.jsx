import { useState, useEffect, useMemo } from "react";
import { PencilLine, CalendarDays } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { usePortal } from "@/store/portal";

const dt = (v) => (v ? new Date(v).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" }) : "");
export default function PortalHomework() {
  const { child } = usePortal();
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!child) return;
    setLoading(true);
    resourceService("homework").list({ studentId: child.studentId }).then((r) => setRows(normList(r))).catch(() => setRows([])).finally(() => setLoading(false));
  }, [child?.studentId]);

  const sorted = useMemo(() => [...rows].sort((a, b) => (b.dueDate || "").localeCompare(a.dueDate || "")), [rows]);
  const overdue = (d) => d && new Date(d) < new Date(new Date().toDateString());

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  return (
    <div>
      <PageHeader title="Homework" icon={PencilLine} subtitle={`Assignments for ${child?.klass || "your child's class"}`} />
      <div className="space-y-3">
        {sorted.map((h) => (
          <Card key={h.id} className="flex items-start gap-3">
            <span className="h-10 w-10 rounded-xl bg-coral-100 text-coral-600 grid place-items-center shrink-0"><PencilLine size={18} /></span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap"><p className="font-semibold text-navy">{h.subject || "Homework"}</p>{h.title && <span className="text-sm text-navy/60">· {h.title}</span>}</div>
              {h.description && <p className="text-sm text-navy/60 mt-1">{h.description}</p>}
              <div className="flex items-center gap-2 mt-2 text-xs text-navy/45"><CalendarDays size={13} /> Due {dt(h.dueDate)}</div>
            </div>
            {h.dueDate && <Badge color={overdue(h.dueDate) ? "red" : "amber"}>{overdue(h.dueDate) ? "Overdue" : "Due " + dt(h.dueDate)}</Badge>}
          </Card>
        ))}
        {sorted.length === 0 && <Card className="py-14 text-center text-navy/40">No homework assigned right now. 🎉</Card>}
      </div>
    </div>
  );
}
