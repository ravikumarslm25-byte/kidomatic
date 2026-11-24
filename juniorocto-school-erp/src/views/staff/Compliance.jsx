import { useState, useEffect, useMemo } from "react";
import { ShieldCheck, Download, Printer, AlertTriangle, Users, FileWarning, HeartPulse, GraduationCap } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useBranding } from "@/store/branding";
import { compliance, expiringDocs, isTeaching, truthy, RAG_COLOR, rag } from "./staffKit";

const csv = (name, header, rowsArr) => {
  const body = rowsArr.map((r) => r.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([header.join(",") + "\n" + body], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${name}.csv`; a.click();
};

export default function Compliance() {
  const b = useBranding();
  const [staff, setStaff] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const [ss, st] = await Promise.all([resourceService("staff").list({}), resourceService("students").list({})]);
    setStaff(normList(ss)); setStudents(normList(st)); setLoading(false);
  })(); }, []);

  const c = useMemo(() => compliance(staff, students), [staff, students]);
  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;

  const ptrNorm = 35; // RTE upper-primary; primary 30
  const cards = [
    { icon: ShieldCheck, label: "Police verification", bad: c.noPolice.length, total: c.active.length, note: `${c.noPolice.length} of ${c.active.length} pending` },
    { icon: GraduationCap, label: "TET compliance (teaching)", bad: c.tetGap.length, total: c.teaching.length, note: `${c.tetGap.length} of ${c.teaching.length} not qualified` },
    { icon: GraduationCap, label: "B.Ed / D.El.Ed (teaching)", bad: c.bedGap.length, total: c.teaching.length, note: `${c.bedGap.length} of ${c.teaching.length} missing` },
    { icon: HeartPulse, label: "Medical fitness", bad: c.noMedical.length, total: c.active.length, note: `${c.noMedical.length} of ${c.active.length} pending` },
    { icon: FileWarning, label: "Documents expiring (90d)", bad: c.exp.length, total: c.active.length, note: `${c.exp.length} documents` },
    { icon: Users, label: "Teacher–Pupil Ratio", bad: c.ptr > ptrNorm ? 1 : 0, total: 1, note: `1 : ${c.ptr} (norm 1 : ${ptrNorm})` },
  ];

  // Inspection Pack exports
  const staffList = () => csv("staff-strength-register", ["Emp ID", "Name", "Category", "Designation", "Wing", "Type", "DOJ", "Status"],
    c.active.map((s) => [s.empId, s.name, s.category, s.designation || s.role, s.wing, s.employmentType, s.doj, s.status]));
  const qualReg = () => csv("qualification-tet-register", ["Emp ID", "Name", "Qualification", "B.Ed/D.El.Ed", "TET status", "TET expiry", "Subjects"],
    c.teaching.map((s) => [s.empId, s.name, s.highestQualification, truthy(s.hasBEd) ? "Yes" : "No", s.tetStatus, s.tetExpiry, Array.isArray(s.subjects) ? s.subjects.join("; ") : s.subjects]));
  const verifyReg = () => csv("police-medical-register", ["Emp ID", "Name", "Category", "Police verified", "Verified on", "Medical fitness", "Outsourced", "Vendor"],
    c.active.map((s) => [s.empId, s.name, s.category, truthy(s.policeVerified) ? "Yes" : "No", s.policeVerifyDate, truthy(s.medicalFitness) ? "Yes" : "No", truthy(s.isOutsourced) ? "Yes" : "No", s.vendor]));
  const expReg = () => csv("expiring-documents", ["Staff", "Emp ID", "Document", "Number", "Expiry", "Days left"],
    c.exp.map((e) => [e.staff, e.empId, e.type, e.number, e.expiryDate, e.days]));

  return (
    <div>
      <PageHeader title="Compliance & Inspection" icon={ShieldCheck} subtitle="Inspection-ready — CEO / DEO / affiliation registers in one click"
        actions={<div className="flex gap-2"><Button variant="outline" onClick={() => window.print()}><Printer size={15} /> Print pack</Button></div>} />

      {/* RAG dashboard */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cards.map((card) => { const status = rag(card.bad, card.total); return (
          <div key={card.label} className="glass rounded-xl2 shadow-glass p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl grid place-items-center text-white shrink-0" style={{ background: RAG_COLOR[status] }}><card.icon size={20} /></div>
            <div className="flex-1"><p className="text-sm font-semibold text-navy">{card.label}</p><p className="text-xs text-navy/50">{card.note}</p></div>
            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full" style={{ background: RAG_COLOR[status] + "22", color: RAG_COLOR[status] }}>{status}</span>
          </div>
        ); })}
      </div>

      {/* Inspection Pack */}
      <div className="glass rounded-xl2 shadow-glass p-5 mb-6">
        <h3 className="font-display text-navy mb-1">Inspection Pack</h3>
        <p className="text-sm text-navy/50 mb-4">Generate the statutory staff registers an inspecting officer asks for. Each downloads as CSV.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <PackBtn onClick={staffList} title="Staff Strength Register" desc="All active staff, designation, wing" />
          <PackBtn onClick={qualReg} title="Qualification & TET Register" desc="Teaching staff, B.Ed, TET" />
          <PackBtn onClick={verifyReg} title="Police & Medical Register" desc="Verification status (incl. outsourced)" />
          <PackBtn onClick={expReg} title="Expiring Documents" desc="Next 90 days" />
        </div>
      </div>

      {/* Expiry radar */}
      <div className="glass rounded-xl2 shadow-glass overflow-hidden">
        <div className="px-5 py-3 border-b border-navy/8 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-600" /><h3 className="font-display text-navy">Expiry radar — next 90 days</h3></div>
        {c.exp.length === 0 ? <p className="px-5 py-8 text-center text-navy/40 text-sm">Nothing expiring in the next 90 days. 🎉</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase text-navy/45 border-b border-navy/8"><th className="px-5 py-2.5">Staff</th><th className="px-5 py-2.5">Document</th><th className="px-5 py-2.5">Expiry</th><th className="px-5 py-2.5">Status</th></tr></thead>
            <tbody>
              {c.exp.map((e, i) => { const st = e.days < 0 ? "red" : e.days <= 30 ? "red" : "amber"; return (
                <tr key={i} className="border-b border-navy/5"><td className="px-5 py-2.5 text-navy font-medium">{e.staff} <span className="text-navy/40 text-xs font-mono">{e.empId}</span></td><td className="px-5 py-2.5 text-navy/70">{e.type}</td><td className="px-5 py-2.5 text-navy/60">{e.expiryDate}</td>
                  <td className="px-5 py-2.5"><span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: RAG_COLOR[st] + "22", color: RAG_COLOR[st] }}>{e.days < 0 ? `Expired ${-e.days}d ago` : `${e.days}d left`}</span></td></tr>
              ); })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
const PackBtn = ({ onClick, title, desc }) => (
  <button onClick={onClick} className="text-left rounded-xl border border-navy/10 bg-white/50 hover:border-royal/40 p-3 transition">
    <div className="flex items-center gap-2 text-navy font-semibold text-sm"><Download size={15} className="text-royal" /> {title}</div>
    <p className="text-[11px] text-navy/45 mt-1">{desc}</p>
  </button>
);
