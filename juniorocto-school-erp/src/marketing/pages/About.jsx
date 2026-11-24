import { Link } from "react-router-dom";
import { Eyebrow, H2, Lead, CTA, Section } from "./ui";
import { useSeo } from "../useSeo";
import Octo from "../Octo";
import Counter from "../Counter";

const VALUES = [
  ["🎈", "Play first", "Little kids learn by doing. Every world and lesson starts from play, not worksheets."],
  ["🛡️", "Kid-safe by design", "No ads, no chat with strangers, no data selling. A walled garden parents can trust."],
  ["🇮🇳", "Built for India", "Affordable seat-based pricing, GST invoicing, UPI payments, and support that gets local schools."],
  ["🤝", "Schools as partners", "We win when your school runs calmer and your children learn more — not before."],
];
const TIMELINE = [
  ["2016", "Nine years of building EdTech, training 30,000+ students across Tamil Nadu."],
  ["2025", "HackGeniX Tech Private Limited incorporated in Salem, Tamil Nadu."],
  ["2026", "KidoMatic launches — 3D learning Worlds + a complete school ERP, in one platform."],
];

export default function About() {
  useSeo({ title: "About KidoMatic & HackGeniX — Early Learning Worlds + School ERP", description: "KidoMatic blends immersive 3D learning worlds for ages 3–6 with a complete school ERP. Built in India by HackGeniX Tech Private Limited. 30,000+ learners, 6 countries.", path: "/about" });
  return (
    <>
      <section className="grad-foam pt-16 pb-16 text-center"><div className="max-w-3xl mx-auto px-5 reveal">
        <div className="flex justify-center mb-4 bob"><Octo size={92} /></div>
        <Eyebrow>Our story</Eyebrow><H2>Early learning should feel like play. Running a school should feel calm.</H2>
        <Lead>KidoMatic is where the two meet — immersive 3D worlds for little explorers, and a complete ERP that quietly runs the school behind them.</Lead>
      </div></section>

      {/* Mission */}
      <Section className="bg-white">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="reveal"><Eyebrow>Why we exist</Eyebrow><H2>One platform for the whole early-years journey</H2>
            <p className="mt-4 text-ink/70 leading-relaxed">Most preschools juggle a learning app here, an attendance register there, a WhatsApp group for parents, and a pile of fee receipts. KidoMatic brings it together: children explore curriculum-mapped 3D worlds, teachers run the classroom, admins run the school, and parents see it all in one friendly app.</p>
            <p className="mt-3 text-ink/70 leading-relaxed">It's ad-free, kid-safe, works on the cheapest tablet, and is priced simply — so great early education isn't only for big-city schools.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 reveal">
            {[["30000", "+", "learners"], ["6", "", "countries"], ["50", "+", "schools"], ["6", "", "worlds"], ["100", "+", "lessons"], ["10", "yr", "experience"]].map(([n, s, l]) => (
              <div key={l} className="mcard p-4 text-center"><p className="font-display text-2xl text-ink"><Counter to={+n} suffix={s} /></p><p className="text-[11px] text-ink/50 mt-1">{l}</p></div>
            ))}
          </div>
        </div>
      </Section>

      {/* What we build */}
      <Section className="grad-foam">
        <div className="text-center reveal"><Eyebrow>The platform</Eyebrow><H2>Three products, one universe</H2></div>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[["🐙", "KidoMatic Worlds", "Six immersive 3D worlds and 100+ bite-size lessons that teach numeracy, literacy, motor skills and social learning through play — for ages 3–6."], ["🏫", "School ERP", "Admissions, fees, attendance, academics, report cards, staff, transport and a parent app — the whole school, on web and mobile."], ["🤝", "Partners", "A white-label programme so resellers and edupreneurs can bring KidoMatic to schools under their own brand and earn recurring revenue."]].map(([e, t, d]) => (
            <div key={t} className="mcard p-7 reveal"><div className="text-4xl mb-3">{e}</div><h3 className="font-display text-xl text-ink">{t}</h3><p className="mt-2 text-ink/60 text-sm leading-relaxed">{d}</p></div>
          ))}
        </div>
      </Section>

      {/* Values */}
      <Section className="bg-white">
        <div className="text-center reveal"><Eyebrow>What we believe</Eyebrow><H2>Our values</H2></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {VALUES.map(([e, t, d]) => <div key={t} className="mcard p-5 reveal"><div className="text-3xl mb-2">{e}</div><h3 className="font-display text-ink">{t}</h3><p className="mt-1.5 text-sm text-ink/60">{d}</p></div>)}
        </div>
      </Section>

      {/* HackGeniX */}
      <section className="grad-reef text-white py-20">
        <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-center">
          <div className="reveal"><Eyebrow>The company behind KidoMatic</Eyebrow><H2 dark>HackGeniX Tech Private Limited</H2>
            <p className="mt-4 text-white/75 leading-relaxed">HackGeniX is a product studio from Tamil Nadu building software across web, mobile, AR/VR and AI. KidoMatic is our flagship product for early education — born from nearly a decade of training students and building for schools and brands.</p>
            <p className="mt-3 text-white/75 leading-relaxed">We've served clients across six countries and trained more than 30,000 learners. KidoMatic is where that experience becomes a product every school can use.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-white/80">
              <p>📍 Salem · Chennai, Tamil Nadu</p><p>🏢 Incorporated 2025</p>
              <p>🌍 6 countries served</p><p>✉️ ravi@hackgenix.com</p>
            </div>
          </div>
          <div className="mcard p-6 text-ink reveal">
            <p className="eyebrow text-coral">From the founder</p>
            <p className="mt-3 text-ink/75 leading-relaxed italic">"I've spent years in classrooms and codebases. KidoMatic is the tool I wish every school had — one place where children love to learn and teachers finally get their evenings back."</p>
            <div className="mt-4 flex items-center gap-3"><div className="h-11 w-11 rounded-full grad-reef grid place-items-center text-white font-display">RS</div><div><p className="font-display text-ink">Ravikumar S</p><p className="text-xs text-ink/50">Founder & Managing Director</p></div></div>
            <div className="mt-5 pt-4 border-t border-ink/8 text-xs text-ink/50 space-y-0.5"><p>CIN: U62013TZ2025PTC035022</p><p>GSTIN: 33AAICH0065K1ZO</p></div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <Section className="bg-white">
        <div className="text-center reveal"><Eyebrow>Milestones</Eyebrow><H2>How we got here</H2></div>
        <div className="max-w-2xl mx-auto mt-10 space-y-4">
          {TIMELINE.map(([y, t]) => <div key={y} className="flex gap-4 reveal"><div className="font-display text-2xl text-coral w-16 shrink-0">{y}</div><div className="mcard p-4 flex-1"><p className="text-ink/70 text-sm">{t}</p></div></div>)}
        </div>
        <div className="text-center mt-10"><CTA>Get Started</CTA> <Link to="/contact" className="mbtn btn-ghost px-6 py-3 ml-2">Talk to us</Link></div>
      </Section>
    </>
  );
}
