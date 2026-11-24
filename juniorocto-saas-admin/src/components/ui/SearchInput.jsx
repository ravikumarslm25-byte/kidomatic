import { Search } from "lucide-react";
export default function SearchInput({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="h-10 w-full sm:w-64 rounded-xl bg-white/60 border border-navy/10 pl-9 pr-3 text-sm text-navy placeholder:text-navy/40 outline-none focus:border-royal/40" />
    </div>
  );
}
