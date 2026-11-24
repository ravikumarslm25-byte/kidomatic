import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/store/auth";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const name = user?.name || "User";
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5 rounded-xl pl-1 pr-2.5 py-1 hover:bg-white/60 transition">
        <Avatar name={name} size={34} />
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-sm font-semibold text-navy">{name}</p>
          <p className="text-[11px] text-navy/50">{user?.role || "Staff"}</p>
        </div>
      </button>
      {open && (<>
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
        <div className="absolute right-0 top-12 z-20 w-52 glass rounded-2xl shadow-glass py-1.5 animate-pop">
          <button onClick={() => { setOpen(false); nav("/profile"); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-navy/80 hover:bg-white/60"><User size={15} /> Profile</button>
          <div className="my-1 border-t border-navy/8" />
          <button onClick={() => { setOpen(false); logout(); nav("/app/login"); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-coral-600 hover:bg-coral-100"><LogOut size={15} /> Log out</button>
        </div>
      </>)}
    </div>
  );
}
