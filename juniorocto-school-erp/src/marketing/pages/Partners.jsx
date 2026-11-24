import { useSeo } from "../useSeo";
import { Eyebrow, H2, Lead, CTA, Section } from "./ui";
const MODELS = [["Direct — Website", "School buys online; licence activates automatically on payment."], ["Wholesale — Reseller", "You buy at partner rates and sell to your schools; you invoice them."], ["Referral — Partner", "Refer schools with your link; they pay us, you earn commission."], ["Direct Sales", "Our team supports your field sales; we invoice and you're credited."]];
export default function Partners() {
  useSeo({ title: "KidoMatic Partners — White-Label School ERP Reseller Programme", description: "Resell KidoMatic under your own brand. White-label the ERP and learning worlds, manage multiple schools, and earn recurring commission on every seat.", path: "/partners" });
  return (
    <>
      <section className="grad-foam pt-16 pb-20 text-center"><div className="max-w-3xl mx-auto px-5 reveal">
        <Eyebrow>KidoMatic Partners</Eyebrow><H2>Grow your business with your own white-label ERP.</H2>
        <Lead>Bring KidoMatic to schools under your brand, set each school's look, and earn recurring commission on every seat.</Lead>
        <div className="mt-7 flex justify-center gap-3"><CTA to="/contact">Become a partner</CTA></div></div>
      </section>
      <Section className="bg-white">
        <div className="text-center reveal"><Eyebrow>Four ways to earn</Eyebrow><H2>Pick the model that fits you</H2></div>
        <div className="grid sm:grid-cols-2 gap-6 mt-10">{MODELS.map(([t, d]) => <div key={t} className="mcard p-6 reveal"><h3 className="font-display text-xl text-ink">{t}</h3><p className="mt-2 text-ink/60">{d}</p></div>)}</div>
      </Section>
      <Section className="grad-foam">
        <div className="mcard p-8 reveal"><Eyebrow>Commission</Eyebrow><H2>Recurring, transparent, monthly</H2>
          <div className="overflow-x-auto mt-6"><table className="w-full text-left text-sm">
            <thead><tr className="text-ink/50 border-b border-ink/10"><th className="py-2">Tier</th><th>Active schools</th><th>Your commission</th></tr></thead>
            <tbody className="divide-y divide-ink/8">{[["Starter", "1–5", "20%"], ["Growth", "6–20", "25%"], ["Scale", "20+", "30%"]].map(([a, b, c]) => <tr key={a}><td className="py-3 font-semibold text-ink">{a}</td><td className="text-ink/70">{b}</td><td className="text-coral font-semibold">{c}</td></tr>)}</tbody>
          </table></div>
          <p className="text-xs text-ink/45 mt-3">Indicative — final slabs confirmed in your partner agreement.</p>
        </div>
      </Section>
    </>
  );
}
