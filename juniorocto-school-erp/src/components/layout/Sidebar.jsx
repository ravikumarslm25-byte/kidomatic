import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { NAV } from "@/config/nav";
import { useAuth } from "@/store/auth";
import { canManageSetup } from "@/lib/roles";
import { usePermissions } from "@/store/permissions";
import { LABEL_FEATURE } from "@/config/features";
import { APP } from "@/config/app";
import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

function Item({ to, icon: Icon, label, badge, onNavigate }) {
  return (
    <NavLink to={to} end={to === "/"} onClick={onNavigate}
      className={({ isActive }) => cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
        isActive ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5"
      )}>
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-white/10" />}
          {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-coral animate-pop" />}
          <Icon size={18} className={cn("relative shrink-0", isActive && "text-coral")} />
          <span className="relative font-medium flex-1">{label}</span>
          {badge && <span className="relative text-[10px] font-bold px-1.5 py-0.5 rounded-md btn-grad text-white">{badge}</span>}
        </>
      )}
    </NavLink>
  );
}

function Group({ node, onNavigate }) {
  const { pathname } = useLocation();
  const childActive = node.items.some((i) => pathname.startsWith(i.to));
  const [open, setOpen] = useState(childActive);
  const Icon = node.icon;
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}
        className={cn("flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm transition",
          childActive ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5")}>
        <Icon size={18} className={cn("shrink-0", childActive && "text-coral")} />
        <span className="font-medium flex-1 text-left">{node.label}</span>
        <ChevronDown size={15} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 ml-4 pl-3 border-l border-white/10 flex flex-col gap-0.5">
          {node.items.map((it) => (
            <NavLink key={it.to} to={it.to} onClick={onNavigate}
              className={({ isActive }) => cn("relative rounded-lg px-3 py-1.5 text-[13px] transition",
                isActive ? "text-white bg-white/10" : "text-white/55 hover:text-white hover:bg-white/5")}>
              {({ isActive }) => (<>
                {isActive && <span className="absolute left-[-13px] top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-coral" />}
                {it.label}
              </>)}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ onNavigate }) {
  const { user } = useAuth();
  const { can } = usePermissions();
  const isAdmin = canManageSetup(user);
  const nav = NAV.filter((n) => (!n.admin || isAdmin) && can(LABEL_FEATURE[n.label] || "dashboard", "view"));
  return (
    <aside className="glass-dark w-[264px] shrink-0 h-full flex flex-col rounded-none lg:rounded-3xl overflow-hidden">
      <div className="px-5 pt-5 pb-4"><Logo dark markSize={30} /></div>
      <nav className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-0.5">
        {nav.map((n, i) =>
          n.type === "group"
            ? <Group key={i} node={n} onNavigate={onNavigate} />
            : <Item key={i} {...n} onNavigate={onNavigate} />
        )}
      </nav>
      <div className="px-5 py-3 border-t border-white/8">
        <p className="text-[11px] text-white/40">Powered by <span className="text-white/70 font-semibold">{APP.poweredBy}</span></p>
      </div>
    </aside>
  );
}
