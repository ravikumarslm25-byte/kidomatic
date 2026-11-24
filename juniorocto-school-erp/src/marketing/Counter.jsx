import { useEffect, useRef, useState } from "react";
// Count-up animation when scrolled into view.
export default function Counter({ to, suffix = "", prefix = "", className = "" }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect();
        const dur = 1400, t0 = performance.now();
        const tick = (t) => { const p = Math.min(1, (t - t0) / dur); setN(Math.round((1 - Math.pow(1 - p, 3)) * to)); if (p < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [to]);
  return <span ref={ref} className={className}>{prefix}{n.toLocaleString("en-IN")}{suffix}</span>;
}
