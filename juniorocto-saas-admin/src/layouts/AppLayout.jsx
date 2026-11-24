import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
export default function AppLayout() {
  const [drawer, setDrawer] = useState(false);
  return (
    <div className="jo-canvas min-h-screen flex lg:p-3 gap-3">
      <div className="hidden lg:block sticky top-3 h-[calc(100vh-1.5rem)]"><Sidebar /></div>
      {drawer && (<div className="lg:hidden fixed inset-0 z-40 flex"><div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setDrawer(false)} /><div className="relative h-full"><Sidebar onNavigate={() => setDrawer(false)} /></div></div>)}
      <main className="flex-1 min-w-0 px-3 lg:px-0 py-3 lg:py-0"><TopBar onMenu={() => setDrawer(true)} /><div className="pb-10"><Outlet /></div></main>
    </div>
  );
}
