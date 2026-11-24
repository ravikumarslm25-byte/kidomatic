// Unified form control: text/number/date/email/phone/select/textarea/money.
export default function Field({ label, name, type = "text", value, onChange, options = [], required, placeholder }) {
  const set = (v) => onChange(name, v);
  const base = "h-10 w-full rounded-xl bg-white/70 border border-navy/12 px-3 text-sm text-navy outline-none focus:border-royal/45 placeholder:text-navy/35";
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-navy/60 mb-1.5">{label}{required && <span className="text-coral"> *</span>}</span>
      {type === "select" ? (
        <select className={base} value={value ?? ""} onChange={(e) => set(e.target.value)}>
          <option value="" disabled>Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea rows={3} className="w-full rounded-xl bg-white/70 border border-navy/12 px-3 py-2 text-sm text-navy outline-none focus:border-royal/45"
          value={value ?? ""} onChange={(e) => set(e.target.value)} placeholder={placeholder} />
      ) : (
        <div className="relative">
          {type === "money" && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40 text-sm">₹</span>}
          <input
            className={type === "money" ? base + " pl-7" : base}
            type={type === "money" ? "number" : type === "phone" ? "tel" : type}
            value={value ?? ""} onChange={(e) => set(e.target.value)}
            placeholder={placeholder} />
        </div>
      )}
    </label>
  );
}
