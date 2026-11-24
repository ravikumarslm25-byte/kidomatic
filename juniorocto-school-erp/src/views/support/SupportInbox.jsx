import { useState, useEffect } from "react";
import { LifeBuoy, MessageCircle, Send } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";

const svc = resourceService("supportTickets");
const dt = (v) => (v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
const asArr = (v) => (Array.isArray(v) ? v : []);
const statusColor = { Open: "amber", "In Progress": "royal", Resolved: "green", Reopened: "coral" };
const STATUSES = ["Open", "In Progress", "Resolved"];

export default function SupportInbox() {
  const { user } = useAuth(); const toast = useToast();
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null); const [reply, setReply] = useState(""); const [busy, setBusy] = useState(false); const [tab, setTab] = useState("Open");

  const load = async () => { setLoading(true); try { setRows(normList(await svc.list({}))); } catch { setRows([]); } setLoading(false); };
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!reply.trim()) return; setBusy(true);
    try {
      const replies = [...asArr(open.replies), { by: user?.name || "School", role: "school", message: reply.trim(), at: new Date().toISOString() }];
      await svc.update(open.id, { replies, status: open.status === "Open" ? "In Progress" : open.status, updatedAt: new Date().toISOString() });
      setReply(""); await load(); setOpen((o) => ({ ...o, replies, status: o.status === "Open" ? "In Progress" : o.status }));
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const setStatus = async (t, status) => { await svc.update(t.id, { status, updatedAt: new Date().toISOString() }); load(); if (open?.id === t.id) setOpen((o) => ({ ...o, status })); };

  const shown = rows.filter((t) => tab === "All" || t.status === tab || (tab === "Open" && t.status === "Reopened"));
  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  return (
    <div>
      <PageHeader title="Support Inbox" icon={LifeBuoy} subtitle="Parent & student tickets" />
      <div className="flex gap-1 mb-4">{["Open", "In Progress", "Resolved", "All"].map((s) => <button key={s} onClick={() => setTab(s)} className={`px-3 h-9 rounded-xl text-sm font-medium ${tab === s ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}>{s}</button>)}</div>
      <div className="space-y-3">
        {shown.map((t) => (
          <Card key={t.id} className="flex items-center gap-3 cursor-pointer" onClick={() => setOpen(t)}>
            <span className="h-10 w-10 rounded-xl bg-royal-100 text-royal grid place-items-center"><MessageCircle size={18} /></span>
            <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm truncate">{t.subject}</p><p className="text-xs text-navy/45">{t.ticketNo} · {t.createdByName}{t.studentName ? ` (${t.studentName})` : ""} · {t.category} · {dt(t.createdAt)}</p></div>
            {t.priority === "High" && <Badge color="red">High</Badge>}
            <Badge color={statusColor[t.status] || "slate"}>{t.status}</Badge>
          </Card>
        ))}
        {shown.length === 0 && <Card className="py-14 text-center text-navy/40">No tickets here.</Card>}
      </div>

      {open && (
        <Modal open onClose={() => setOpen(null)} title={open.subject} size="lg" footer={
          <div className="flex justify-between items-center w-full">
            <select value={open.status} onChange={(e) => setStatus(open, e.target.value)} className="h-9 rounded-lg border border-navy/12 bg-white/70 px-2 text-sm">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            <Button variant="outline" onClick={() => setOpen(null)}>Close</Button>
          </div>}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-navy/50"><Badge color={statusColor[open.status]}>{open.status}</Badge> {open.ticketNo} · {open.category} · from {open.createdByName}</div>
            <div className="rounded-xl bg-navy/5 p-3"><p className="text-sm text-navy/80">{open.message}</p><p className="text-[11px] text-navy/40 mt-1">{open.createdByName} · {dt(open.createdAt)}</p></div>
            {asArr(open.replies).map((r, i) => (
              <div key={i} className={`rounded-xl p-3 ${r.role === "school" ? "bg-royal-50 ml-6" : "bg-white/60 border border-navy/8 mr-6"}`}><p className="text-sm text-navy/80">{r.message}</p><p className="text-[11px] text-navy/40 mt-1">{r.by} · {dt(r.at)}</p></div>
            ))}
            <div className="flex gap-2 items-center pt-1"><input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Reply to the guardian…" className="flex-1 h-10 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm outline-none" /><button onClick={send} disabled={busy} className="grid place-items-center h-10 w-10 rounded-xl btn-grad text-white">{busy ? <Spinner size={14} /> : <Send size={16} />}</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
