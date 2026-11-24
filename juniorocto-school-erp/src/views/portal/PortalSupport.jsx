import { useState, useEffect } from "react";
import { LifeBuoy, Plus, Send, MessageCircle, Check } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { portalService } from "@/services/portal.service";
import { usePortal } from "@/store/portal";
import { useToast } from "@/store/toast";

const CATS = ["General", "Fees", "Academics", "Attendance", "Transport", "Technical", "Complaint"];
const dt = (v) => (v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
const asArr = (v) => (Array.isArray(v) ? v : []);
const statusColor = { Open: "amber", "In Progress": "royal", Resolved: "green", Reopened: "coral" };

export default function PortalSupport() {
  const { child } = usePortal();
  const toast = useToast();
  const [tickets, setTickets] = useState([]); const [loading, setLoading] = useState(true);
  const [create, setCreate] = useState(false); const [open, setOpen] = useState(null); const [reply, setReply] = useState(""); const [busy, setBusy] = useState(false);

  const load = async () => { setLoading(true); try { setTickets(normList(await resourceService("supportTickets").list({}))); } catch { setTickets([]); } setLoading(false); };
  useEffect(() => { load(); }, []);

  const submitReply = async () => {
    if (!reply.trim()) return; setBusy(true);
    try { await portalService.replyTicket(open.id, reply.trim()); setReply(""); const fresh = normList(await resourceService("supportTickets").list({})); setTickets(fresh); setOpen(fresh.find((t) => t.id === open.id) || open); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  return (
    <div>
      <PageHeader title="Support" icon={LifeBuoy} subtitle="Raise a request or question to the school"
        actions={<Button onClick={() => setCreate(true)}><Plus size={16} /> New ticket</Button>} />

      <div className="space-y-3">
        {tickets.map((t) => (
          <Card key={t.id} className="flex items-center gap-3 cursor-pointer" onClick={() => setOpen(t)}>
            <span className="h-10 w-10 rounded-xl bg-royal-100 text-royal grid place-items-center"><MessageCircle size={18} /></span>
            <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm truncate">{t.subject}</p><p className="text-xs text-navy/45">{t.ticketNo} · {t.category} · {dt(t.createdAt)}{asArr(t.replies).length ? ` · ${asArr(t.replies).length} repl${asArr(t.replies).length === 1 ? "y" : "ies"}` : ""}</p></div>
            <Badge color={statusColor[t.status] || "slate"}>{t.status}</Badge>
          </Card>
        ))}
        {tickets.length === 0 && <Card className="py-14 text-center text-navy/40">No tickets yet. Raise one and the school will respond here.</Card>}
      </div>

      {create && <CreateTicket child={child} onClose={() => setCreate(false)} onDone={() => { setCreate(false); load(); }} toast={toast} />}

      {open && (
        <Modal open onClose={() => setOpen(null)} title={open.subject} size="lg" footer={<ModalFooter onCancel={() => setOpen(null)} onSave={() => setOpen(null)} saveLabel="Close" />}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-navy/50"><Badge color={statusColor[open.status] || "slate"}>{open.status}</Badge> {open.ticketNo} · {open.category}</div>
            <div className="rounded-xl bg-navy/5 p-3"><p className="text-sm text-navy/80">{open.message}</p><p className="text-[11px] text-navy/40 mt-1">{open.createdByName} · {dt(open.createdAt)}</p></div>
            {asArr(open.replies).map((r, i) => (
              <div key={i} className={`rounded-xl p-3 ${r.role === "school" || r.role === "staff" ? "bg-royal-50" : "bg-white/60 border border-navy/8"}`}>
                <p className="text-sm text-navy/80">{r.message}</p><p className="text-[11px] text-navy/40 mt-1">{r.by} · {dt(r.at)}</p>
              </div>
            ))}
            {open.status !== "Resolved" && (
              <div className="flex gap-2 items-center pt-1"><input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitReply()} placeholder="Type a reply…" className="flex-1 h-10 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm outline-none" /><button onClick={submitReply} disabled={busy} className="grid place-items-center h-10 w-10 rounded-xl btn-grad text-white">{busy ? <Spinner size={14} /> : <Send size={16} />}</button></div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function CreateTicket({ child, onClose, onDone, toast }) {
  const [f, setF] = useState({ subject: "", category: "General", message: "", priority: "Normal" });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!f.subject.trim() || !f.message.trim()) { toast.error("Subject and message are required"); return; }
    setBusy(true);
    try { await portalService.createTicket({ ...f, studentId: child?.studentId, studentName: child?.studentName }); toast.success("Ticket raised"); onDone(); }
    catch (e) { toast.error(e.message); setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title="New support ticket" footer={<ModalFooter onCancel={onClose} onSave={submit} saving={busy} saveLabel="Submit" />}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="lbl">Category</span><select value={f.category} onChange={(e) => setF((x) => ({ ...x, category: e.target.value }))} className="in">{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="block"><span className="lbl">Priority</span><select value={f.priority} onChange={(e) => setF((x) => ({ ...x, priority: e.target.value }))} className="in">{["Low", "Normal", "High"].map((p) => <option key={p}>{p}</option>)}</select></label>
        </div>
        <label className="block"><span className="lbl">Subject</span><input value={f.subject} onChange={(e) => setF((x) => ({ ...x, subject: e.target.value }))} className="in" /></label>
        <label className="block"><span className="lbl">Message</span><textarea rows={4} value={f.message} onChange={(e) => setF((x) => ({ ...x, message: e.target.value }))} className="in" style={{ height: "auto", padding: "10px 12px" }} /></label>
      </div>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </Modal>
  );
}
