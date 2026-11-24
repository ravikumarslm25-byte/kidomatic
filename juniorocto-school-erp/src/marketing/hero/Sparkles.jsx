import { useCallback, useEffect, useRef, useState } from "react";

export function useReducedMotion() {
  const [reduce, setReduce] = useState(() => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const on = () => setReduce(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduce;
}

const COLORS = ["#FFC83D", "#FF8A3D", "#4D95FF", "#FF6FA8", "#34C77B", "#A57BFF"];
const RAYS = 9;

/** A small sparkle burst centred in the nearest positioned parent. Returns [node, fire]. */
export function useSparkles() {
  const reduce = useReducedMotion();
  const [bursts, setBursts] = useState([]);
  const timers = useRef(new Set());
  const seq = useRef(0);

  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current.clear(); }, []);

  const fire = useCallback(() => {
    if (reduce) return;
    const id = ++seq.current;
    setBursts((b) => [...b.slice(-2), id]);
    const t = setTimeout(() => { setBursts((b) => b.filter((x) => x !== id)); timers.current.delete(t); }, 900);
    timers.current.add(t);
  }, [reduce]);

  const node = bursts.map((id) => (
    <span key={id} className="jo-sparkles" aria-hidden="true">
      {Array.from({ length: RAYS }, (_, i) => (
        <i key={i} style={{ "--a": `${(360 / RAYS) * i + id * 17}deg`, "--d": `${46 + ((i * 7 + id) % 4) * 9}px`, background: COLORS[(i + id) % COLORS.length] }} />
      ))}
    </span>
  ));
  return [node, fire];
}
