import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, LayoutGrid, BookOpen, Clock, CalendarDays, FileText, Briefcase, UserCog, ReceiptText, ListTree, Landmark, Truck, BadgePercent, Boxes, Mail, Building2, ChevronRight, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useAuth } from "@/store/auth";

// Every master / configuration area, grouped. `count` names a resource to tally.
const SECTIONS = [
  { group: "Academic", items: [
    { label: "Classes & Sections", to: "/academics/classes", icon: LayoutGrid, desc: "Grades, sections & class teachers", count: "classes" },
    { label: "Subjects", to: "/academics/subjects", icon: BookOpen, desc: "Subject master across classes", count: "subjects" },
    { label: "Timing Master", to: "/academics/timing", icon: Clock, desc: "Period timings / bell schedule blocks" },
    { label: "Periods & Bells", to: "/setup/periods", icon: CalendarDays, desc: "Named periods & bell times", count: "periods" },
    { label: "Grading Scale", to: "/setup/grading", icon: FileText, desc: "Grade bands & GPA mapping", count: "grading" },
  ]},
  { group: "People & HR", items: [
    { label: "Departments", to: "/setup/departments", icon: Briefcase, desc: "Staff departments", count: "departments" },
    { label: "Designations", to: "/setup/designations", icon: UserCog, desc: "Roles & designations", count: "designations" },
  ]},
  { group: "Finance", items: [
    { label: "Fee Heads", to: "/setup/fee-heads", icon: ReceiptText, desc: "Fee components / heads", count: "feeHeads" },
    { label: "Chart of Accounts", to: "/setup/account-heads", icon: ListTree, desc: "Income & expense heads", count: "accountHeads" },
    { label: "Cash & Bank", to: "/setup/cash-accounts", icon: Landmark, desc: "Cash & bank accounts", count: "cashAccounts" },
    { label: "Vendors", to: "/setup/vendors", icon: Truck, desc: "Supplier master", count: "vendors" },
    { label: "Concession Types", to: "/fees/concessions", icon: BadgePercent, desc: "Fee concession / waiver types", count: "concessions" },
  ]},
  { group: "Inventory", items: [
    { label: "Categories & Sub-categories", to: "/inventory", icon: Boxes, desc: "Inventory category tree", count: "invCategories" },
  ]},
  { group: "Communication", items: [
    { label: "Message Templates", to: "/setup/message-templates", icon: Mail, desc: "Reusable notice / circular templates", count: "commTemplates" },
  ]},
  { group: "System", items: [
    { label: "School Profile & Settings", to: "/settings", icon: Building2, desc: "Branding, academic year & preferences" },
  ]},
];

export default function SetupHub() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const names = [...new Set(SECTIONS.flatMap((s) => s.items.map((i) => i.count).filter(Boolean)))];
    Promise.all(names.map((n) => resourceService(n).list({}).then((r) => [n, normList(r).length]).catch(() => [n, null])))
      .then((pairs) => setCounts(Object.fromEntries(pairs)));
  }, []);

  const total = SECTIONS.reduce((a, s) => a + s.items.length, 0);

  return (
    <div>
      <PageHeader title="Setup & Masters" icon={Settings} subtitle={`All configuration in one place · ${total} master areas · admin-only`} />

      <div className="rounded-xl2 border border-royal/20 bg-royal-50/60 p-4 mb-5 flex items-center gap-3">
        <ShieldCheck size={20} className="text-royal" />
        <p className="text-sm text-navy/70">You're signed in as <b>{user?.name}</b> ({user?.role}). These masters feed every module — changes here apply school-wide, so edit with care.</p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((sec) => (
          <div key={sec.group}>
            <p className="text-xs font-bold uppercase tracking-wide text-navy/45 mb-2">{sec.group}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sec.items.map((it) => (
                <button key={it.to} onClick={() => nav(it.to)} className="glass rounded-xl2 shadow-glass p-4 text-left hover:shadow-lg transition flex items-start gap-3 group">
                  <span className="h-10 w-10 rounded-xl bg-royal-100 grid place-items-center text-royal shrink-0"><it.icon size={18} /></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><p className="font-semibold text-navy">{it.label}</p><ChevronRight size={16} className="text-navy/25 group-hover:text-royal" /></div>
                    <p className="text-[12px] text-navy/50 mt-0.5">{it.desc}</p>
                    {it.count && counts[it.count] != null && <p className="text-[11px] text-navy/40 mt-1">{counts[it.count]} record{counts[it.count] === 1 ? "" : "s"}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
