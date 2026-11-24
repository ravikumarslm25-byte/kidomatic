import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, IndianRupee, CalendarCheck, UserPlus, TrendingUp, Sparkles, ArrowRight, AlertTriangle, BookOpen, PencilLine, Megaphone, CalendarDays, ReceiptText, Wallet, ClipboardList, GraduationCap } from "lucide-react";
import { useList } from "@/controllers/useList";
import { getSummary } from "@/services/dashboard";
import { inr, dateFmt } from "@/lib/format";
import { useBranding } from "@/store/branding";
import { useAuth } from "@/store/auth";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { CollectionArea, AdmissionsBar, AttendanceDonut } from "@/components/charts/Charts";

const collection = [{ m: "Feb", v: 720000 }, { m: "Mar", v: 810000 }, { m: "Apr", v: 640000 }, { m: "May", v: 905000 }, { m: "Jun", v: 1120000 }, { m: "Jul", v: 986000 }];
const admissions = [{ m: "Feb", v: 18 }, { m: "Mar", v: 24 }, { m: "Apr", v: 31 }, { m: "May", v: 27 }, { m: "Jun", v: 42 }, { m: "Jul", v: 12 }];

function persona(role = "") {
  const r = role.toLowerCase();
  if (/admin|principal|super|owner|director|head|vice/.test(r)) return "admin";
  if (/account|finance|cashier|bursar/.test(r)) return "accountant";
  if (/teacher|faculty|tutor|educator|mentor/.test(r)) return "teacher";
  return "staff";
}
const firstName = (n = "") => n.split(" ")[0] || "there";
const hour = new Date().getHours();
const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

export default function Dashboard() {
  const { user } = useAuth();
  const p = persona(user?.role);
  const Head = (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h1 className="font-display text-[26px] text-navy">{greet}, {firstName(user?.name)} 🐙</h1>
        <p className="text-sm text-navy/50">{p === "admin" ? "Your school at a glance." : p === "teacher" ? "Here's your teaching day." : p === "accountant" ? "Today's money movements." : "Here's what's happening today."}</p>
      </div>
      <p className="text-sm text-navy/50">{dateFmt(new Date())}</p>
    </div>
  );
  return (
    <div className="space-y-5">
      {Head}
      {p === "admin" && <AdminDash />}
      {p === "teacher" && <TeacherDash user={user} />}
      {p === "accountant" && <AccountantDash />}
      {p === "staff" && <StaffDash user={user} />}
    </div>
  );
}

function AdminDash() {
  const b = useBranding();
  const { rows: enquiriesAll } = useList("enquiries");
  const { rows: invoicesAll } = useList("invoices");
  const [sum, setSum] = useState(null);
  useEffect(() => { getSummary().then(setSum).catch(() => {}); }, []);
  const enquiries = enquiriesAll.slice(0, 5);
  const dues = invoicesAll.filter((i) => i.status !== "Paid").slice(0, 4);
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={sum?.totalStudents ?? 1240} sub="Nursery – Grade 12" icon={Users} tone="royal" trend={3} />
        <StatCard label="Fees Collected (MTD)" value={inr(sum?.feesCollectedMTD ?? 986000)} format="raw" icon={IndianRupee} tone="coral" trend={8} />
        <StatCard label="Outstanding Fees" value={inr(sum?.outstanding ?? 342000)} format="raw" icon={AlertTriangle} tone="sea" trend={-2} />
        <StatCard label="New Enquiries" value={sum?.newEnquiries ?? 12} sub={`${sum?.admitted ?? 1} admitted`} icon={UserPlus} tone="navy" trend={12} />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2"><div><h3 className="font-display text-navy text-lg">Fee Collection</h3><p className="text-xs text-navy/45">Last 6 months</p></div><span className="text-emerald-500 text-sm font-semibold flex items-center gap-1"><TrendingUp size={15} /> ₹9.86L this month</span></div>
          <CollectionArea data={collection} />
        </Card>
        <Card><h3 className="font-display text-navy text-lg mb-1">Attendance</h3><p className="text-xs text-navy/45 mb-1">Class-wide, today</p><AttendanceDonut present={88} /></Card>
      </div>
      <AIStrip />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card pad={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Recent Enquiries</h3><Link to="/admissions/enquiries" className="text-sm text-royal font-semibold hover:underline">View all</Link></div>
          <div className="divide-y divide-navy/6">{enquiries.map((e) => (<div key={e.id} className="flex items-center gap-3 px-5 py-3"><Avatar name={e.name} size={34} /><div className="flex-1 min-w-0"><p className="font-medium text-navy text-sm truncate">{e.name}</p><p className="text-xs text-navy/45">{e.klass} · {e.source}</p></div><Badge>{e.status}</Badge></div>))}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-2"><div><h3 className="font-display text-navy text-lg">Admissions</h3><p className="text-xs text-navy/45">Confirmed per month</p></div><Link to="/admissions/funnel" className="text-sm text-royal font-semibold hover:underline">Funnel</Link></div>
          <AdmissionsBar data={admissions} />
        </Card>
      </div>
      <Card pad={false}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Outstanding Fees</h3><Link to="/fees/invoices" className="text-sm text-royal font-semibold hover:underline">All invoices</Link></div>
        <div className="divide-y divide-navy/6">{dues.map((d) => (<div key={d.id} className="flex items-center gap-3 px-5 py-3"><Avatar name={d.student} size={34} /><div className="flex-1 min-w-0"><p className="font-medium text-navy text-sm">{d.student}</p><p className="text-xs text-navy/45 font-mono">{d.invoiceNo} · due {dateFmt(d.dueDate)}</p></div><span className="font-mono font-semibold text-navy">{inr(d.amount)}</span><Badge>{d.status}</Badge></div>))}</div>
      </Card>
    </>
  );
}

function TeacherDash({ user }) {
  const { rows: homework } = useList("homework");
  const { rows: comms } = useList("communications");
  const { rows: events } = useList("events");
  const myHw = homework.slice(0, 5);
  const notices = comms.filter((c) => c.status !== "Draft").slice(0, 4);
  const upcoming = events.filter((e) => new Date(e.start || e.date || 0) >= new Date(Date.now() - 864e5)).slice(0, 5);
  const today = ["Grade 3-B · English · 9:00", "Grade 4-A · English · 10:15", "Grade 3-B · Library · 11:30", "Grade 5-C · English · 1:00"];
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Students" value={42} icon={GraduationCap} tone="royal" />
        <StatCard label="Classes Today" value={today.length} icon={BookOpen} tone="sea" />
        <StatCard label="Homework to Grade" value={myHw.length} icon={PencilLine} tone="coral" />
        <StatCard label="My Class Attendance" value="91%" format="raw" icon={CalendarCheck} tone="navy" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" pad={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Today's Schedule</h3><Link to="/academics/timetable" className="text-sm text-royal font-semibold hover:underline">Timetable</Link></div>
          <div className="divide-y divide-navy/6">{today.map((t, i) => (<div key={i} className="flex items-center gap-3 px-5 py-3"><span className="h-8 w-8 rounded-xl bg-royal-100 text-royal grid place-items-center text-xs font-bold">{i + 1}</span><p className="text-sm text-navy/80">{t}</p></div>))}</div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2"><CalendarCheck size={18} className="text-royal" /><h3 className="font-display text-navy text-lg">Attendance</h3></div>
          <p className="text-xs text-navy/45 mb-1">My class, today</p><AttendanceDonut present={91} />
          <Link to="/attendance/students" className="mt-2 inline-flex items-center gap-1 text-royal font-semibold text-sm hover:underline">Mark attendance <ArrowRight size={14} /></Link>
        </Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card pad={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Homework to Grade</h3><Link to="/academics/homework" className="text-sm text-royal font-semibold hover:underline">All</Link></div>
          <div className="divide-y divide-navy/6">{myHw.length ? myHw.map((h) => (<div key={h.id} className="flex items-center gap-3 px-5 py-3"><span className="h-8 w-8 rounded-xl bg-coral-100 text-coral-600 grid place-items-center"><PencilLine size={15} /></span><div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy truncate">{h.title || h.subject}</p><p className="text-xs text-navy/45">{h.klass || h.class || ""} {h.dueDate ? `· due ${dateFmt(h.dueDate)}` : ""}</p></div></div>)) : <p className="px-5 py-8 text-center text-navy/40 text-sm">Nothing pending 🎉</p>}</div>
        </Card>
        <Card pad={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Notices & Circulars</h3><Link to="/communication/announcements" className="text-sm text-royal font-semibold hover:underline">All</Link></div>
          <div className="divide-y divide-navy/6">{notices.length ? notices.map((c) => (<div key={c.id} className="flex items-center gap-3 px-5 py-3"><span className="h-8 w-8 rounded-xl bg-royal-100 text-royal grid place-items-center"><Megaphone size={15} /></span><div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy truncate">{c.title}</p><p className="text-xs text-navy/45">{c.category || c.type}</p></div></div>)) : <p className="px-5 py-8 text-center text-navy/40 text-sm">No notices.</p>}</div>
        </Card>
      </div>
    </>
  );
}

function AccountantDash() {
  const { rows: invoices } = useList("invoices");
  const { rows: payments } = useList("payments");
  const { rows: bills } = useList("vendorBills");
  const paid = invoices.filter((i) => i.status === "Paid");
  const unpaid = invoices.filter((i) => i.status !== "Paid");
  const outstanding = unpaid.reduce((a, i) => a + (+i.amount || 0), 0);
  const collected = paid.reduce((a, i) => a + (+i.amount || 0), 0);
  const recentPays = [...payments].slice(-5).reverse();
  const dueBills = bills.filter((b) => b.status !== "Paid").slice(0, 5);
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Collected" value={inr(collected || 986000)} format="raw" icon={IndianRupee} tone="coral" trend={8} />
        <StatCard label="Outstanding" value={inr(outstanding || 342000)} format="raw" icon={AlertTriangle} tone="sea" trend={-2} />
        <StatCard label="Pending Invoices" value={unpaid.length} icon={ReceiptText} tone="royal" />
        <StatCard label="Vendor Bills Due" value={dueBills.length} icon={Wallet} tone="navy" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2"><div className="flex items-center justify-between mb-2"><h3 className="font-display text-navy text-lg">Fee Collection</h3><Link to="/accounts/reports" className="text-sm text-royal font-semibold hover:underline">Reports</Link></div><CollectionArea data={collection} /></Card>
        <Card pad={false}>
          <div className="px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Recent Payments</h3></div>
          <div className="divide-y divide-navy/6">{recentPays.length ? recentPays.map((pmt, i) => (<div key={pmt.id || i} className="flex items-center gap-3 px-5 py-3"><span className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center"><IndianRupee size={15} /></span><div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy truncate">{pmt.student || pmt.payerName || "Payment"}</p><p className="text-xs text-navy/45">{pmt.mode || ""} {pmt.date ? `· ${dateFmt(pmt.date)}` : ""}</p></div><span className="font-mono text-sm font-semibold text-navy">{inr(+pmt.amount || 0)}</span></div>)) : <p className="px-5 py-8 text-center text-navy/40 text-sm">No payments recorded.</p>}</div>
        </Card>
      </div>
      <Card pad={false}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Vendor Bills Due</h3><Link to="/accounts/bills" className="text-sm text-royal font-semibold hover:underline">All bills</Link></div>
        <div className="divide-y divide-navy/6">{dueBills.length ? dueBills.map((bl) => (<div key={bl.id} className="flex items-center gap-3 px-5 py-3"><span className="h-8 w-8 rounded-xl bg-coral-100 text-coral-600 grid place-items-center"><Wallet size={15} /></span><div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy truncate">{bl.vendorName || bl.vendor || "Vendor"}</p><p className="text-xs text-navy/45 font-mono">{bl.billNo || ""} {bl.dueDate ? `· due ${dateFmt(bl.dueDate)}` : ""}</p></div><span className="font-mono text-sm font-semibold text-navy">{inr(+bl.amount || 0)}</span></div>)) : <p className="px-5 py-8 text-center text-navy/40 text-sm">No bills due.</p>}</div>
      </Card>
    </>
  );
}

function StaffDash({ user }) {
  const { rows: comms } = useList("communications");
  const { rows: events } = useList("events");
  const notices = comms.filter((c) => c.status !== "Draft").slice(0, 5);
  const upcoming = events.filter((e) => new Date(e.start || e.date || 0) >= new Date(Date.now() - 864e5)).slice(0, 6);
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Attendance" value="96%" format="raw" icon={CalendarCheck} tone="royal" />
        <StatCard label="Notices" value={notices.length} icon={Megaphone} tone="sea" />
        <StatCard label="Upcoming Events" value={upcoming.length} icon={CalendarDays} tone="coral" />
        <StatCard label="Tasks" value={3} icon={ClipboardList} tone="navy" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card pad={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Notices & Circulars</h3><Link to="/communication/announcements" className="text-sm text-royal font-semibold hover:underline">All</Link></div>
          <div className="divide-y divide-navy/6">{notices.length ? notices.map((c) => (<div key={c.id} className="flex items-center gap-3 px-5 py-3"><span className="h-8 w-8 rounded-xl bg-royal-100 text-royal grid place-items-center"><Megaphone size={15} /></span><div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy truncate">{c.title}</p><p className="text-xs text-navy/45">{c.category || c.type}</p></div></div>)) : <p className="px-5 py-8 text-center text-navy/40 text-sm">No notices.</p>}</div>
        </Card>
        <Card pad={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Upcoming Events</h3><Link to="/calendar" className="text-sm text-royal font-semibold hover:underline">Calendar</Link></div>
          <div className="divide-y divide-navy/6">{upcoming.length ? upcoming.map((e) => (<div key={e.id} className="flex items-center gap-3 px-5 py-3"><span className="h-8 w-8 rounded-xl bg-sea-100 text-sea grid place-items-center"><CalendarDays size={15} /></span><div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy truncate">{e.title}</p><p className="text-xs text-navy/45">{e.category || ""} {e.start ? `· ${dateFmt(e.start)}` : ""}</p></div></div>)) : <p className="px-5 py-8 text-center text-navy/40 text-sm">Nothing scheduled.</p>}</div>
        </Card>
      </div>
    </>
  );
}

function AIStrip() {
  return (
    <div className="glass rounded-xl2 shadow-glass p-5 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(242,106,53,.18), transparent 70%)" }} />
      <div className="flex items-start gap-3 relative">
        <div className="grid place-items-center h-11 w-11 rounded-2xl btn-grad text-white shrink-0"><Sparkles size={20} /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2"><h3 className="font-display text-navy text-lg">AI Insights</h3><Badge color="blue">Live</Badge></div>
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            <Insight icon={AlertTriangle} tone="coral" text="7 students in Grade 5 show a 3-week dip in attendance — possible dropout risk." />
            <Insight icon={IndianRupee} tone="royal" text="₹1.4L in fees likely to slip past due date. Nudge 9 parents now." />
            <Insight icon={Sparkles} tone="sea" text="LKG-A: 4 children emerging early on fine-motor. Suggested activities ready." />
          </div>
        </div>
        <Link to="/ai" className="hidden sm:inline-flex items-center gap-1 text-royal font-semibold text-sm hover:underline shrink-0">Open AI Center <ArrowRight size={15} /></Link>
      </div>
    </div>
  );
}
function Insight({ icon: Icon, tone, text }) {
  const map = { coral: "text-coral-600 bg-coral-100", royal: "text-royal bg-royal-100", sea: "text-sea bg-sea-100" };
  return (<div className="flex gap-2.5 rounded-2xl bg-white/50 border border-white/60 p-3"><div className={`grid place-items-center h-8 w-8 rounded-xl shrink-0 ${map[tone]}`}><Icon size={16} /></div><p className="text-[13px] text-navy/75 leading-snug">{text}</p></div>);
}
