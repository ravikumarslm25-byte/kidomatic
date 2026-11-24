import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import MascotVideo from "./MascotVideo";
import { useReducedMotion, useSparkles } from "./Sparkles";
import { canSpeak, isMuted, say, setMuted } from "./voice";
import { onOctoSay } from "./octoBus";

// Octo on the homepage hero. His body is the dancing mascot video (same one the
// Worlds app uses); this file gives him a life around it: gentle drift / bob /
// sway on separate timings, a lean toward the cursor, a hop + sparkles + a new
// line when tapped, and an occasional welcome wiggle.
//
// Layers (outer → inner): lean (pointer) → drift → float → sway → react (hop / hello) → button.
// Octo sits behind the phone in the showcase, so the stage is placed in real
// pixels from the showcase's scale and painted under the scaled canvas.

const GREETING = "Hi, little explorer! Ready to play?";
const TAP_LINES = [
  "Wheee! You found me!",
  "I have eight arms for eight big hugs!",
  "Let's count! One, two, three, four, five!",
  "Shall we visit the farm today?",
  "You're a superstar explorer!",
  "Bubbles! Pop, pop, pop!",
  "Can you wave back at me?",
];

// where Octo stands on the showcase's design canvas
const SPOT = { left: 10, top: 170, width: 230 };
const BUBBLE_BOTTOM = 160; // design y the bubble's tail points down to
const PHONE_EDGE = 136;    // design x of the phone's left edge beside the bubble — the bubble ends before it

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function HeroMascot({ scale, compact, canvasH }) {
  const reduce = useReducedMotion();
  const [msg, setMsg] = useState(GREETING);
  const [open, setOpen] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [mute, setMute] = useState(isMuted);
  const [sparkles, fire] = useSparkles();
  const leanRef = useRef(null);
  const reactRef = useRef(null);
  const btnRef = useRef(null);
  const hideT = useRef(0);
  const line = useRef(0);

  const show = useCallback((text, hold = 7000) => {
    setMsg(text);
    setOpen(true);
    clearTimeout(hideT.current);
    hideT.current = setTimeout(() => setOpen(false), hold);
  }, []);

  // one-off reactions restart even if one is already playing
  const react = useCallback((kind) => {
    const el = reactRef.current;
    if (!el || reduce) return;
    el.classList.remove("is-hop", "is-hello");
    void el.offsetWidth;
    el.classList.add(kind);
  }, [reduce]);

  useEffect(() => {
    const el = reactRef.current;
    if (!el) return;
    const end = (e) => { if (e.target === el) el.classList.remove("is-hop", "is-hello"); };
    el.addEventListener("animationend", end);
    return () => el.removeEventListener("animationend", end);
  }, []);

  // greet once (text only — speech waits for a tap), then wave hello now and then
  useEffect(() => {
    const t = setTimeout(() => { show(GREETING, 8000); react("is-hello"); }, 1200);
    const wave = setInterval(() => { if (!document.hidden) react("is-hello"); }, 14000);
    return () => { clearTimeout(t); clearInterval(wave); clearTimeout(hideT.current); };
  }, [show, react]);

  // the world cards and class picker talk through Octo
  useEffect(() => onOctoSay(({ text, speak, bubble = true, hold }) => {
    if (bubble) show(text, hold);
    react("is-hop");
    if (speak && !isMuted()) say(text);
  }), [show, react]);

  // lean toward the cursor and perk up when it comes close (mouse / pen only)
  useEffect(() => {
    if (reduce || !window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0, px = 0, py = 0, near = false;
    const apply = () => {
      raf = 0;
      const btn = btnRef.current, lean = leanRef.current;
      if (!btn || !lean) return;
      const r = btn.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      const range = Math.max(480, r.width * 3);
      lean.style.setProperty("--lx", clamp(dx / range, -1, 1).toFixed(3));
      lean.style.setProperty("--ly", clamp(dy / range, -1, 1).toFixed(3));
      const isNear = Math.hypot(dx, dy) < r.width * 0.85;
      if (isNear !== near) { near = isNear; lean.classList.toggle("is-near", near); }
    };
    const onMove = (e) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(apply); };
    const onLeave = () => {
      const lean = leanRef.current;
      if (!lean) return;
      lean.style.setProperty("--lx", "0"); lean.style.setProperty("--ly", "0");
      near = false; lean.classList.remove("is-near");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const onTap = () => {
    const text = TAP_LINES[line.current++ % TAP_LINES.length];
    show(text);
    react("is-hop");
    fire();
    setTapped(true);
    if (!mute) say(text);
  };

  const toggleMute = () => { setMuted(!mute); setMute(!mute); };

  // The bubble sits left of the phone. How far left it may go depends on the room
  // beside the showcase (none on single-column layouts), so measure it.
  const bubbleRef = useRef(null);
  const [room, setRoom] = useState(0);
  useLayoutEffect(() => {
    const host = bubbleRef.current?.offsetParent;
    if (!host) return;
    const measure = () => setRoom(Math.max(0, host.getBoundingClientRect().left - 8));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [scale]);
  const phoneEdge = PHONE_EDGE * scale;
  const bubbleW = Math.min(clamp(190 * scale, 150, 210), phoneEdge + room);
  const bubbleLeft = Math.max(phoneEdge - bubbleW, -room);
  const replay = () => { say(msg, { force: true }); react("is-hop"); };

  const muteBtn = canSpeak && (
    <button type="button" onClick={toggleMute} className="jo-octo-sound" aria-pressed={mute}
      aria-label={mute ? "Turn Octo's voice on" : "Mute Octo's voice"} title={mute ? "Voice off" : "Voice on"}>
      {mute ? <VolumeX size={17} strokeWidth={2.4} /> : <Volume2 size={17} strokeWidth={2.4} />}
    </button>
  );

  return (
    <>
      <div className="jo-octo-stage absolute z-0" style={{ left: SPOT.left * scale, top: SPOT.top * scale, width: SPOT.width * scale }}>
        <div ref={leanRef} className="jo-octo-lean">
          <div className="jo-octo-drift">
            <div className="jo-octo-float">
              <div className="jo-octo-sway">
                <div ref={reactRef} className="jo-octo-react">
                  <button ref={btnRef} type="button" onClick={onTap} className="jo-octo-btn" aria-label="Octo the octopus. Tap me for a surprise!">
                    <MascotVideo className="w-full" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {sparkles}
        </div>
        {!compact && (
          <div className="jo-octo-tools">
            {muteBtn}
            {!tapped && <span className="jo-octo-hint">Tap the octopus<br />for a surprise!</span>}
          </div>
        )}
      </div>

      <div
        ref={bubbleRef}
        role="status"
        aria-live="polite"
        className={`jo-octo-bubble ${compact ? "is-compact" : open ? "is-open" : ""} ${bubbleW < 150 ? "is-narrow" : ""}`}
        style={compact ? undefined : { left: bubbleLeft, bottom: (canvasH - BUBBLE_BOTTOM) * scale, width: bubbleW }}
      >
        <p>{msg}</p>
        {compact && !tapped && <p className="jo-octo-bubble-hint">Tap Octo for a surprise!</p>}
        {canSpeak && (
          <span className="jo-octo-bubble-tools">
            <button type="button" onClick={replay} className="jo-octo-hear" aria-label="Hear Octo say it">
              <Volume2 size={15} strokeWidth={2.5} /> Hear it
            </button>
            {compact && muteBtn}
          </span>
        )}
      </div>
    </>
  );
}
