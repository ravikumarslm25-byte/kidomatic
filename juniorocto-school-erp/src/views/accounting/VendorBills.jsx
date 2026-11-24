import { useState, useEffect, useMemo } from "react";
import { FileText, Plus, HandCoins, Eye, Trash2, ReceiptText, CalendarClock } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import FileUpload from "@/components/ui/FileUpload";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";
import { rupee, MODES, agingBucket, AGING_BUCKETS } from "./accountsKit";

const billSvc = resourceService("vendorBills");
const vpaySvc = resourceService("vendorPayments");
const txSvc = resourceService("transactions");
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—");

export default function VendorBills() {
  const toast = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState("bills");
  const [bills, setBills] = useState([]); const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null); const [pay, setPay] = useState(null); const [view, setView] = useState(null);
  const [fStatus, setFStatus] = useState("");

  const load = async () => {
    setLoading(true);
    const [b, h] = await Promise.all([billSvc.list({}), resourceService("accountHeads").list({})]);
    setBills(normList(b)); setHeads(normList(h)); setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const expenseHeads = heads.filter((h) => h.type === "Expense");
  const shown = useMemo(() => bills.filter((b) => !fStatus || b.status === fStatus).sort((a, b) => (b.billDate || "").localeCompare(a.billDate || "")), [bills, fStatus]);

  const openBill = () => setForm({ vendorId: "", vendorName: "", billNo: "", billDate: new Date().toISOString().slice(0, 10), dueDate: "", category: "", head: "", department: "", subtotal: 0, tax: 0, poNo: "", note: "", attachment: "" });
  const total = form ? (+form.subtotal || 0) + (+form.tax || 0) : 0;
  const saveBill = async () => {
    if (!form.vendorName || !form.billNo) { toast.error("Vendor and bill no. required"); return; }
    setSaving(true);
    try {
      const t = (+form.subtotal || 0) + (+form.tax || 0);
      await billSvc.create({ ...form, subtotal: +form.subtotal || 0, tax: +form.tax || 0, total: t, paid: 0, balance: t, status: "Unpaid", createdAt: new Date().toISOString() });
      toast.success("Bill added"); setForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (b) => { await billSvc.remove(b.id); load(); };

  const openPay = (b) => setPay({ bill: b, amount: b.balance, mode: "Bank Transfer", date: new Date().toISOString().slice(0, 10), reference: "", note: "" });
  const recordPay = async () => {
    setSaving(true);
    try {
      const b = pay.bill; const amt = +pay.amount || 0;
      const paid = (+b.paid || 0) + amt; const balance = Math.max(0, (+b.total || 0) - paid);
      const status = balance <= 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid";
      await billSvc.update(b.id, { paid, balance, status });
      await vpaySvc.create({ vendorBillId: b.id, vendorName: b.vendorName, billNo: b.billNo, amount: amt, mode: pay.mode, date: pay.date, reference: pay.reference, note: pay.note, receivedBy: user?.name || "admin" });
      // post to ledger as expense (auto-integration)
      await txSvc.create({ date: pay.date, type: "Expense", head: b.head || "Miscellaneous", department: b.department || "", account: "", amount: amt, mode: pay.mode, party: b.vendorName, reference: b.billNo, note: `Vendor payment${pay.note ? " · " + pay.note : ""}`, source: "vendor", sourceId: b.id });
      toast.success("Payment recorded & posted to ledger"); setPay(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  // Payables aging
  const payables = useMemo(() => {
    const outstanding = bills.filter((b) => (+b.balance || 0) > 0);
    const byVendor = {};
    outstanding.forEach((b) => {
      const v = b.vendorName || "—"; byVendor[v] = byVendor[v] || { vendor: v, total: 0 };
      const bucket = agingBucket(b.dueDate); byVendor[v][bucket] = (byVendor[v][bucket] || 0) + (+b.balance || 0); byVendor[v].total += +b.balance || 0;
    });
    const rows = Object.values(byVendor).sort((a, b) => b.total - a.total);
    const grand = {}; AGING_BUCKETS.forEach((k) => (grand[k] = rows.reduce((s, r) => s + (r[k] || 0), 0)));
    grand.total = rows.reduce((s, r) => s + r.total, 0);
    return { rows, grand };
  }, [bills]);

  return (
    <div>
      <PageHeader title="Vendor Bills & Payables" icon={ReceiptText} subtitle="Bills → payments → ledger · outstanding by vendor with aging"
        actions={<Button onClick={openBill}><Plus size={16} /> New bill</Button>} />
      <div className="flex gap-1 mb-5">
        {[["bills", "Bills", FileText], ["payables", "Payables (Aging)", CalendarClock]].map(([k, label, Icon]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {label}</button>)}
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (<>
        {tab === "bills" && (<>
          <div className="flex gap-2 mb-3">{["", "Unpaid", "Partial", "Paid"].map((s) => <button key={s} onClick={() => setFStatus(s)} className={`px-3 h-8 rounded-lg text-sm ${fStatus === s ? "bg-royal-100 text-royal font-semibold" : "bg-white/60 border border-navy/10 text-navy/60"}`}>{s || "All"}</button>)}</div>
          <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Bill</th><th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Head</th><th className="px-4 py-3">Due</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">Balance</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody>
                {shown.map((b) => { const overdue = b.dueDate && b.balance > 0 && new Date(b.dueDate) < new Date(); return (
                  <tr key={b.id} className="border-b border-navy/5 hover:bg-white/40">
                    <td className="px-4 py-2.5 font-mono text-xs text-navy/70">{b.billNo}<p className="text-[10px] text-navy/40">{fmt(b.billDate)}</p></td>
                    <td className="px-4 py-2.5 font-medium text-navy">{b.vendorName}</td>
                    <td className="px-4 py-2.5 text-navy/60">{b.head || "—"}</td>
                    <td className="px-4 py-2.5"><span className={overdue ? "text-coral-600 font-medium" : "text-navy/60"}>{fmt(b.dueDate)}</span></td>
                    <td className="px-4 py-2.5 text-right font-mono">{rupee(b.total)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-coral-600">{rupee(b.balance)}</td>
                    <td className="px-4 py-2.5"><Badge color={b.status === "Paid" ? "green" : b.status === "Partial" ? "amber" : "red"}>{b.status}</Badge></td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2">
                      <button onClick={() => setView(b)} className="text-royal text-sm font-semibold flex items-center gap-1"><Eye size={13} /></button>
                      {b.status !== "Paid" && <button onClick={() => openPay(b)} className="text-emerald-600 text-xs font-semibold flex items-center gap-1"><HandCoins size={13} /> Pay</button>}
                      <button onClick={() => del(b)} className="text-navy/30 hover:text-coral-500"><Trash2 size={13} /></button>
                    </div></td>
                  </tr>
                ); })}
                {shown.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-navy/40">No vendor bills yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </>)}

        {tab === "payables" && (
          <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
            <div className="px-5 py-3 border-b border-navy/8 flex items-center justify-between"><p className="font-semibold text-navy">Payables aging</p><p className="text-sm text-navy/55">Total outstanding: <b className="text-coral-600">{rupee(payables.grand.total)}</b></p></div>
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Vendor</th><th className="px-4 py-3 text-right">Not due</th><th className="px-4 py-3 text-right">1–30</th><th className="px-4 py-3 text-right">31–60</th><th className="px-4 py-3 text-right">61–90</th><th className="px-4 py-3 text-right">90+</th><th className="px-4 py-3 text-right">Total</th></tr></thead>
              <tbody>
                {payables.rows.map((r) => (
                  <tr key={r.vendor} className="border-b border-navy/5"><td className="px-4 py-2.5 font-medium text-navy">{r.vendor}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-navy/60">{r["Not due"] ? rupee(r["Not due"]) : "—"}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{r["1-30"] ? rupee(r["1-30"]) : "—"}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-amber-600">{r["31-60"] ? rupee(r["31-60"]) : "—"}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-amber-700">{r["61-90"] ? rupee(r["61-90"]) : "—"}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-coral-600 font-semibold">{r["90+"] ? rupee(r["90+"]) : "—"}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">{rupee(r.total)}</td>
                  </tr>
                ))}
                {payables.rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">No outstanding payables. 🎉</td></tr>}
                {payables.rows.length > 0 && <tr className="bg-navy/5 font-semibold"><td className="px-4 py-2.5">Total</td>{["Not due", "1-30", "31-60", "61-90", "90+"].map((k) => <td key={k} className="px-4 py-2.5 text-right font-mono">{payables.grand[k] ? rupee(payables.grand[k]) : "—"}</td>)}<td className="px-4 py-2.5 text-right font-mono text-coral-600">{rupee(payables.grand.total)}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </>)}

      {/* New bill */}
      <Modal open={!!form} onClose={() => setForm(null)} title="New vendor bill" footer={<ModalFooter onCancel={() => setForm(null)} onSave={saveBill} saving={saving} />}>
        {form && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><span className="lbl">Vendor *</span><RefSelect resource="vendors" labelKey="name" value={form.vendorName} onChange={(v) => setForm((f) => ({ ...f, vendorName: v }))} placeholder="Select vendor…" /></div>
              <label className="block"><span className="lbl">Bill number *</span><input value={form.billNo} onChange={(e) => setForm((f) => ({ ...f, billNo: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Bill date</span><input type="date" value={form.billDate} onChange={(e) => setForm((f) => ({ ...f, billDate: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Due date</span><input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Expense head</span><select value={form.head} onChange={(e) => setForm((f) => ({ ...f, head: e.target.value }))} className="in"><option value="">Select head…</option>{expenseHeads.map((h) => <option key={h.id}>{h.name}</option>)}</select></label>
              <div><span className="lbl">Department</span><RefSelect resource="departments" labelKey="name" value={form.department} onChange={(v) => setForm((f) => ({ ...f, department: v }))} placeholder="Optional…" /></div>
              <label className="block"><span className="lbl">Subtotal (₹)</span><input type="number" value={form.subtotal} onChange={(e) => setForm((f) => ({ ...f, subtotal: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Tax / GST (₹)</span><input type="number" value={form.tax} onChange={(e) => setForm((f) => ({ ...f, tax: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">PO number (optional)</span><input value={form.poNo} onChange={(e) => setForm((f) => ({ ...f, poNo: e.target.value }))} className="in" /></label>
            </div>
            <p className="text-sm text-navy/60">Total: <b className="text-navy">{rupee(total)}</b></p>
            <div><span className="lbl">Bill attachment</span><FileUpload value={form.attachment} onChange={(v) => setForm((f) => ({ ...f, attachment: v }))} folder="vendor-bills" /></div>
            <label className="block"><span className="lbl">Note</span><input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} className="in" /></label>
          </div>
        )}
      </Modal>

      {/* Pay */}
      <Modal open={!!pay} onClose={() => setPay(null)} title="Record payment" footer={<ModalFooter onCancel={() => setPay(null)} onSave={recordPay} saving={saving} saveLabel="Pay & post" />}>
        {pay && (
          <div className="space-y-4">
            <p className="text-sm text-navy/60">{pay.bill.vendorName} · {pay.bill.billNo} · balance <b>{rupee(pay.bill.balance)}</b></p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="lbl">Amount (₹)</span><input type="number" value={pay.amount} onChange={(e) => setPay((p) => ({ ...p, amount: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Date</span><input type="date" value={pay.date} onChange={(e) => setPay((p) => ({ ...p, date: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Mode</span><select value={pay.mode} onChange={(e) => setPay((p) => ({ ...p, mode: e.target.value }))} className="in">{MODES.map((m) => <option key={m}>{m}</option>)}</select></label>
              <label className="block"><span className="lbl">Reference</span><input value={pay.reference} onChange={(e) => setPay((p) => ({ ...p, reference: e.target.value }))} className="in" /></label>
            </div>
            <label className="block"><span className="lbl">Note</span><input value={pay.note} onChange={(e) => setPay((p) => ({ ...p, note: e.target.value }))} className="in" /></label>
            <p className="text-[11px] text-navy/45">This payment posts an expense to the Ledger under “{pay.bill.head || "Miscellaneous"}”.</p>
          </div>
        )}
      </Modal>

      {/* View bill */}
      <Modal open={!!view} onClose={() => setView(null)} title="Vendor bill" footer={<ModalFooter onCancel={() => setView(null)} onSave={() => window.print()} saveLabel="Print" />}>
        {view && (
          <div className="bg-white rounded-xl border border-navy/10 p-6">
            <div className="flex justify-between border-b border-navy/10 pb-3 mb-3"><div><p className="font-display text-navy">{view.vendorName}</p><p className="text-xs text-navy/50">Bill {view.billNo} · {fmt(view.billDate)}</p></div><Badge color={view.status === "Paid" ? "green" : view.status === "Partial" ? "amber" : "red"}>{view.status}</Badge></div>
            <div className="text-sm space-y-1 text-navy/70">
              <div className="flex justify-between"><span>Head</span><span>{view.head || "—"}{view.department ? " · " + view.department : ""}</span></div>
              <div className="flex justify-between"><span>Due date</span><span>{fmt(view.dueDate)}</span></div>
              {view.poNo && <div className="flex justify-between"><span>PO</span><span>{view.poNo}</span></div>}
              <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{rupee(view.subtotal)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span className="font-mono">{rupee(view.tax)}</span></div>
              <div className="flex justify-between font-semibold text-navy border-t border-navy/10 pt-1"><span>Total</span><span className="font-mono">{rupee(view.total)}</span></div>
              <div className="flex justify-between text-emerald-700"><span>Paid</span><span className="font-mono">{rupee(view.paid)}</span></div>
              <div className="flex justify-between text-coral-600 font-semibold"><span>Balance</span><span className="font-mono">{rupee(view.balance)}</span></div>
            </div>
          </div>
        )}
      </Modal>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
