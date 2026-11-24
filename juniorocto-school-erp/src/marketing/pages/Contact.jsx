import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { Eyebrow, H2, Lead, Section } from "./ui";
import { useSeo } from "../useSeo";

const TOPICS = ["Book a demo", "Sales & pricing", "Partnership", "Support", "Other"];
export default function Contact() {
  useSeo({ title: "Contact KidoMatic — Demos, Sales, Partnerships & Support", description: "Get in touch with the KidoMatic team for a demo, pricing, partnership or support. Operated by HackGeniX Tech Private Limited, Salem & Chennai, Tamil Nadu.", path: "/contact" });
  const [sent, setSent] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", topic: TOPICS[0], message: "" });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  return (
    <>
      <section className="grad-foam pt-16 pb-12 text-center"><div className="max-w-2xl mx-auto px-5 reveal">
        <Eyebrow>Contact us</Eyebrow><H2>Let's talk about your school.</H2>
        <Lead>Book a demo, ask about pricing, or explore a partnership — we usually reply within one business day.</Lead>
      </div></section>

      <Section className="bg-white">
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Details */}
          <div className="lg:col-span-2 space-y-4 reveal">
            <Info icon={Mail} title="Email us" lines={["Sales & demos: ravi@hackgenix.com", "Support: ravi@hackgenix.com"]} />
            <Info icon={Phone} title="Call / WhatsApp" lines={["+91 90000 00000", "Mon–Sat, 9:30 AM – 7:00 PM IST"]} />
            <Info icon={MapPin} title="Registered office" lines={["HackGeniX Tech Private Limited", "67/1, Thiyagi Nadesan Street No. 3,", "Ammapettai, Salem – 636003, Tamil Nadu, India"]} />
            <Info icon={Clock} title="Business hours" lines={["Monday–Saturday · 9:30 AM – 7:00 PM IST", "Sunday · closed"]} />
            <a href="https://wa.me/919000000000" className="mbtn btn-coral w-full justify-center py-3"><MessageCircle size={17} /> Chat on WhatsApp</a>
            <p className="text-xs text-ink/45">Grievance Officer: Ravikumar S · ravi@hackgenix.com</p>
          </div>
          {/* Form */}
          <div className="lg:col-span-3 mcard p-6 sm:p-8 reveal">
            {sent ? (
              <div className="text-center py-16"><div className="text-5xl mb-3">🐙</div><h3 className="font-display text-2xl text-ink">Thanks — message received!</h3><p className="text-ink/60 mt-2">We'll get back to you within one business day.</p></div>
            ) : (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Your name" value={f.name} onChange={(v) => set("name", v)} />
                  <Field label="Email" value={f.email} onChange={(v) => set("email", v)} type="email" />
                  <Field label="Phone" value={f.phone} onChange={(v) => set("phone", v)} />
                  <label className="block"><span className="text-xs font-semibold text-ink/60">Topic</span><select value={f.topic} onChange={(e) => set("topic", e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-ink/12 px-3 text-sm outline-none focus:border-royal/50 bg-white">{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
                </div>
                <label className="block"><span className="text-xs font-semibold text-ink/60">How can we help?</span><textarea value={f.message} onChange={(e) => set("message", e.target.value)} rows={5} className="mt-1 w-full rounded-xl border border-ink/12 px-3 py-2 text-sm outline-none focus:border-royal/50" placeholder="Tell us about your school, number of students, and what you're looking for…" /></label>
                <button onClick={() => (f.name && f.email ? setSent(true) : null)} className="mbtn btn-coral w-full justify-center py-3"><Send size={16} /> Send message</button>
                <p className="text-xs text-ink/40 text-center">By submitting, you agree to our <a href="/privacy" className="text-royal">Privacy Policy</a>.</p>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
const Info = ({ icon: Icon, title, lines }) => (
  <div className="mcard p-4 flex gap-3"><div className="h-10 w-10 rounded-xl bg-foam grid place-items-center text-royal shrink-0"><Icon size={18} /></div><div><p className="font-display text-ink text-sm">{title}</p>{lines.map((l, i) => <p key={i} className="text-[13px] text-ink/60 leading-snug">{l}</p>)}</div></div>
);
const Field = ({ label, value, onChange, type = "text" }) => (
  <label className="block"><span className="text-xs font-semibold text-ink/60">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-ink/12 px-3 text-sm outline-none focus:border-royal/50" /></label>
);
