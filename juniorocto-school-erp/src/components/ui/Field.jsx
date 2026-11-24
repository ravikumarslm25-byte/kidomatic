// Unified form control: text/number/date/email/phone/select/textarea/money.
import RefSelect from "./RefSelect";
import FileUpload from "./FileUpload";
export default function Field({ label, name, type = "text", value, onChange, options = [], required, placeholder, resource, labelKey, valueKey }) {
  const set = (v) => onChange(name, v);
  const base = "h-10 w-full rounded-xl bg-white/70 border border-navy/12 px-3 text-sm text-navy outline-none focus:border-royal/45 placeholder:text-navy/35";
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-navy/60 mb-1.5">{label}{required && <span className="text-coral"> *</span>}</span>
      {type === "file" ? (
        <FileUpload value={value} onChange={(v) => set(v)} folder={placeholder || "kyc"} />
      ) : type === "toggle" ? (
        <button type="button" onClick={() => set(!value)} className={`mt-1 inline-flex items-center gap-2 h-10 px-1 ${value ? "" : ""}`}>
          <span className={`w-11 h-6 rounded-full transition relative ${value ? "bg-royal" : "bg-navy/20"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${value ? "left-[22px]" : "left-0.5"}`} /></span>
          <span className="text-sm text-navy/70">{value ? "Enabled" : "Disabled"}</span>
        </button>
      ) : type === "ref" || type === "refMulti" ? (
        <RefSelect resource={resource} labelKey={labelKey} valueKey={valueKey} multiple={type === "refMulti"} value={value} onChange={(v) => set(v)} placeholder={placeholder || "Select…"} />
      ) : type === "select" ? (
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
