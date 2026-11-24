import { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, Cake, Hash, GraduationCap, ShieldAlert } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Avatar from "@/components/ui/Avatar";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { usePortal } from "@/store/portal";

export default function PortalStudentInfo() {
  const { child } = usePortal();
  const [rec, setRec] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!child) return;
    setLoading(true);
    resourceService("students").list({ studentId: child.studentId })
      .then((r) => setRec(normList(r).find((s) => s.id === child.studentId) || normList(r)[0] || null))
      .catch(() => setRec(null)).finally(() => setLoading(false));
  }, [child?.studentId]);

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  const s = rec || {};
  const info = [
    [Hash, "Admission No", s.admissionNo], [GraduationCap, "Class", `${s.klass || "—"}${s.section ? `-${s.section}` : ""}`],
    [Cake, "Date of birth", s.dob ? new Date(s.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"],
    [User, "Gender", s.gender], [MapPin, "Transport route", s.route || "—"],
  ];
  const contacts = [
    [User, "Guardian", s.parentName || child?.parentName], [Phone, "Phone", s.phone], [Mail, "Email", s.parentEmail], [ShieldAlert, "Relation", s.relation || child?.relationship],
  ];
  return (
    <div>
      <PageHeader title="Student Info" icon={User} subtitle="Your child's record on file" />
      <div className="glass rounded-xl2 shadow-glass p-5 mb-4 flex items-center gap-4">
        <Avatar name={s.name || child?.studentName} size={64} />
        <div className="flex-1"><h2 className="font-display text-xl text-navy">{s.name || child?.studentName}</h2><p className="text-sm text-navy/55">{s.klass || child?.klass}{s.section ? `-${s.section}` : ""}</p></div>
        <Badge color={s.status === "Active" || !s.status ? "green" : "gray"}>{s.status || "Active"}</Badge>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card><h3 className="font-display text-navy mb-3">Details</h3><InfoRows rows={info} /></Card>
        <Card><h3 className="font-display text-navy mb-3">Contact & emergency</h3><InfoRows rows={contacts} /></Card>
      </div>
      <p className="text-[11px] text-navy/40 mt-3">To update any detail, please contact the school office.</p>
    </div>
  );
}
function InfoRows({ rows }) {
  return <div className="divide-y divide-navy/6">{rows.map(([Icon, label, val]) => (
    <div key={label} className="flex items-center gap-3 py-2.5"><span className="h-8 w-8 rounded-xl bg-royal-100 text-royal grid place-items-center"><Icon size={15} /></span><span className="text-sm text-navy/50 w-32">{label}</span><span className="text-sm font-medium text-navy">{val || "—"}</span></div>
  ))}</div>;
}
