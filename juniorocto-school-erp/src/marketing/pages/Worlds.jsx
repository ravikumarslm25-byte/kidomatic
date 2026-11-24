import { useSeo } from "../useSeo";
import { Eyebrow, H2, Lead, CTA, Section } from "./ui";
import Octo from "../Octo";
const WORLDS = [["🏡", "Town", "Community helpers, roads & manners"], ["🐄", "Farm", "Animals, food & where it comes from"], ["🌴", "Jungle", "Wild animals, sounds & habitats"], ["🌸", "Garden", "Plants, bugs, seasons & growth"], ["🌊", "Ocean", "Sea creatures, counting & colours"], ["🌾", "Meadow", "Weather, shapes & the outdoors"]];
const PRINCIPLES = [["Play first", "Kids learn by doing, tapping and exploring — never by being lectured."], ["Bite-size", "2–4 minute lessons that fit tiny attention spans."], ["Kid-safe", "No ads, no chat, no data selling. A walled garden by design."], ["Every device", "Runs on the cheapest tablet, the family phone, or the classroom screen."], ["Curriculum-mapped", "Numeracy, literacy, motor skills and social learning, tracked back to the ERP."]];
export default function Worlds() {
  useSeo({ title: "KidoMatic Worlds — Immersive 3D Learning for Ages 3–6", description: "Six immersive 3D worlds and 100+ bite-size lessons that teach numeracy, literacy and motor skills through play. Ad-free and kid-safe, for ages 3–6.", path: "/worlds" });
  return (
    <>
      <section className="grad-foam pt-16 pb-20 text-center"><div className="max-w-3xl mx-auto px-5 reveal"><div className="flex justify-center mb-4 bob"><Octo size={90} /></div>
        <Eyebrow>KidoMatic Worlds · Ages 3–6</Eyebrow><H2>Six worlds. A hundred little adventures.</H2>
        <Lead>Immersive 3D places where young children explore, play and learn — at home and in the classroom.</Lead>
        <div className="mt-7 flex justify-center gap-3"><CTA>Get Started</CTA></div></div>
      </section>
      <Section className="bg-white">
        <div className="text-center reveal"><Eyebrow>Explore</Eyebrow><H2>Pick a world, start playing</H2></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {WORLDS.map(([e, t, d]) => <div key={t} className="mcard p-7 reveal hover:-translate-y-1 transition"><div className="text-5xl mb-3">{e}</div><h3 className="font-display text-xl text-ink">{t}</h3><p className="mt-1.5 text-ink/60">{d}</p></div>)}
        </div>
      </Section>
      <Section className="grad-foam">
        <div className="text-center reveal"><Eyebrow>How we build them</Eyebrow><H2>Five promises to parents & teachers</H2></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5 mt-10">{PRINCIPLES.map(([t, d]) => <div key={t} className="mcard p-5 reveal"><h3 className="font-display text-ink">{t}</h3><p className="mt-1.5 text-sm text-ink/60">{d}</p></div>)}</div>
      </Section>
    </>
  );
}
