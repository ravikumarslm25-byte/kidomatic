import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, BatteryFull, Wifi, Signal, Star, School, House, Globe2, User, ArrowRight,
  LayoutDashboard, Users, LayoutGrid, FileBarChart2, Settings, ShieldCheck, UserRound, UserPlus, ChevronDown,
} from "lucide-react";
import octo from "../assets/logo-icon.png";
import { FarmArt, NumberArt, OceanArt, ShapeArt, StarShape } from "./HeroArt";
import HeroMascot from "./HeroMascot";
import { useSparkles } from "./Sparkles";
import { octoSay } from "./octoBus";
import { playSound } from "./voice";

// The composition is laid out on a fixed design canvas and scaled to fit its column,
// so the phone / dashboard / cards keep their exact proportions at every width.
const CANVAS_W = 960;
const CANVAS_H = 700;

export const WORLDS = [
  { key: "farm", title: "Farm Friends", done: 3, Art: FarmArt, color: "#34B260", card: "linear-gradient(160deg,#4CC973 0%,#2E9E52 100%)", say: "Moo! Let's explore the farm!", sound: "cow" },
  { key: "numbers", title: "Number Quest", done: 2, Art: NumberArt, color: "#2F7BF0", card: "linear-gradient(160deg,#4D95FF 0%,#1F5FD6 100%)", say: "Let's count together!" },
  { key: "shapes", title: "Shape Safari", done: 1, Art: ShapeArt, color: "#8B5CF6", card: "linear-gradient(160deg,#A57BFF 0%,#6C3FD8 100%)", say: "Let's discover shapes!" },
];
const PICK_MS = 1700; // how long a tapped card celebrates before opening the worlds page

function useFitScale(designWidth) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / designWidth));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);
  return [ref, scale];
}

// Below this scale the speech bubble no longer fits beside Octo, so it moves under the showcase.
const COMPACT_BELOW = 0.6;
const COMPACT_EXTRA = 104;

export default function HeroShowcase() {
  const [ref, scale] = useFitScale(CANVAS_W);
  const compact = scale < COMPACT_BELOW;
  return (
    <div ref={ref} className="relative w-full" style={{ height: CANVAS_H * scale + (compact ? COMPACT_EXTRA : 0) }}>
      {/* Octo is painted first so the phone (in the canvas below) stays in front of him */}
      <HeroMascot scale={scale} compact={compact} canvasH={CANVAS_H} />

      <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale})` }}>
        <div aria-hidden="true" className="pointer-events-auto">
          {/* decorative bubbles + stars inside the composition (tap to pop / spin) */}
          <div className="jo-par-near">
            <TapBubble style={{ left: 20, top: 40, width: 50, height: 50 }} />
            <TapBubble style={{ left: 870, top: 10, width: 54, height: 54, animationDelay: "-2s" }} />
            <TapBubble style={{ left: 60, top: 535, width: 40, height: 40, animationDelay: "-4s" }} />
            <TapBubble style={{ left: 10, top: 645, width: 24, height: 24, animationDelay: "-1s" }} />
            <TapStar style={{ left: 88, top: 92, width: 36 }} />
            <TapStar style={{ left: 925, top: 52, width: 30 }} delay="-1.2s" />
            <TapStar style={{ left: 118, top: 585, width: 30 }} delay="-2.1s" />
          </div>

          <DashboardPreview />

          <div className="absolute z-20" style={{ left: 168, top: 18, width: 300 }}>
            <div className="jo-phone-float"><PhoneMockup /></div>
          </div>
        </div>

        {/* real links — the three learning worlds */}
        <WorldCard world={WORLDS[0]} style={{ left: 330, top: 468 }} tilt={5} />
        <WorldCard world={WORLDS[1]} style={{ left: 542, top: 478 }} tilt={-4} />
        <WorldCard world={WORLDS[2]} style={{ left: 752, top: 472 }} tilt={-5} />
      </div>
    </div>
  );
}

// a bubble that pops (and re-forms) when tapped
function TapBubble({ style }) {
  const [popped, setPopped] = useState(false);
  return (
    <span
      className={`jo-bubble jo-drift jo-tappable ${popped ? "is-popped" : ""}`}
      style={style}
      onPointerDown={() => setPopped(true)}
      onAnimationEnd={(e) => { if (e.animationName === "jo-pop") setPopped(false); }}
    />
  );
}

// a twinkling star that spins when tapped
function TapStar({ style, delay }) {
  const [spin, setSpin] = useState(false);
  return (
    <span
      className={`jo-tappable absolute block ${spin ? "is-spun" : ""}`}
      style={style}
      onPointerDown={() => setSpin(true)}
      onAnimationEnd={(e) => { if (e.animationName === "jo-star-spin") setSpin(false); }}
    >
      <StarShape className="jo-twinkle block w-full" style={delay ? { animationDelay: delay } : undefined} />
    </span>
  );
}

/* ───────────────────────── Phone ───────────────────────── */

function MiniLogo({ size = 17 }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <img src={octo} alt="" className="block" style={{ width: size * 1.55, height: size * 1.55 }} />
      <span className="font-display font-bold leading-none" style={{ fontSize: size }}>
        <span className="text-[#1C4E9A]">Junior</span><span className="text-[#F26A10]">Octo</span>
      </span>
    </span>
  );
}

function Progress({ done, total = 5, color, track = "#E8EEF6", height = 5 }) {
  return (
    <div className="flex-1 rounded-full overflow-hidden" style={{ background: track, height }}>
      <div className="h-full rounded-full" style={{ width: `${(done / total) * 100}%`, background: color }} />
    </div>
  );
}

function PhoneMockup() {
  const minis = [...WORLDS, { key: "ocean", title: "Ocean Pals", done: 0, Art: OceanArt, color: "#22B8CF" }];
  return (
    <div className="relative" style={{ transform: "rotate(-5deg)" }}>
      {/* side buttons */}
      <span className="absolute -left-[3px] top-[120px] h-12 w-[4px] rounded-l bg-[#0B1830]" />
      <span className="absolute -left-[3px] top-[180px] h-16 w-[4px] rounded-l bg-[#0B1830]" />
      <span className="absolute -right-[3px] top-[150px] h-20 w-[4px] rounded-r bg-[#0B1830]" />
      <div className="relative rounded-[48px] p-[11px]" style={{ background: "linear-gradient(145deg,#2A3F66 0%,#12213F 45%,#0A152B 100%)", boxShadow: "0 40px 70px -24px rgba(13,37,69,.55), 0 18px 30px -18px rgba(13,37,69,.45), inset 0 1px 0 rgba(255,255,255,.18)" }}>
        <div className="relative overflow-hidden rounded-[38px] bg-white" style={{ height: 620 }}>
          <span className="absolute left-1/2 top-[10px] z-20 h-[24px] w-[92px] -translate-x-1/2 rounded-full bg-[#0A152B]" />
          {/* glass reflection */}
          <span className="pointer-events-none absolute inset-0 z-30" style={{ background: "linear-gradient(115deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 32%)" }} />

          <div className="flex items-center justify-between px-6 pt-[13px] text-[11px] font-bold text-ink">
            <span>9:41</span>
            <span className="flex items-center gap-1"><Signal size={12} strokeWidth={2.6} /><Wifi size={12} strokeWidth={2.6} /><BatteryFull size={15} strokeWidth={2.2} /></span>
          </div>

          <div className="px-[18px] pt-4">
            <div className="flex items-center justify-between">
              <MiniLogo size={16} />
              <div className="flex items-center gap-2.5">
                <span className="relative text-ink"><Bell size={17} strokeWidth={2.2} /><span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#F26A10] ring-2 ring-white" /></span>
                <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#FFE1C7] text-[17px] ring-2 ring-white shadow">👦🏽</span>
              </div>
            </div>

            <p className="mt-4 font-display text-[23px] font-bold leading-tight text-[#0E2747]">Hi, Aarav! <span className="inline-block jo-wave-hand">👋</span></p>
            <p className="text-[11.5px] text-ink/60">Let's explore, learn and grow!</p>

            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-[#FFF3DC] px-3 py-2.5">
                <div className="flex items-center gap-1.5"><Star size={19} fill="#FFB800" stroke="#F5A000" /><span className="font-display text-[20px] font-bold text-[#0E2747] leading-none">3</span></div>
                <p className="mt-1 text-[10.5px] font-semibold text-ink/70">Worlds completed</p>
              </div>
              <div className="rounded-2xl bg-[#E3EFFF] px-3 py-2.5">
                <div className="flex items-center gap-1.5"><School size={18} className="text-[#2F6FE4]" strokeWidth={2.3} /><span className="font-display text-[20px] font-bold text-[#0E2747] leading-none">12</span></div>
                <p className="mt-1 text-[10.5px] font-semibold text-ink/70">Days at school</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="font-display text-[15px] font-bold text-[#0E2747]">My Learning Worlds</p>
              <span className="flex items-center gap-0.5 text-[10.5px] font-semibold text-[#1A66D9]">See all <ArrowRight size={11} /></span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2.5">
              {minis.map(({ key, title, done, Art, color }) => (
                <div key={key} className="rounded-2xl bg-white p-1.5 shadow-[0_6px_16px_-8px_rgba(20,51,94,.35)] ring-1 ring-ink/5">
                  <Art className="block h-[72px] w-full rounded-xl" />
                  <p className="mt-1.5 px-1 font-display text-[11.5px] font-bold text-[#0E2747]">{title}</p>
                  <div className="flex items-center gap-1.5 px-1 pb-1"><Progress done={done} color={color} /><span className="text-[9.5px] font-semibold text-ink/60">{done}/5</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 border-t border-ink/5 bg-white/95 px-4 pb-4 pt-2">
            <div className="flex justify-around">
              {[[House, "Home", true], [Globe2, "Worlds"], [School, "School"], [User, "Profile"]].map(([Icon, label, active]) => (
                <span key={label} className={`flex flex-col items-center gap-0.5 text-[9.5px] font-semibold ${active ? "text-[#1A66D9]" : "text-ink/45"}`}>
                  <Icon size={18} strokeWidth={2.3} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />{label}
                </span>
              ))}
            </div>
            <span className="mx-auto mt-2 block h-[4px] w-24 rounded-full bg-ink/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── ERP dashboard ───────────────────────── */

const STATS = [
  [Users, "128", "Total Students", "#E3EEFF", "#2F6FE4"],
  [LayoutGrid, "6", "Classes", "#EFE6FF", "#8B5CF6"],
  [ShieldCheck, "96%", "Attendance", "#DDF7EA", "#1FA463"],
  [UserRound, "12", "Teachers", "#FFE9DA", "#F07B2C"],
];
const ACTIVITY = [
  ["👦🏽", "#FFE1C7", "Aarav completed Farm Friends", "2 min ago", "star"],
  ["👧🏻", "#FDE2EC", "Diya joined Kindergarten", "8 min ago", "user"],
  ["👦🏻", "#FFE9C2", "Rohan completed Number Quest", "12 min ago", "star"],
  [null, "#E3EEFF", "New enrollment: 5 students", "24 min ago", "user"],
];

function DashboardPreview() {
  return (
    <div className="absolute z-0" style={{ left: 440, top: 30, width: 500, transform: "perspective(1600px) rotateY(-6deg) rotate(2.5deg)", transformOrigin: "left center" }}>
      <div className="rounded-[28px] bg-[#DCEBFA]/80 p-3 shadow-[0_40px_80px_-30px_rgba(20,51,94,.45)] ring-1 ring-white backdrop-blur">
        <div className="overflow-hidden rounded-[20px] bg-white">
          <div className="flex items-center justify-between border-b border-ink/5 px-4 py-3">
            <MiniLogo size={13} />
            <span className="flex items-center gap-2 text-[10px] font-semibold text-ink/70">Admin <ChevronDown size={11} /><span className="grid h-6 w-6 place-items-center rounded-full bg-[#FFE1C7] text-[13px]">🧑🏽‍🏫</span></span>
          </div>
          <div className="flex">
            <div className="w-[112px] shrink-0 space-y-1 border-r border-ink/5 p-2.5">
              {[[LayoutDashboard, "Dashboard", true], [Users, "Students"], [LayoutGrid, "Classes"], [FileBarChart2, "Reports"], [Settings, "Settings"]].map(([Icon, label, active]) => (
                <span key={label} className={`flex items-center gap-2 rounded-lg px-2 py-[7px] text-[10.5px] font-semibold ${active ? "bg-[#E4EEFD] text-[#1A66D9]" : "text-ink/60"}`}><Icon size={13} strokeWidth={2.3} />{label}</span>
              ))}
            </div>
            <div className="min-w-0 flex-1 p-3.5">
              <p className="font-display text-[15px] font-bold text-[#0E2747]">School Management</p>
              <div className="mt-2.5 grid grid-cols-4 gap-2">
                {STATS.map(([Icon, n, label, bg, fg]) => (
                  <div key={label} className="rounded-xl p-2 ring-1 ring-ink/8">
                    <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: bg, color: fg }}><Icon size={14} strokeWidth={2.4} /></span>
                    <p className="mt-1.5 font-display text-[16px] font-bold leading-none text-[#0E2747]">{n}</p>
                    <p className="mt-1 text-[8.5px] font-medium text-ink/55">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] font-bold text-[#0E2747]">Recent Activity</p>
                <span className="flex items-center gap-0.5 text-[9px] font-semibold text-[#1A66D9]">View all <ArrowRight size={9} /></span>
              </div>
              <div className="mt-1 divide-y divide-ink/5">
                {ACTIVITY.map(([face, bg, text, time, kind]) => (
                  <div key={text} className="flex items-center gap-2.5 py-[7px]">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px]" style={{ background: bg }}>{face || <Users size={12} className="text-[#2F6FE4]" />}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-[9.5px] font-semibold text-ink/85">{text}</p><p className="text-[8px] text-ink/45">{time}</p></div>
                    {kind === "star" ? <Star size={12} fill="#FFB800" stroke="#F5A000" /> : <UserPlus size={12} className="text-[#2F6FE4]" strokeWidth={2.4} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── World cards ───────────────────────── */

function WorldCard({ world, style, tilt }) {
  const { key, title, done, Art, card } = world;
  const navigate = useNavigate();
  const [picked, setPicked] = useState(false);
  const [sparkles, fire] = useSparkles();
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // a tap celebrates (message, sparkles, Octo cheers) and then opens the worlds page;
  // modified clicks (new tab etc.) keep the plain link behaviour
  const onClick = (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (picked) return;
    setPicked(true);
    fire();
    if (world.sound) {
      playSound(world.sound);
      timers.current.push(setTimeout(() => octoSay(world.say, { speak: true, bubble: false }), 650));
    } else {
      octoSay(world.say, { speak: true, bubble: false });
    }
    timers.current.push(setTimeout(() => navigate("/worlds"), PICK_MS));
  };

  return (
    <div className="pointer-events-auto absolute z-30" style={{ ...style, width: 192, transform: `rotate(${tilt}deg)` }}>
      <span role="status" className={`jo-card-say ${picked ? "is-open" : ""}`}>{picked ? world.say : ""}</span>
      <div className={`jo-card-idle jo-card-idle-${key}`}>
      <Link
        to="/worlds"
        onClick={onClick}
        aria-label={`${title} — ${done} of 5 complete. Explore the worlds`}
        className={`jo-world-card jo-world-${key} group block rounded-[24px] p-[5px] ${picked ? "is-picked" : ""}`}
        style={{ background: card }}
      >
        <span className="absolute -right-2.5 -top-2.5 z-10 grid h-10 w-10 place-items-center rounded-full bg-[#FFD43B] shadow-[0_6px_14px_-4px_rgba(180,120,0,.6)] ring-[3px] ring-white/90">
          <Star size={19} fill="#fff" stroke="#fff" />
        </span>
        <span className="block overflow-hidden rounded-[19px] ring-2 ring-white/40">
          <Art className="block h-[122px] w-full transition-transform duration-500 group-hover:scale-[1.06]" />
        </span>
        <span className="block px-3 pb-3 pt-2.5">
          <span className="block font-display text-[19px] font-bold leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,.18)]">{title}</span>
          <span className="mt-2 flex items-center gap-2">
            <Progress done={done} color="#fff" track="rgba(255,255,255,.32)" height={7} />
            <span className="text-[13px] font-bold text-white">{done}/5</span>
          </span>
        </span>
        {sparkles}
      </Link>
      </div>
    </div>
  );
}
