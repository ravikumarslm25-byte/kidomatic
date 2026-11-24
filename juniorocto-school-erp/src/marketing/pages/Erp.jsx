import { useSeo } from "../useSeo";
import { Eyebrow, H2, Lead, CTA, BrowserFrame, Section } from "./ui";
import PhoneMock from "../PhoneMock";
import Wave from "../Wave";
import dash from "../assets/erp_dashboard.png";
import attendance from "../assets/erp_attendance.png";
import fees from "../assets/erp_fees.png";

const FEATURES = [
  ["Admissions", "Enquiry → visit → admission funnel, with follow-ups and conversion tracking."],
  ["Fees & Accounts", "Collect fees, auto-receipts, dues, day-book and financial reports."],
  ["Attendance", "Student and staff attendance, class-wise, with parent notifications."],
  ["Academics", "Timetable, classes, subjects, report cards and development tracking."],
  ["Staff & Payroll", "Staff records, leave, and monthly payroll runs."],
  ["Transport", "Routes, stops and live bus tracking for peace of mind."],
  ["Communication", "Announcements, messages and the parent app — all in sync."],
  ["AI Insights", "Early-warning nudges on attendance dips, fee slippage and learning gaps."],
];

export default function Erp() {
  useSeo({ title: "KidoMatic School ERP — Admissions, Fees, Attendance & Parent App", description: "A complete school ERP on web and mobile: admissions, fees, attendance, report cards, staff, transport and a parent app. Built for preschools and K-12 in India.", path: "/erp" });
  return (
    <>
      <section className="grad-foam pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-5 text-center reveal">
          <Eyebrow>KidoMatic ERP · Web + Mobile</Eyebrow>
          <H2>Run your whole school from one calm place.</H2>
          <Lead>Admissions to report cards, fees to the parent app — everything a preschool and K-12 needs, beautifully connected.</Lead>
          <div className="mt-7 flex justify-center gap-3"><CTA>Book a Demo</CTA><CTA to="/get-started" variant="btn-ghost">Start free</CTA></div>
        </div>
        <div className="max-w-6xl mx-auto px-5 mt-12 reveal"><BrowserFrame src={dash} alt="ERP dashboard — real screenshot" /></div>
      </section>
      <Wave fill="#fff" />

      {/* Real screenshots */}
      <Section className="bg-white">
        <div className="text-center reveal"><Eyebrow>The real thing</Eyebrow><H2>Not a mockup — this is the product</H2></div>
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <div className="reveal"><BrowserFrame src={attendance} alt="Attendance" /><p className="text-center text-sm text-ink/50 mt-2">Attendance — class-wise, one tap</p></div>
          <div className="reveal"><BrowserFrame src={fees} alt="Fee collection" /><p className="text-center text-sm text-ink/50 mt-2">Fees — collect with instant receipts</p></div>
        </div>
      </Section>

      {/* User App */}
      <Section className="grad-foam">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal"><Eyebrow>For families · Parent app</Eyebrow><H2>Parents see their child's day — live.</H2>
            <Lead>Attendance, today's lessons, stars earned, fees and school messages — in a friendly app parents actually open.</Lead>
            <div className="grid grid-cols-2 gap-3 mt-6 text-ink/75 text-sm">{["Daily attendance", "Fees & online pay", "Lessons & stars", "School messages"].map((f) => <div key={f} className="flex items-center gap-2">🐙 {f}</div>)}</div>
          </div>
          <div className="flex justify-center gap-4 reveal">
            <PhoneMock screen="today" className="rotate-[-4deg]" />
            <PhoneMock screen="fees" className="rotate-[4deg] mt-8 hidden sm:block" />
          </div>
        </div>
      </Section>

      {/* Feature grid */}
      <Section className="bg-white">
        <div className="text-center reveal"><Eyebrow>Everything included</Eyebrow><H2>One system, every module</H2></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {FEATURES.map(([t, d]) => <div key={t} className="mcard p-5 reveal"><h3 className="font-display text-lg text-ink">{t}</h3><p className="mt-1.5 text-sm text-ink/60">{d}</p></div>)}
        </div>
      </Section>

      {/* Rollout */}
      <section className="grad-reef text-white py-20 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-5 reveal"><Eyebrow>Live in a day</Eyebrow><H2 dark>Three steps to go live</H2>
          <div className="grid sm:grid-cols-3 gap-6 mt-10 text-left">
            {[["1", "Create your account", "Sign up as school admin in minutes."], ["2", "Pick a plan", "Seat-based ₹50/user/mo. GST invoice included."], ["3", "Import & go", "Add classes and students — you're live."]].map(([n, t, d]) => (
              <div key={n} className="bg-white/5 rounded-3xl p-5 ring-1 ring-white/10"><div className="font-display text-3xl text-sun">{n}</div><h3 className="font-display text-lg text-white mt-1">{t}</h3><p className="text-white/70 text-sm mt-1">{d}</p></div>
            ))}
          </div>
          <div className="mt-8"><CTA>Get Started</CTA></div>
        </div>
      </section>
    </>
  );
}
