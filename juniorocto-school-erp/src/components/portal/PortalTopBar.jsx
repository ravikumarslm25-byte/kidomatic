import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Search, ChevronDown, Check, LogOut, User, Plus, Megaphone, CalendarDays, ReceiptText, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Chip from "@/components/ui/Chip";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/store/auth";
import { usePortal } from "@/store/portal";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { portalService } from "@/services/portal.service";
import { useToast } from "@/store/toast";

function AddChildModal({ onClose, onDone, toast }) {
  const [f, setF] = useState({ admissionNo: "", dob: "" }); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!f.admissionNo || !f.dob) { toast.error("Enter admission number and date of birth"); return; }
    setBusy(true);
    try { const link = await portalService.linkChild(f); toast.success("Child linked"); onDone(link?.studentId); }
    catch (e) { toast.error(e.message || "Could not link child"); setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title="Add another child" footer={<ModalFooter onCancel={onClose} onSave={submit} saving={busy} saveLabel="Link child" />}>
      <div className="space-y-3">
        <p className="text-sm text-navy/55">Link a sibling to your login. We'll match against school records.</p>
        <label className="block"><span className="lbl">Admission number</span><input value={f.admissionNo} onChange={(e) => setF((x) => ({ ...x, admissionNo: e.target.value }))} className="in" /></label>
        <label className="block"><span className="lbl">Child's date of birth</span><input type="date" value={f.dob} onChange={(e) => setF((x) => ({ ...x, dob: e.target.value }))} className="in" /></label>
      </div>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </Modal>
  );
}

function ChildSwitcher() {
  const { list, child, setChild, reload } = usePortal();
  const [open, setOpen] = useState(false); const [add, setAdd] = useState(false); const toast = useToast();
  if (!child) return <div><p className="font-display text-navy text-[17px]">Portal</p></div>;
  return (
    <div className="relative min-w-0">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5 min-w-0">
        <Avatar name={child.studentName} size={38} />
        <div className="text-left leading-tight min-w-0"><p className="font-display text-navy text-[16px] truncate flex items-center gap-1">{child.studentName}<ChevronDown size={15} className="text-navy/40" /></p><p className="text-[11px] text-navy/50 truncate">{child.klass}{child.section ? `-${child.section}` : ""}</p></div>
      </button>
      {open && (<>
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
        <div className="absolute left-0 top-14 z-20 w-64 glass rounded-2xl shadow-glass py-1.5">
          <p className="px-4 py-1 text-[11px] font-bold uppercase text-navy/40">Children</p>
          {list.map((k) => (
            <button key={k.studentId} onClick={() => { setChild(k.studentId); setOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2 hover:bg-white/60"><Avatar name={k.studentName} size={32} /><div className="flex-1 text-left min-w-0"><p className="text-sm font-medium text-navy truncate">{k.studentName}</p><p className="text-[11px] text-navy/45">{k.klass}{k.section ? `-${k.section}` : ""}</p></div>{k.studentId === child.studentId && <Check size={15} className="text-royal" />}</button>
          ))}
          <div className="my-1 border-t border-navy/8" />
          <button onClick={() => { setOpen(false); setAdd(true); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-royal hover:bg-white/60"><span className="h-8 w-8 rounded-full bg-royal-100 grid place-items-center"><Plus size={16} /></span><span className="text-sm font-medium">Add another child</span></button>
        </div>
      </>)}
      {add && <AddChildModal onClose={() => setAdd(false)} onDone={(id) => { setAdd(false); reload(id); }} toast={toast} />}
    </div>
  );
}

function Notifications() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false); const [items, setItems] = useState(null);
  const loadN = async () => {
    if (items) return;
    try {
      const [c, e] = await Promise.all([resourceService("communications").list({}).catch(() => []), resourceService("events").list({}).catch(() => [])]);
      const circ = normList(c).filter((x) => x.status !== "Draft").map((x) => ({ type: "circular", title: x.title, sub: x.category || "Circular", at: x.publishAt || x.createdAt, to: "/portal/circulars", icon: Megaphone }));
      const now = Date.now();
      const evs = normList(e).filter((x) => { const d = new Date(x.start || x.date || 0).getTime(); return d >= now && d <= now + 7 * 864e5; }).map((x) => ({ type: "event", title: x.title, sub: `${x.category || "Event"} · ${new Date(x.start).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`, at: x.start, to: "/portal/calendar", icon: CalendarDays }));
      setItems([...circ, ...evs].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0)).slice(0, 12));
    } catch { setItems([]); }
  };
  const toggle = () => { setOpen((o) => !o); loadN(); };
  const count = items?.length || 0;
  return (
    <div className="relative">
      <button onClick={toggle} className="relative grid place-items-center h-10 w-10 rounded-xl hover:bg-white/60 text-navy/60 hover:text-navy"><Bell size={19} />{count > 0 && <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-coral ring-2 ring-white" />}</button>
      {open && (<>
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
        <div className="absolute right-0 top-12 z-20 w-80 glass rounded-2xl shadow-glass overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-navy/8"><p className="font-semibold text-navy text-sm">Notifications</p><button onClick={() => setOpen(false)} className="text-navy/40"><X size={16} /></button></div>
          <div className="max-h-96 overflow-y-auto">
            {!items ? <div className="grid place-items-center py-10"><Spinner size={20} /></div> : items.length === 0 ? <p className="px-4 py-10 text-center text-navy/40 text-sm">You're all caught up.</p> : items.map((n, i) => (
              <button key={i} onClick={() => { setOpen(false); nav(n.to); }} className="flex items-start gap-3 w-full px-4 py-3 hover:bg-white/60 text-left border-b border-navy/5">
                <span className="h-9 w-9 rounded-xl bg-royal-100 text-royal grid place-items-center shrink-0"><n.icon size={16} /></span>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy line-clamp-1">{n.title}</p><p className="text-[11px] text-navy/45">{n.sub}</p></div>
              </button>
            ))}
          </div>
        </div>
      </>)}
    </div>
  );
}

function ProfileMenu() {
  const { user, logout } = useAuth(); const nav = useNavigate(); const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5 rounded-xl pl-1 pr-2.5 py-1 hover:bg-white/60 transition"><Avatar name={user?.name} size={34} /><div className="hidden sm:block text-left leading-tight"><p className="text-sm font-semibold text-navy">{user?.name}</p><p className="text-[11px] text-navy/50">{user?.role || "Parent"}</p></div></button>
      {open && (<>
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
        <div className="absolute right-0 top-12 z-20 w-48 glass rounded-2xl shadow-glass py-1.5">
          <button onClick={() => { setOpen(false); nav("/portal/info"); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-navy/80 hover:bg-white/60"><User size={15} /> Student Info</button>
          <div className="my-1 border-t border-navy/8" />
          <button onClick={() => { logout(); nav("/portal/login"); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-coral-600 hover:bg-coral-100"><LogOut size={15} /> Log out</button>
        </div>
      </>)}
    </div>
  );
}

export default function PortalTopBar({ onMenu }) {
  return (
    <header className="glass rounded-xl2 shadow-glass px-4 sm:px-5 h-16 flex items-center gap-3 mb-5">
      <button onClick={onMenu} className="lg:hidden text-navy/60 hover:text-navy"><Menu size={22} /></button>
      <ChildSwitcher />
      <div className="flex-1" />
      <div className="hidden md:flex relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" /><input placeholder="Search…" className="h-10 w-56 rounded-xl bg-white/60 border border-navy/10 pl-9 pr-3 text-sm outline-none focus:border-royal/40 text-navy placeholder:text-navy/40" /></div>
      <Chip>Term 1</Chip>
      <Notifications />
      <ProfileMenu />
    </header>
  );
}
