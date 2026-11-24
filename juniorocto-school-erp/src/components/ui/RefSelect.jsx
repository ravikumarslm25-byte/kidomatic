import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search } from "lucide-react";
import { useOptions } from "@/controllers/useOptions";

// Searchable dropdown that pulls options from another DB resource.
// The menu renders in a portal with fixed positioning, so it never gets
// clipped by a modal body / card overflow.
export default function RefSelect({ resource, labelKey = "name", valueKey, multiple = false, value, onChange, placeholder = "Select…" }) {
  const { options, loading } = useOptions(resource, { labelKey, valueKey });
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [rect, setRect] = useState(null);
  const btn = useRef(null);
  const panel = useRef(null);

  const place = () => { if (btn.current) setRect(btn.current.getBoundingClientRect()); };
  useLayoutEffect(() => { if (open) place(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!btn.current?.contains(e.target) && !panel.current?.contains(e.target)) setOpen(false); };
    const onScroll = () => place();
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => { document.removeEventListener("mousedown", onDoc); window.removeEventListener("scroll", onScroll, true); window.removeEventListener("resize", onScroll); };
  }, [open]);

  const sel = multiple ? (Array.isArray(value) ? value : []) : value;
  const labelFor = (v) => options.find((o) => o.value === v)?.label || v;
  const filtered = options.filter((o) => String(o.label).toLowerCase().includes(q.toLowerCase()));
  const pick = (v) => { if (multiple) { const s = new Set(sel); s.has(v) ? s.delete(v) : s.add(v); onChange([...s]); } else { onChange(v); setOpen(false); } };
  const shown = multiple ? (sel.length ? sel.map(labelFor).join(", ") : "") : (value ? labelFor(value) : "");

  // Decide whether to open upward if not enough room below
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const below = rect ? vh - rect.bottom : 400;
  const openUp = rect && below < 280 && rect.top > below;
  const menuStyle = rect ? {
    position: "fixed", left: rect.left, width: rect.width, zIndex: 10000,
    ...(openUp ? { bottom: vh - rect.top + 6 } : { top: rect.bottom + 6 }),
  } : {};

  return (
    <>
      <button type="button" ref={btn} onClick={() => setOpen((o) => !o)}
        className="h-10 w-full rounded-xl bg-white/70 border border-navy/12 px-3 text-sm text-left flex items-center justify-between gap-2 text-navy focus:border-royal/45 outline-none">
        <span className={`truncate ${shown ? "" : "text-navy/35"}`}>{shown || placeholder}</span>
        <ChevronDown size={15} className="text-navy/40 shrink-0" />
      </button>
      {open && createPortal(
        <div ref={panel} style={menuStyle} className="glass rounded-xl shadow-glass p-1 max-h-72 overflow-auto border border-navy/10 bg-white/95 backdrop-blur">
          <div className="flex items-center gap-2 px-2 py-1.5 border-b border-navy/8 mb-1 sticky top-0 bg-white/95">
            <Search size={13} className="text-navy/40" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full text-sm outline-none bg-transparent text-navy" />
          </div>
          {loading && <p className="px-3 py-2 text-xs text-navy/40">Loading…</p>}
          {!loading && filtered.length === 0 && <p className="px-3 py-2 text-xs text-navy/40">No {resource} found — create one first.</p>}
          {filtered.map((o) => {
            const on = multiple ? sel.includes(o.value) : value === o.value;
            return (
              <button type="button" key={o.value} onClick={() => pick(o.value)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-left ${on ? "bg-royal-100 text-royal" : "hover:bg-white/60 text-navy/80"}`}>
                <span className="truncate">{o.label}</span>{on && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>, document.body)}
    </>
  );
}
