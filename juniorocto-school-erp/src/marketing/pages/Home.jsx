import { useState } from "react";
import { Link } from "react-router-dom";
import { Eyebrow, H2, Lead, CTA, BrowserFrame, Section } from "./ui";
import { useSeo } from "../useSeo";
import Octo from "../Octo";
import Bubbles from "../Bubbles";
import Counter from "../Counter";
import HomeHero from "../hero/HomeHero";
import dash from "../assets/erp_dashboard.png";

const PILLARS = [
  { to: "/worlds", emoji: "🐙", title: "KidoMatic Worlds", text: "Immersive 3D worlds where ages 3–6 explore, play and learn — Farm, Ocean, Town and more." },
  { to: "/erp", emoji: "🏫", title: "School ERP", text: "Run the whole school — admissions, fees, attendance, report cards, staff, parent app — web + mobile." },
  { to: "/partners", emoji: "🤝", title: "Partners", text: "Resell KidoMatic under your own brand and earn recurring commission on every school." },
];
const WORLDS = {
  Ocean: { emoji: "🌊", color: "#3FB6C9", learn: "Counting, colours & sea creatures", skills: ["Numbers 1–20", "Colour matching", "Cause & effect"] },
  Farm: { emoji: "🐄", color: "#8FBF5B", learn: "Animals, food & where it comes from", skills: ["Categories", "Animal sounds", "Healthy food"] },
  Town: { emoji: "🏡", color: "#1651A3", learn: "Community helpers, roads & manners", skills: ["Social skills", "Road safety", "Everyday words"] },
  Garden: { emoji: "🌸", color: "#E85410", learn: "Plants, bugs, seasons & growth", skills: ["Life cycles", "Seasons", "Patience"] },
};
const TESTIMONIALS = [
  ["Our parents finally open the app every day. Attendance and fees stopped being a headache.", "Principal, Sunrise Preschool", "🏫"],
  ["The children ask for 'octopus time'. They're learning numbers without even noticing.", "LKG Teacher, Blue Lagoon", "🎈"],
  ["We white-labelled it for our three branches. Setup was a day, not a month.", "Director, Little Steps Group", "🤝"],
];

export default function Home() {
  useSeo({ title: "KidoMatic — 3D Learning Worlds & School ERP for Ages 3–6", description: "KidoMatic brings immersive 3D learning worlds for ages 3–6 and a complete school ERP with a parent app. Ad-free, kid-safe, made in India. From ₹50/user/month.", path: "/" });
  const [world, setWorld] = useState("Ocean");
  const [t, setT] = useState(0);
  const w = WORLDS[world];
  return (
    <>
      <HomeHero />

      {/* TRUST BAR (animated) */}
      <div className="bg-white"><div className="max-w-7xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 py-10 text-center">
        {[[30000, "+", "little learners"], [50, "+", "schools & preschools"], [6, "", "immersive worlds"], [100, "+", "bite-size lessons"]].map(([n, s, l]) => (
          <div key={l}><p className="font-display text-3xl text-ink"><Counter to={n} suffix={s} /></p><p className="text-sm text-ink/50">{l}</p></div>
        ))}
      </div></div>

      {/* PILLARS */}
      <Section className="grad-foam">
        <div className="text-center max-w-2xl mx-auto reveal"><Eyebrow>Three products, one universe</Eyebrow><H2>Everything a modern preschool needs</H2></div>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {PILLARS.map((p) => (
            <Link to={p.to} key={p.title} className="mcard p-7 reveal hover:-translate-y-1 transition block">
              <div className="text-4xl mb-3">{p.emoji}</div><h3 className="font-display text-xl text-ink">{p.title}</h3><p className="mt-2 text-ink/60">{p.text}</p><p className="mt-4 text-royal font-semibold text-sm">Learn more →</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* INTERACTIVE WORLDS EXPLORER */}
      <Section className="bg-white">
        <div className="text-center reveal"><Eyebrow>Tap a world</Eyebrow><H2>Explore what your child learns</H2></div>
        <div className="mt-10 grid lg:grid-cols-2 gap-8 items-center">
          <div className="reveal">
            <div className="flex flex-wrap gap-2 mb-5">{Object.keys(WORLDS).map((k) => <button key={k} onClick={() => setWorld(k)} className={`px-4 py-2 rounded-full text-sm font-bold transition ${world === k ? "text-white" : "btn-ghost"}`} style={world === k ? { background: WORLDS[k].color } : {}}>{WORLDS[k].emoji} {k}</button>)}</div>
            <div className="mcard p-6"><h3 className="font-display text-2xl text-ink flex items-center gap-2"><span className="text-3xl">{w.emoji}</span>{world} World</h3>
              <p className="mt-2 text-ink/65">{w.learn}</p>
              <p className="mt-4 text-xs font-bold text-ink/50 uppercase tracking-wide">Skills built</p>
              <div className="flex flex-wrap gap-2 mt-2">{w.skills.map((s) => <span key={s} className="chip bg-foam text-royal">{s}</span>)}</div>
              <Link to="/worlds" className="mbtn btn-coral px-5 py-2.5 mt-5">See all worlds</Link>
            </div>
          </div>
          <div className="rounded-xl3 h-72 lg:h-80 flex items-center justify-center text-8xl reveal transition-all" style={{ background: `radial-gradient(120% 120% at 30% 20%, ${w.color}, ${w.color}22)` }}><span className="bob">{w.emoji}</span></div>
        </div>
      </Section>

      {/* ERP BAND (real screenshot) */}
      <section className="grad-reef text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal"><Eyebrow>KidoMatic ERP · Web + Mobile</Eyebrow><H2 dark>One platform to run your whole school.</H2>
            <Lead dark>Admissions, attendance, fees, classes, staff, report cards and parent communication — on the web and in your pocket.</Lead>
            <div className="grid grid-cols-2 gap-3 mt-6 text-white/85 text-sm">{["Admissions & Fees", "Attendance", "Report Cards", "Parent App"].map((f) => <div key={f} className="flex items-center gap-2">✅ {f}</div>)}</div>
            <div className="mt-7 flex gap-3"><CTA>Book a Demo</CTA><Link to="/erp" className="mbtn btn-ghost px-6 py-3">See the ERP</Link></div>
          </div>
          <div className="reveal floaty"><BrowserFrame src={dash} alt="ERP dashboard" /></div>
        </div>
        <Bubbles count={10} />
      </section>

      {/* TESTIMONIALS (interactive) */}
      <Section className="grad-foam">
        <div className="text-center reveal"><Eyebrow>Loved by schools</Eyebrow><H2>What they say</H2></div>
        <div className="max-w-2xl mx-auto mt-10 reveal">
          <div className="mcard p-8 text-center"><div className="text-4xl mb-3">{TESTIMONIALS[t][2]}</div><p className="font-display text-xl text-ink leading-snug">"{TESTIMONIALS[t][0]}"</p><p className="mt-4 text-ink/50 text-sm">— {TESTIMONIALS[t][1]}</p></div>
          <div className="flex justify-center gap-2 mt-5">{TESTIMONIALS.map((_, i) => <button key={i} onClick={() => setT(i)} className={`h-2.5 rounded-full transition-all ${i === t ? "w-8 bg-coral" : "w-2.5 bg-ink/20"}`} aria-label={`Testimonial ${i + 1}`} />)}</div>
        </div>
      </Section>

      {/* PRICING TEASER */}
      <Section className="bg-white">
        <div className="mcard grad-foam p-10 text-center reveal"><Eyebrow>Simple, seat-based pricing</Eyebrow><H2>From ₹50 / user / month</H2>
          <Lead>Reef for the ERP, Ocean for ERP + Worlds, Fleet for chains & white-label. One clear rate, GST invoice included.</Lead>
          <div className="mt-6 flex justify-center gap-3"><CTA>Start free</CTA><Link to="/pricing" className="mbtn btn-ghost px-6 py-3">See pricing</Link></div>
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="grad-reef text-white py-20 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-5 reveal"><div className="flex justify-center mb-4 bob"><span className="inline-grid place-items-center bg-white rounded-3xl p-3 shadow-lift"><Octo size={72} /></span></div>
          <H2 dark>Ready to give your school a home?</H2><Lead dark>Create your admin account, pick a plan, and you're live today.</Lead>
          <div className="mt-7 flex justify-center gap-3"><CTA>Get Started</CTA><Link to="/contact" className="mbtn btn-ghost px-6 py-3">Talk to us</Link></div>
        </div>
        <Bubbles count={12} />
      </section>
    </>
  );
}
