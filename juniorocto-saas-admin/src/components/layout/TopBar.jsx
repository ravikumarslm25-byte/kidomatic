import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, ShieldCheck, User } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/store/auth";

export default function TopBar({ onMenu }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  return (
    <header className="glass rounded-xl2 shadow-glass px-4 sm:px-5 h-16 flex items-center gap-3 mb-5">
      <button onClick={onMenu} className="lg:hidden text-navy/60"><Menu size={22} /></button>
      <div className="flex items-center gap-2 min-w-0">
        <div className="grid place-items-center h-8 w-8 rounded-xl bg-royal-100 text-royal"><ShieldCheck size={17} /></div>
        <div className="min-w-0"><p className="font-display text-navy text-[16px] leading-tight truncate">HackGeniX · Master Admin</p><p className="text-[11px] text-navy/50">Platform control plane</p></div>
      </div>
      <div className="flex-1" />
      <div className="relative">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5 rounded-xl pl-1 pr-2.5 py-1 hover:bg-white/60">
          <Avatar name={user?.name || "Admin"} size={34} />
          <div className="hidden sm:block text-left leading-tight"><p className="text-sm font-semibold text-navy">{user?.name}</p><p className="text-[11px] text-navy/50">{user?.role || "Super Admin"}</p></div>
        </button>
        {open && (<>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-20 w-44 glass rounded-2xl shadow-glass py-1.5 animate-pop">
            <button onClick={() => { setOpen(false); nav("/profile"); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-navy hover:bg-white/60"><User size={15} /> My profile</button>
            <button onClick={() => { logout(); nav("/login"); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-coral-600 hover:bg-coral-100"><LogOut size={15} /> Sign out</button>
          </div>
        </>)}
      </div>
    </header>
  );
}
