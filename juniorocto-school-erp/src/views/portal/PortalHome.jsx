import { useNavigate } from "react-router-dom";
import { CalendarCheck, ReceiptText, Clock, Megaphone, ArrowRight, PencilLine, CalendarDays, Bus, BookOpen } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { usePortal } from "@/store/portal";

export default function PortalHome() {
  const { child } = usePortal();
  const nav = useNavigate();
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const circulars = [
    { title: "Annual Day rehearsals begin Monday — reach by 8:15 AM.", cat: "Event" },
    { title: "Term 1 fee due date extended to 20th.", cat: "Fees" },
  ];
  const homework = [
    { subject: "English", task: "Read 'The Thirsty Crow', answer Q1–3", due: "Tomorrow" },
    { subject: "Maths", task: "Worksheet: Numbers 1–50", due: "Fri" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-[26px] text-navy">{greet}! 🐙</h1>
          <p className="text-sm text-navy/50">{child ? <>Here's <b>{child.studentName}</b>'s day{child.klass ? ` · ${child.klass}${child.section ? "-" + child.section : ""}` : ""}.</> : "Welcome to your portal."}</p>
        </div>
        <p className="text-sm text-navy/50">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Attendance" value="94%" format="raw" sub="This term" icon={CalendarCheck} tone="sea" />
        <StatCard label="Fees Due" value="₹18,000" format="raw" sub="Term 1 · due 20th" icon={ReceiptText} tone="coral" />
        <StatCard label="Next Class" value="English" format="raw" sub="9:00 AM · Room 4" icon={Clock} tone="royal" />
        <StatCard label="Homework" value={homework.length} sub="pending" icon={PencilLine} tone="navy" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" pad={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Homework</h3><button onClick={() => nav("/portal/homework")} className="text-sm text-royal font-semibold hover:underline">View all</button></div>
          <div className="divide-y divide-navy/6">
            {homework.map((h, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <span className="h-9 w-9 rounded-xl bg-coral-100 text-coral-600 grid place-items-center"><PencilLine size={16} /></span>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy">{h.subject}</p><p className="text-xs text-navy/50 truncate">{h.task}</p></div>
                <Badge color="amber">{h.due}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card pad={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Circulars</h3><button onClick={() => nav("/portal/circulars")} className="text-sm text-royal font-semibold hover:underline">All</button></div>
          <div className="divide-y divide-navy/6">
            {circulars.map((c, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <span className="h-9 w-9 rounded-xl bg-royal-100 text-royal grid place-items-center shrink-0"><Megaphone size={16} /></span>
                <div className="flex-1 min-w-0"><p className="text-sm text-navy leading-snug">{c.title}</p><p className="text-[11px] text-navy/45 mt-0.5">{c.cat}</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[["Fees & Payments", "Pay dues, download receipts", ReceiptText, "/portal/fees", "coral"], ["Calendar", "Events, holidays, exams", CalendarDays, "/portal/calendar", "sea"], ["Transport", "Route, stops & live bus", Bus, "/portal/transport", "royal"]].map(([t, d, Icon, to, tone]) => {
          const map = { coral: "text-coral-600 bg-coral-100", royal: "text-royal bg-royal-100", sea: "text-sea bg-sea-100" };
          return (
            <button key={t} onClick={() => nav(to)} className="glass rounded-xl2 shadow-glass p-4 text-left flex items-center gap-3 hover:shadow-lg transition">
              <span className={`grid place-items-center h-11 w-11 rounded-2xl ${map[tone]}`}><Icon size={19} /></span>
              <div className="flex-1"><p className="font-semibold text-navy text-sm">{t}</p><p className="text-xs text-navy/50">{d}</p></div>
              <ArrowRight size={17} className="text-navy/30" />
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-navy/35 text-center pt-1">Snapshot figures are indicative until live data is connected for {child?.studentName || "your child"}.</p>
    </div>
  );
}
