import { Menu, Bell, Search } from "lucide-react";
import { useBranding } from "@/store/branding";
import ProfileMenu from "./ProfileMenu";
import Chip from "@/components/ui/Chip";

export default function TopBar({ onMenu }) {
  const b = useBranding();
  return (
    <header className="glass rounded-xl2 shadow-glass px-4 sm:px-5 h-16 flex items-center gap-3 mb-5">
      <button onClick={onMenu} className="lg:hidden text-navy/60 hover:text-navy"><Menu size={22} /></button>
      <div className="min-w-0">
        <p className="font-display text-navy text-[17px] leading-tight truncate">{b?.school?.name}</p>
        <p className="text-[11px] text-navy/50 truncate">{b?.school?.branch} · {b?.school?.board} · {b?.school?.session}</p>
      </div>
      <div className="flex-1" />
      <div className="hidden md:flex relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
        <input placeholder="Search students, invoices…" className="h-10 w-64 rounded-xl bg-white/60 border border-navy/10 pl-9 pr-3 text-sm outline-none focus:border-royal/40 text-navy placeholder:text-navy/40" />
      </div>
      <Chip>Term 1</Chip>
      <button className="relative grid place-items-center h-10 w-10 rounded-xl hover:bg-white/60 text-navy/60 hover:text-navy">
        <Bell size={19} /><span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-coral ring-2 ring-white" />
      </button>
      <ProfileMenu />
    </header>
  );
}
