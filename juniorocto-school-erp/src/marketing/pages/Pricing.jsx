import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Minus } from "lucide-react";
import { Eyebrow, H2, Lead, Section } from "./ui";
import { useSeo } from "../useSeo";

const PLANS = [
  { key: "reef", name: "Reef", tag: "School ERP", m: 50, y: 42, blurb: "Everything to run a school — admissions to report cards, on web and mobile.", cta: "Start with Reef",
    features: ["Full School ERP (web + mobile)", "Admissions, fees & accounts", "Attendance & academics", "Report cards & development", "Staff & payroll", "Transport & live tracking", "Parent app + communication", "AI insights & analytics", "GST invoice · email support"] },
  { key: "ocean", name: "Ocean", tag: "ERP + Worlds", m: 80, y: 67, popular: true, blurb: "The full universe — the ERP plus immersive 3D learning worlds for your little ones.", cta: "Go with Ocean",
    features: ["Everything in Reef", "KidoMatic Worlds — 6 worlds", "100+ bite-size 3D lessons", "Student & parent learning app", "Learning progress synced to ERP", "Teacher lesson dashboard", "Priority support", "Onboarding & data import"] },
  { key: "fleet", name: "Fleet", tag: "Custom & Chains", price: "Let's talk", blurb: "For school chains, groups and partners who need white-label, scale and control.", cta: "Talk to sales",
    features: ["Everything in Ocean", "White-label — your logo, colours, domain", "Multi-branch / chain management", "Reseller & partner portal", "Dedicated account manager", "Custom integrations & SLAs", "Volume & annual pricing", "Priority roadmap input"] },
];
const COMPARE = [
  ["School ERP (all modules)", true, true, true], ["Parent app", true, true, true], ["AI insights", true, true, true],
  ["KidoMatic Worlds (3D learning)", false, true, true], ["Student learning app", false, true, true], ["Learning ↔ ERP sync", false, true, true],
  ["White-label branding", false, false, true], ["Multi-branch / chains", false, false, true], ["Partner / reseller portal", false, false, true], ["Dedicated success manager", false, false, true],
];
const FAQ = [
  ["How does seat-based pricing work?", "You pay per active user per month — students plus staff who use the system. Add or remove users anytime; billing adjusts on your next cycle. No setup fees, no per-module charges."],
  ["What counts as a 'user'?", "Any active student or staff account. Parents linked to a student are free — you only pay for the student seat, not each parent."],
  ["Is GST included?", "Prices are exclusive of 18% GST. Every payment generates a proper GST tax invoice from HackGeniX Tech Private Limited (GSTIN 33AAICH0065K1ZO)."],
  ["Can I switch plans later?", "Yes — upgrade from Reef to Ocean, or move to Fleet, at any time. Downgrades apply from the next billing cycle."],
  ["Do you offer a free trial?", "Yes. Create your admin account and explore before you subscribe. Talk to us for a guided demo with your own data."],
  ["How are payments handled?", "Securely via Razorpay (UPI, cards, net-banking). Subscriptions are month-to-month; cancel anytime from your admin console."],
];
export default function Pricing() {
  useSeo({ title: "Pricing — KidoMatic School ERP & 3D Learning | Plans from ₹50/user", description: "Simple seat-based pricing for KidoMatic. Reef (School ERP), Ocean (ERP + 3D Worlds) and Fleet (custom & white-label). GST invoice included. Made in India.", path: "/pricing" });
  const [yearly, setYearly] = useState(false);
  const [seats, setSeats] = useState(150);
  const [calcPlan, setCalcPlan] = useState("ocean");
  const rate = (p) => (yearly ? p.y : p.m);
  const cp = PLANS.find((p) => p.key === calcPlan);
  const sub = (cp.m ? rate(cp) : 0) * seats;
  const tax = Math.round(sub * 0.18);
  return (
    <>
      <section className="grad-foam pt-16 pb-14 text-center">
        <div className="max-w-3xl mx-auto px-5 reveal">
          <Eyebrow>Pricing</Eyebrow><H2>One clear rate. Pay for what you use.</H2>
          <Lead>Seat-based pricing — no setup fees, no hidden module charges. Choose the platform that fits your school.</Lead>
          <div className="inline-flex items-center gap-1 bg-white rounded-full p-1 shadow-soft mt-6">
            <button onClick={() => setYearly(false)} className={`px-5 py-2 rounded-full text-sm font-bold ${!yearly ? "btn-coral text-white" : "text-ink/55"}`}>Monthly</button>
            <button onClick={() => setYearly(true)} className={`px-5 py-2 rounded-full text-sm font-bold ${yearly ? "btn-coral text-white" : "text-ink/55"}`}>Yearly · save 16%</button>
          </div>
        </div>
      </section>
      <Section className="bg-white">
        <div className="grid lg:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div key={p.key} className={`mcard p-7 reveal flex flex-col ${p.popular ? "ring-2 ring-coral relative" : ""}`}>
              {p.popular && <span className="chip btn-coral text-white absolute -top-3 left-7">★ Most popular</span>}
              <h3 className="font-display text-2xl text-ink">{p.name}</h3><p className="text-coral font-semibold text-sm">{p.tag}</p>
              <div className="mt-4">{p.m ? <><span className="font-display text-4xl text-ink">₹{rate(p)}</span><span className="text-ink/50 text-sm"> /user/mo</span></> : <span className="font-display text-3xl text-ink">{p.price}</span>}</div>
              <p className="mt-3 text-ink/60 text-sm">{p.blurb}</p>
              <ul className="mt-5 space-y-2 flex-1">{p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink/75"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />{f}</li>)}</ul>
              <Link to={p.key === "fleet" ? "/contact" : "/get-started"} className={`mbtn ${p.popular ? "btn-coral" : "btn-ghost"} justify-center py-3 mt-6`}>{p.cta}</Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-ink/45 mt-4">All prices exclusive of 18% GST · billed monthly · cancel anytime</p>
      </Section>
      <Section className="grad-foam">
        <div className="mcard p-8 reveal max-w-3xl mx-auto">
          <div className="text-center"><Eyebrow>Estimate your cost</Eyebrow><H2>Price calculator</H2></div>
          <div className="flex flex-wrap justify-center gap-2 mt-6">{PLANS.filter((p) => p.m).map((p) => <button key={p.key} onClick={() => setCalcPlan(p.key)} className={`px-4 py-2 rounded-full text-sm font-bold ${calcPlan === p.key ? "btn-coral text-white" : "btn-ghost"}`}>{p.name} · ₹{rate(p)}</button>)}</div>
          <div className="mt-6"><div className="flex justify-between text-sm text-ink/60 mb-1"><span>Users (students + staff)</span><span className="font-bold text-ink">{seats}</span></div><input type="range" min="20" max="2000" step="10" value={seats} onChange={(e) => setSeats(+e.target.value)} className="w-full accent-[#E85410]" /></div>
          <div className="grid sm:grid-cols-3 gap-4 mt-6 text-center"><Box l="Per month" v={`₹${sub.toLocaleString("en-IN")}`} /><Box l="GST (18%)" v={`₹${tax.toLocaleString("en-IN")}`} /><Box l="Total / month" v={`₹${(sub + tax).toLocaleString("en-IN")}`} accent /></div>
          <div className="text-center mt-6"><Link to="/get-started" className="mbtn btn-coral px-6 py-3">Get this price</Link></div>
        </div>
      </Section>
      <Section className="bg-white">
        <div className="text-center reveal"><Eyebrow>Compare</Eyebrow><H2>What's in each plan</H2></div>
        <div className="overflow-x-auto mt-8 reveal"><table className="w-full min-w-[560px] text-sm">
          <thead><tr className="border-b-2 border-ink/10 text-left"><th className="py-3 font-display text-ink">Feature</th><th className="text-center font-display text-ink">Reef</th><th className="text-center font-display text-coral">Ocean</th><th className="text-center font-display text-ink">Fleet</th></tr></thead>
          <tbody className="divide-y divide-ink/8">{COMPARE.map(([f, ...cols]) => <tr key={f}><td className="py-3 text-ink/75">{f}</td>{cols.map((on, i) => <td key={i} className="text-center">{on ? <Check size={17} className="inline text-emerald-500" /> : <Minus size={15} className="inline text-ink/25" />}</td>)}</tr>)}</tbody>
        </table></div>
      </Section>
      <Section className="grad-foam">
        <div className="max-w-3xl mx-auto"><div className="text-center reveal"><Eyebrow>FAQ</Eyebrow><H2>Pricing questions, answered</H2></div>
          <div className="mt-8 space-y-3">{FAQ.map(([q, a]) => <details key={q} className="mcard p-5 reveal"><summary className="font-display text-ink flex justify-between items-center">{q}<span className="text-coral text-xl leading-none">+</span></summary><p className="mt-3 text-ink/65 text-sm leading-relaxed">{a}</p></details>)}</div>
        </div>
      </Section>
    </>
  );
}
const Box = ({ l, v, accent }) => <div className={`rounded-2xl p-4 ${accent ? "grad-reef text-white" : "bg-foam"}`}><p className={`text-xs ${accent ? "text-white/70" : "text-ink/50"}`}>{l}</p><p className={`font-display text-2xl ${accent ? "text-white" : "text-ink"}`}>{v}</p></div>;
