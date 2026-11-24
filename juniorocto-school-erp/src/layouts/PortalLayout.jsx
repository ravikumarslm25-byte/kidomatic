import { useState } from "react";
import { Outlet } from "react-router-dom";
import { UserX } from "lucide-react";
import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalTopBar from "@/components/portal/PortalTopBar";
import Spinner from "@/components/ui/Spinner";
import { PortalProvider, usePortal } from "@/store/portal";

function Gate() {
  const { ready, list } = usePortal();
  if (!ready) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={28} /></div>;
  if (!list.length) return (
    <div className="glass rounded-xl2 shadow-glass p-10 text-center max-w-lg mx-auto">
      <span className="h-14 w-14 rounded-2xl bg-coral-50 text-coral-500 grid place-items-center mx-auto mb-4"><UserX size={26} /></span>
      <h2 className="font-display text-lg text-navy mb-1">No student linked to this login</h2>
      <p className="text-sm text-navy/55">This account isn't linked to any student yet. Please ask your school to link your child to your login (Students → Guardian Logins).</p>
    </div>
  );
  return <Outlet />;
}

export default function PortalLayout() {
  const [drawer, setDrawer] = useState(false);
  return (
    <PortalProvider>
      <div className="jo-canvas min-h-screen flex lg:p-3 gap-3">
        <div className="hidden lg:block sticky top-3 h-[calc(100vh-1.5rem)]"><PortalSidebar /></div>
        {drawer && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
            <div className="relative h-full"><PortalSidebar onNavigate={() => setDrawer(false)} /></div>
          </div>
        )}
        <main className="flex-1 min-w-0 px-3 lg:px-0 py-3 lg:py-0">
          <PortalTopBar onMenu={() => setDrawer(true)} />
          <div className="pb-10"><Gate /></div>
        </main>
      </div>
    </PortalProvider>
  );
}
