import { NavLink } from "react-router-dom";
import { LayoutDashboard, BarChart3, Target, FileSignature, FileText, KeyRound, ArrowLeftRight, Store, Building2, LifeBuoy, Users, Package, Settings } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { APP } from "@/config/app";
import { cn } from "@/lib/cn";

const GROUPS = [
  { title: null, items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, end: true }, { to: "/reports", label: "Reports", icon: BarChart3 }] },
  { title: "Sales", items: [{ to: "/leads", label: "Leads", icon: Target }, { to: "/quotations", label: "Quotations", icon: FileSignature }, { to: "/invoices", label: "Invoices", icon: FileText }, { to: "/licenses", label: "Licences", icon: KeyRound }, { to: "/transactions", label: "Transactions", icon: ArrowLeftRight }] },
  { title: "Network", items: [{ to: "/resellers", label: "Resellers", icon: Store }, { to: "/customers", label: "Customers", icon: Building2 }] },
  { title: "Operations", items: [{ to: "/support", label: "Support", icon: LifeBuoy }, { to: "/users", label: "Users", icon: Users }, { to: "/plans", label: "Plans", icon: Package }, { to: "/settings", label: "Settings", icon: Settings }] },
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="glass-dark w-[248px] shrink-0 h-full flex flex-col rounded-none lg:rounded-3xl overflow-hidden">
      <div className="px-5 pt-5 pb-4"><Logo dark markSize={30} tag="Master Admin" /></div>
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto no-scrollbar pb-3">
        {GROUPS.map((g, gi) => (
          <div key={gi} className={gi > 0 ? "mt-3" : ""}>
            {g.title && <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-white/30">{g.title}</p>}
            {g.items.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} onClick={onNavigate}
                className={({ isActive }) => cn("group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition", isActive ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5")}>
                {({ isActive }) => (<>
                  {isActive && <span className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-white/10" />}
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-coral animate-pop" />}
                  <n.icon size={17} className={cn("relative shrink-0", isActive && "text-coral")} />
                  <span className="relative font-medium">{n.label}</span>
                </>)}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="px-5 py-3 border-t border-white/8"><p className="text-[11px] text-white/40">Powered by <span className="text-white/70 font-semibold">{APP.poweredBy}</span></p></div>
    </aside>
  );
}
