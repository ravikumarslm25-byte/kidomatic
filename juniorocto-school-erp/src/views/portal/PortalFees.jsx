import { useState, useEffect, useMemo } from "react";
import { ReceiptText, IndianRupee, Download, CreditCard, FileText, Check, ChevronDown, Award } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { portalService } from "@/services/portal.service";
import { usePortal } from "@/store/portal";
import { useToast } from "@/store/toast";

const inr = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");
const dt = (v) => (v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

export default function PortalFees() {
  const { child } = usePortal();
  const toast = useToast();
  const [invoices, setInvoices] = useState([]); const [payments, setPayments] = useState([]); const [school, setSchool] = useState({});
  const [loading, setLoading] = useState(true); const [tab, setTab] = useState("dues");
  const [payFor, setPayFor] = useState(null); const [expand, setExpand] = useState(null);

  const load = async () => {
    if (!child) return;
    setLoading(true);
    const [inv, pay, st] = await Promise.all([
      resourceService("invoices").list({ studentId: child.studentId }),
      resourceService("payments").list({ studentId: child.studentId }),
      resourceService("appSettings").list({}).catch(() => []),
    ]);
    setInvoices(normList(inv)); setPayments(normList(pay)); setSchool(normList(st)[0] || {}); setLoading(false);
  };
  useEffect(() => { load(); }, [child?.studentId]);

  const unpaid = useMemo(() => invoices.filter((i) => i.status !== "Paid").sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "")), [invoices]);
  const totalDue = unpaid.reduce((a, i) => a + (+i.balance || (+i.total - (+i.paid || 0)) || 0), 0);
  const paidThisYear = payments.reduce((a, p) => a + (+p.amount || 0), 0);
  const canPay = child?.canPay !== false;

  const receiptHtml = (p) => {
    const st = "body{font-family:system-ui;padding:32px;color:#14335E;max-width:640px;margin:auto}h2{margin:0}small{color:#64748b}table{width:100%;border-collapse:collapse;margin-top:16px}td{padding:8px 0;border-bottom:1px solid #eef2f7}.r{text-align:right}.tot{font-weight:700;font-size:18px}";
    return `<style>${st}</style><h2>${school.schoolName || "School"}</h2><small>${school.addressLine || ""} ${school.city || ""} ${school.gstin ? "· GSTIN " + school.gstin : ""}</small><h3 style="margin-top:24px">Fee Receipt</h3><table><tr><td>Receipt No</td><td class="r">${p.receiptNo || "—"}</td></tr><tr><td>Date</td><td class="r">${dt(p.date)}</td></tr><tr><td>Student</td><td class="r">${p.studentName || child.studentName}</td></tr><tr><td>Invoice</td><td class="r">${p.invoiceNo || "—"}</td></tr><tr><td>Mode</td><td class="r">${p.mode || "—"}</td></tr><tr><td class="tot">Amount Paid</td><td class="r tot">${inr(p.amount)}</td></tr></table><p style="margin-top:24px;color:#64748b;font-size:12px">This is a computer-generated receipt.</p>`;
  };
  const certHtml = () => {
    const yr = new Date().getFullYear();
    const st = "body{font-family:system-ui;padding:32px;color:#14335E;max-width:680px;margin:auto}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{padding:8px;border-bottom:1px solid #eef2f7;text-align:left}th{background:#f1f5f9;font-size:12px;text-transform:uppercase}.r{text-align:right}";
    const rows = payments.map((p) => `<tr><td>${dt(p.date)}</td><td>${p.receiptNo || ""}</td><td>${p.invoiceNo || ""}</td><td class="r">${inr(p.amount)}</td></tr>`).join("");
    return `<style>${st}</style><h2>${school.schoolName || "School"}</h2><small>${school.addressLine || ""} ${school.city || ""}</small><h3 style="margin-top:24px">Tuition Fee Payment Certificate</h3><p>This certifies that the following fee payments were made for <b>${child.studentName}</b> (${child.klass || ""}) during ${yr}.</p><table><thead><tr><th>Date</th><th>Receipt</th><th>Invoice</th><th class="r">Amount</th></tr></thead><tbody>${rows}<tr><td colspan="3" class="r"><b>Total</b></td><td class="r"><b>${inr(paidThisYear)}</b></td></tr></tbody></table><p style="margin-top:24px;font-size:12px;color:#64748b">Issued for income-tax / reimbursement purposes. Computer-generated, no signature required.</p>`;
  };
  const printDoc = (html) => { const w = window.open("", "_blank"); w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 300); };

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  return (
    <div>
      <PageHeader title="Fees" icon={ReceiptText} subtitle={`${child?.studentName || ""}'s fees & payments`}
        actions={<Button variant="outline" onClick={() => printDoc(certHtml())}><Award size={15} /> Fee certificate</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatCard label="Total Due" value={inr(totalDue)} format="raw" icon={IndianRupee} tone="coral" />
        <StatCard label="Paid (this year)" value={inr(paidThisYear)} format="raw" icon={Check} tone="sea" />
        <StatCard label="Open Invoices" value={unpaid.length} icon={ReceiptText} tone="royal" />
      </div>

      <div className="flex gap-1 mb-4">
        {[["dues", "Dues & Upcoming"], ["history", "Payment History"]].map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-9 rounded-xl text-sm font-medium ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}>{l}</button>)}
      </div>

      {tab === "dues" ? (
        <div className="space-y-3">
          {unpaid.map((inv) => {
            const bal = +inv.balance || (+inv.total - (+inv.paid || 0));
            const open = expand === inv.id;
            return (
              <Card key={inv.id} pad={false}>
                <div className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy">{inv.invoiceNo} <span className="text-navy/50 font-normal text-sm">· {inv.term || inv.academicYear || ""}</span></p>
                    <p className="text-xs text-navy/50">Due {dt(inv.dueDate)} · {inr(inv.total)} total{inv.paid ? ` · ${inr(inv.paid)} paid` : ""}</p>
                  </div>
                  <div className="text-right"><p className="font-display text-navy text-lg">{inr(bal)}</p><Badge color={inv.status === "Partial" ? "amber" : "red"}>{inv.status || "Due"}</Badge></div>
                  {Array.isArray(inv.items) && inv.items.length > 0 && <button onClick={() => setExpand(open ? null : inv.id)} className="text-navy/40"><ChevronDown size={18} className={open ? "rotate-180 transition" : "transition"} /></button>}
                  {canPay && <Button onClick={() => setPayFor({ ...inv, amount: bal })}><CreditCard size={15} /> Pay</Button>}
                </div>
                {open && Array.isArray(inv.items) && (
                  <div className="px-4 pb-4 border-t border-navy/6 pt-3 space-y-1">
                    {inv.items.map((it, i) => <div key={i} className="flex justify-between text-sm"><span className="text-navy/60">{it.head || it.name || it.label}</span><span className="text-navy font-medium">{inr(it.amount || it.total)}</span></div>)}
                    {inv.discount ? <div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>−{inr(inv.discount)}</span></div> : null}
                    {inv.concession ? <div className="flex justify-between text-sm text-emerald-600"><span>{inv.concessionLabel || "Concession"}</span><span>−{inr(inv.concession)}</span></div> : null}
                  </div>
                )}
              </Card>
            );
          })}
          {unpaid.length === 0 && <Card className="py-14 text-center text-navy/40">No dues — all fees are paid. 🎉</Card>}
        </div>
      ) : (
        <Card pad={false}>
          <div className="divide-y divide-navy/6">
            {payments.length === 0 && <p className="px-5 py-14 text-center text-navy/40 text-sm">No payments yet.</p>}
            {[...payments].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center"><Check size={17} /></span>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy">{p.receiptNo || "Payment"} · {inr(p.amount)}</p><p className="text-xs text-navy/45">{p.mode || ""} · {dt(p.date)}{p.invoiceNo ? ` · ${p.invoiceNo}` : ""}</p></div>
                <Button variant="outline" onClick={() => printDoc(receiptHtml(p))}><Download size={14} /> Receipt</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {payFor && <PayModal inv={payFor} onClose={() => setPayFor(null)} onDone={(p) => { setPayFor(null); load(); if (p) printDoc(receiptHtml(p)); }} toast={toast} />}
    </div>
  );
}

function PayModal({ inv, onClose, onDone, toast }) {
  const [amount, setAmount] = useState(inv.amount); const [mode, setMode] = useState("UPI"); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!(amount > 0)) { toast.error("Enter a valid amount"); return; }
    setBusy(true);
    try { const res = await portalService.pay({ invoiceId: inv.id, amount: Number(amount), mode }); toast.success("Payment successful"); onDone(res?.receipt); }
    catch (e) { toast.error(e.message || "Payment failed"); setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={`Pay ${inv.invoiceNo}`} footer={<ModalFooter onCancel={onClose} onSave={submit} saving={busy} saveLabel="Pay now" />}>
      <div className="space-y-3">
        <div className="rounded-xl bg-navy/5 p-3 text-sm flex justify-between"><span className="text-navy/60">Balance</span><span className="font-semibold text-navy">₹{Number(inv.balance || inv.amount).toLocaleString("en-IN")}</span></div>
        <label className="block"><span className="lbl">Amount</span><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="in" /></label>
        <label className="block"><span className="lbl">Method</span><select value={mode} onChange={(e) => setMode(e.target.value)} className="in">{["UPI", "Card", "Net Banking", "Online"].map((m) => <option key={m}>{m}</option>)}</select></label>
        <p className="text-[11px] text-navy/45">You'll get a receipt immediately after payment. Online payments settle through your school's gateway.</p>
      </div>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </Modal>
  );
}
