import Octo from "./Octo";

// Polished "KidoMatic — Parent App" mockup. screen: today | learn | fees
export default function PhoneMock({ screen = "today", className = "", scale = 1 }) {
  return (
    <div className={className} style={{ width: 270 * scale }}>
      <div className="relative rounded-[2.6rem] p-[10px]" style={{ background: "#0D2545", boxShadow: "0 30px 70px -20px rgba(13,37,69,.55)" }}>
        <div className="absolute left-1/2 -translate-x-1/2 top-[10px] h-6 w-32 bg-[#0D2545] rounded-b-2xl z-20" />
        <div className="relative rounded-[2.1rem] overflow-hidden bg-[#F6FAFD]" style={{ height: 540 }}>
          <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[10px] font-semibold text-ink/70"><span>9:41</span><span>📶 🔋</span></div>
          {screen === "today" && <Today />}
          {screen === "learn" && <Learn />}
          {screen === "fees" && <Fees />}
          <TabBar active={screen} />
        </div>
      </div>
    </div>
  );
}
function Header({ title }) {
  return (
    <div className="px-4 pt-2 pb-5 text-white" style={{ background: "radial-gradient(120% 120% at 80% 0%, #1b4a86, #14335E 55%, #0D2545)" }}>
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 rounded-2xl bg-white grid place-items-center ring-1 ring-white/20"><Octo size={30} /></div>
        <div className="leading-tight"><p className="text-[10px] text-white/60">Blue Lagoon · LKG-A</p><p className="font-display text-[15px]">Aarav Menon</p></div>
        <span className="ml-auto text-[10px] bg-white/15 rounded-full px-2 py-1">🔔 2</span>
      </div>
      <p className="mt-3 text-[13px] text-white/85 font-display">{title}</p>
    </div>
  );
}
function Today() {
  return (
    <div className="pb-16">
      <Header title="Good morning! Here's Aarav's day 🐙" />
      <div className="px-4 -mt-3">
        <div className="rounded-2xl bg-white shadow-sm p-3 flex items-center gap-3 ring-1 ring-ink/5">
          <div className="relative h-12 w-12">
            <svg viewBox="0 0 36 36" className="h-12 w-12"><circle cx="18" cy="18" r="16" fill="none" stroke="#EAF6F8" strokeWidth="4" /><circle cx="18" cy="18" r="16" fill="none" stroke="#3FB6C9" strokeWidth="4" strokeDasharray="100" strokeDashoffset="8" strokeLinecap="round" transform="rotate(-90 18 18)" /></svg>
            <span className="absolute inset-0 grid place-items-center text-[10px] font-bold text-ink">92%</span>
          </div>
          <div className="flex-1"><p className="text-[11px] text-ink/50">Attendance</p><p className="font-display text-ink text-sm">Present ✓ · in at 8:42</p></div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-1">On time</span>
        </div>
      </div>
      <div className="px-4 mt-3">
        <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wide mb-2">Today's journey</p>
        <div className="space-y-2">
          <Lesson emoji="🐄" title="Farm Animals" meta="done" pct={100} />
          <Lesson emoji="🔢" title="Numbers 1–10" meta="done" pct={100} />
          <Lesson emoji="🎨" title="Shapes & Colours" meta="up next" pct={35} />
        </div>
      </div>
      <div className="px-4 mt-3 grid grid-cols-3 gap-2"><Stat n="12" l="stars ⭐" /><Stat n="6🔥" l="day streak" /><Stat n="A+" l="this week" /></div>
    </div>
  );
}
const Lesson = ({ emoji, title, meta, pct }) => (
  <div className="rounded-2xl bg-white p-2.5 ring-1 ring-ink/5 flex items-center gap-2.5">
    <div className="h-9 w-9 rounded-xl grid place-items-center text-lg" style={{ background: "#EAF6F8" }}>{emoji}</div>
    <div className="flex-1"><p className="text-[12px] font-semibold text-ink">{title}</p><div className="h-1.5 bg-ink/8 rounded-full mt-1 overflow-hidden"><div className="h-full rounded-full" style={{ width: pct + "%", background: pct === 100 ? "#3FB6C9" : "#E85410" }} /></div></div>
    <span className="text-[10px] text-ink/45">{meta}</span>
  </div>
);
const Stat = ({ n, l }) => <div className="rounded-2xl bg-white ring-1 ring-ink/5 p-2 text-center"><p className="font-display text-ink text-base leading-none">{n}</p><p className="text-[9px] text-ink/50 mt-1">{l}</p></div>;
function Learn() {
  return (
    <div className="pb-16">
      <Header title="Explore today's worlds 🌊" />
      <div className="px-4 mt-2 grid grid-cols-2 gap-2.5">
        {[["🌊", "Ocean", "#3FB6C9"], ["🐄", "Farm", "#8FBF5B"], ["🏡", "Town", "#1651A3"], ["🌸", "Garden", "#E85410"]].map(([e, t, c]) => (
          <div key={t} className="rounded-2xl p-3 text-white" style={{ background: c }}><div className="text-2xl">{e}</div><p className="font-display text-sm mt-1">{t}</p><p className="text-[9px] text-white/80">Tap to play</p></div>
        ))}
      </div>
      <div className="px-4 mt-3 rounded-2xl bg-white ring-1 ring-ink/5 p-3"><p className="text-[11px] font-bold text-ink/50 uppercase">Weekly goal</p><div className="flex items-center gap-2 mt-1"><div className="h-2 flex-1 bg-ink/8 rounded-full overflow-hidden"><div className="h-full bg-sun rounded-full" style={{ width: "70%" }} /></div><span className="text-[11px] font-bold text-ink">7/10</span></div></div>
    </div>
  );
}
function Fees() {
  return (
    <div className="pb-16">
      <Header title="Fees & payments 💳" />
      <div className="px-4 -mt-3">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-ink/5 p-4"><p className="text-[11px] text-ink/50">Amount due · Term 1</p><p className="font-display text-2xl text-ink">₹12,500</p><p className="text-[10px] text-coral">Due 15 Aug 2026</p><button className="w-full mt-3 rounded-xl py-2.5 text-white font-display text-sm" style={{ background: "#E85410" }}>Pay now · UPI / Card</button></div>
      </div>
      <div className="px-4 mt-3"><p className="text-[11px] font-bold text-ink/50 uppercase mb-2">History</p>
        {[["Admission fee", "₹25,000"], ["Transport · Jul", "₹1,800"], ["Books & kit", "₹3,200"]].map(([t, a]) => (
          <div key={t} className="flex justify-between items-center bg-white rounded-xl ring-1 ring-ink/5 px-3 py-2 mb-1.5"><span className="text-[12px] text-ink/70">{t}</span><span className="text-[11px] text-emerald-600 font-semibold">{a} · Paid</span></div>
        ))}
      </div>
    </div>
  );
}
function TabBar({ active }) {
  const tabs = [["today", "🏠", "Home"], ["learn", "🐙", "Learn"], ["fees", "💳", "Fees"], ["more", "⋯", "More"]];
  return <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-ink/8 flex justify-around py-2">{tabs.map(([k, e, l]) => <div key={k} className="flex flex-col items-center gap-0.5"><span className={`text-base ${active === k ? "" : "opacity-40 grayscale"}`}>{e}</span><span className={`text-[9px] ${active === k ? "text-royal font-bold" : "text-ink/40"}`}>{l}</span></div>)}</div>;
}
