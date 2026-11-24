import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, ShieldCheck, Lock, Star, X } from "lucide-react";
import HeroShowcase from "./HeroShowcase";
import { IndiaFlag, Plant } from "./HeroArt";
import { octoSay } from "./octoBus";
import { WORLDS_URL } from "@/config/app";
import "./hero.css";

// The three classes of the KidoMatic Worlds app (its /grade/:gradeId routes).
const CLASSES = [
  { id: "nursery", name: "Nursery", tag: "Ages 3–4", emoji: "🐣", color: "#FF8A3D", tint: "#FFF1E6" },
  { id: "lkg", name: "LKG", tag: "Ages 4–5", emoji: "🐙", color: "#4C7EF3", tint: "#EAF1FF" },
  { id: "ukg", name: "UKG", tag: "Ages 5–6", emoji: "🐢", color: "#22C1A6", tint: "#E4FAF5" },
];

const TRUST = [
  [<ShieldCheck key="s" size={22} strokeWidth={2.2} className="text-[#2C4A78]" />, "Ad-free"],
  [<Lock key="l" size={20} strokeWidth={2.4} className="text-[#1E2A44]" />, "Kid-safe"],
  [<IndiaFlag key="f" size={22} />, "Made in India"],
];

// Rising bubbles live only over the right half so they never cross the headline / CTAs.
const RISING = [
  { left: "54%", size: 18, dur: 17, delay: 0 },
  { left: "63%", size: 12, dur: 21, delay: -6 },
  { left: "72%", size: 22, dur: 19, delay: -11 },
  { left: "81%", size: 14, dur: 15, delay: -3 },
  { left: "90%", size: 26, dur: 23, delay: -14 },
  { left: "96%", size: 12, dur: 18, delay: -8 },
];

// Slow parallax: background and foreground decorations shift a little, in
// opposite directions, as the mouse moves (CSS vars --px / --py in -1…1).
function useParallax() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, x = 0, y = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty("--px", ((x / window.innerWidth) * 2 - 1).toFixed(3));
      el.style.setProperty("--py", ((y / window.innerHeight) * 2 - 1).toFixed(3));
    };
    const onMove = (e) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(apply); };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return ref;
}

export default function HomeHero() {
  const heroRef = useParallax();
  const [picker, setPicker] = useState(false);
  const closePicker = useCallback(() => setPicker(false), []);
  const openPicker = () => {
    setPicker(true);
    octoSay("Which class are you in? Tap your class!", { speak: true, hold: 9000 });
  };
  return (
    <section ref={heroRef} className="jo-hero relative isolate overflow-hidden" aria-labelledby="jo-hero-title">
      <HeroBackdrop />

      <div className="jo-shell jo-hero-inner relative z-10 grid items-center gap-10 pb-28 pt-10 lg:gap-2 lg:pb-24 lg:pt-6">
        <div className="jo-hero-copy relative z-20">
          <span className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-[#0E2747] shadow-[0_10px_30px_-14px_rgba(20,51,94,.35)] ring-1 ring-ink/5 sm:text-[17px]">
            <Star size={20} strokeWidth={2.4} className="shrink-0 text-[#F26A10]" />
            Learning + school management, in one universe
          </span>

          <h1 id="jo-hero-title" className="jo-hero-title mt-7 font-display">
            <span className="block text-[#0E2747]">Big adventures.</span>
            <span className="block"><span className="text-[#F26A10]">Bright</span> <span className="text-[#1A66D9]">little minds.</span></span>
          </h1>

          <p className="mt-6 max-w-[480px] text-[17px] leading-[1.75] text-[#14335E]/70 sm:text-[19px]">
            KidoMatic brings immersive 3D learning worlds for ages 3–6, together with powerful school management — all in one platform.
          </p>

          <div className="relative mt-9 flex flex-wrap gap-4">
            <button type="button" onClick={() => (picker ? setPicker(false) : openPicker())} className="jo-cta jo-cta-primary"
              aria-expanded={picker} aria-controls="jo-class-picker">
              Start exploring <ArrowRight size={21} strokeWidth={2.6} />
            </button>
            <Link to="/worlds" className="jo-cta jo-cta-outline"><Play size={19} fill="currentColor" strokeWidth={0} /> Meet the worlds</Link>
            {picker && <ClassPicker onClose={closePicker} />}
          </div>

          <ul className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] font-medium text-[#14335E]/65 sm:text-[17px]">
            {TRUST.map(([icon, label], i) => (
              <li key={label} className="flex items-center gap-2.5">
                {i > 0 && <span className="mr-1.5 hidden h-1 w-1 rounded-full bg-[#14335E]/50 sm:block" aria-hidden="true" />}
                {icon}{label}
              </li>
            ))}
          </ul>
        </div>

        <div className="jo-hero-visual relative z-10">
          <HeroShowcase />
        </div>
      </div>
    </section>
  );
}

// "Start exploring" → pick a class; opens that class in the Worlds app (or the /worlds page
// when the app's URL isn't configured). School sign-up stays one link away.
function ClassPicker({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    el?.querySelector("a")?.focus({ preventScroll: true });
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    const onDown = (e) => { if (el && !el.contains(e.target) && !e.target.closest?.("[aria-controls='jo-class-picker']")) onClose(); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [onClose]);

  return (
    <div ref={ref} id="jo-class-picker" role="dialog" aria-label="Choose your class" className="jo-picker">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[20px] font-bold text-[#0E2747]">Who's exploring today?</p>
          <p className="text-[14px] text-[#14335E]/65">Pick your class to start your adventure.</p>
        </div>
        <button type="button" onClick={onClose} className="jo-picker-close" aria-label="Close"><X size={18} strokeWidth={2.6} /></button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {CLASSES.map((c, i) => {
          const inner = (
            <>
              <span className="jo-picker-emoji" aria-hidden="true">{c.emoji}</span>
              <span className="font-display text-[18px] font-bold leading-tight" style={{ color: c.color }}>{c.name}</span>
              <span className="text-[12px] font-semibold text-[#14335E]/60">{c.tag}</span>
            </>
          );
          const props = { className: "jo-picker-opt", style: { background: c.tint, "--c": c.color, animationDelay: `${i * 70}ms` } };
          return WORLDS_URL
            ? <a key={c.id} href={`${WORLDS_URL}/grade/${c.id}`} {...props}>{inner}</a>
            : <Link key={c.id} to="/worlds" {...props}>{inner}</Link>;
        })}
      </div>
      <p className="mt-4 text-center text-[13.5px] text-[#14335E]/65">
        Setting up a school? <Link to="/get-started" className="font-semibold text-[#1A66D9] hover:underline">Get started →</Link>
      </p>
    </div>
  );
}

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
      <div className="jo-par-far absolute inset-0">
        <div className="jo-cloud jo-cloud-drift" style={{ left: "38%", top: "6%", width: 340, height: 120, animationDuration: "46s" }} />
        <div className="jo-cloud jo-cloud-drift" style={{ right: "-4%", top: "38%", width: 420, height: 160, animationDuration: "58s", animationDelay: "-20s" }} />
        <div className="jo-cloud jo-cloud-drift" style={{ left: "-6%", top: "58%", width: 380, height: 150, animationDuration: "52s", animationDelay: "-9s" }} />
      </div>

      {RISING.map((b, i) => (
        <span key={i} className="jo-bubble jo-rise" style={{ left: b.left, bottom: -40, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />
      ))}
      <span className="jo-bubble jo-drift hidden lg:block" style={{ left: "15%", bottom: "9%", width: 52, height: 52, animationDelay: "-3s" }} />

      <svg className="absolute inset-x-0 bottom-0 h-[150px] w-full" viewBox="0 0 1440 150" preserveAspectRatio="none">
        <path d="M0 70 C 240 20 420 120 720 80 S 1200 30 1440 80 V150 H0Z" fill="#D6ECFA" />
        <path d="M0 105 C 300 70 520 140 820 108 S 1260 80 1440 110 V150 H0Z" fill="#E8F5FD" />
        <path d="M0 132 C 360 116 760 150 1440 128 V150 H0Z" fill="#ffffff" />
      </svg>

      <Plant className="absolute -bottom-3 -left-8 w-[120px] 2xl:w-[190px]" />
      <Plant className="absolute -bottom-4 -right-8 w-[130px] 2xl:w-[200px]" flip />
    </div>
  );
}
