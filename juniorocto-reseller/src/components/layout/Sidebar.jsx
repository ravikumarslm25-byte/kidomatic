import { NavLink } from "react-router-dom";
import { LayoutDashboard, School, Settings, Share2, Receipt, Ticket, BarChart3 } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { APP } from "@/config/app";
import { cn } from "@/lib/cn";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/referrals", label: "Referrals", icon: Share2 },
  { to: "/schools", label: "Schools", icon: School },
  { to: "/billing", label: "Billing", icon: Receipt },
  { to: "/offers", label: "Offers", icon: Ticket },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="glass-dark w-[248px] shrink-0 h-full flex flex-col rounded-none lg:rounded-3xl overflow-hidden">
      <div className="px-5 pt-5 pb-4"><Logo dark markSize={30} /></div>
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} onClick={onNavigate}
            className={({ isActive }) => cn("group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
              isActive ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5")}>
            {({ isActive }) => (<>
              {isActive && <span className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-white/10" />}
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-coral animate-pop" />}
              <n.icon size={18} className={cn("relative shrink-0", isActive && "text-coral")} />
              <span className="relative font-medium">{n.label}</span>
            </>)}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-3 border-t border-white/8"><p className="text-[11px] text-white/40">Powered by <span className="text-white/70 font-semibold">{APP.poweredBy}</span></p></div>
    </aside>
  );
}
