import { useState, useEffect, useMemo } from "react";
import { FileSpreadsheet, Zap, Receipt, Settings2, Check, Printer, HandCoins, Link2, AlertTriangle, Ban } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";
import { useBranding } from "@/store/branding";
import { CUR_YEAR, rupee, billableItems, coveredKeys, paidKeys } from "./feeKit";

const invSvc = resourceService("invoices");
const paySvc = resourceService("payments");
const structSvc = resourceService("feeStructures");
const setSvc = resourceService("feeSettings");

export default function Invoices() {
  const toast = useToast();
  const { user } = useAuth();
  const brand = useBranding();
  const [tab, setTab] = useState("generate");
  const [invoices, setInvoices] = useState([]); const [students, setStudents] = useState([]); const [structs, setStructs] = useState([]); const [concessions, setConcessions] = useState([]);
  const [settings, setSettings] = useState({ razorpayEnabled: false, razorpayKeyId: "", razorpayKeySecret: "", upiId: "", invoicePrefix: "INV", notifyEmail: false, notifySms: false, notifyWhatsapp: false });
  const [setId, setSetId] = useState(null);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  // generate
  const [gKlass, setGKlass] = useState(""); const [gYear, setGYear] = useState(CUR_YEAR);
  const [selKeys, setSelKeys] = useState([]); const [discount, setDiscount] = useState(0); const [preview, setPreview] = useState(null);
  const [allClasses, setAllClasses] = useState(false); const [selTerms, setSelTerms] = useState([]); const [incOnetime, setIncOnetime] = useState(false); const [incActivity, setIncActivity] = useState(false);
  const [pay, setPay] = useState(null); const [view, setView] = useState(null);
  const [fStatus, setFStatus] = useState(""); const [fKlass, setFKlass] = useState("");

  const load = async () => {
    setLoading(true);
    const [inv, st, fs, se, sc] = await Promise.all([invSvc.list({}), resourceService("students").list({}), structSvc.list({}), setSvc.list({}), resourceService("studentConcessions").list({})]);
    setInvoices(normList(inv)); setStudents(normList(st)); setStructs(normList(fs)); setConcessions(normList(sc));
    const s0 = normList(se)[0]; if (s0) { setSettings({ ...settings, ...s0 }); setSetId(s0.id); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const structure = structs.find((s) => s.klass === gKlass && (s.academicYear || CUR_YEAR) === gYear);
  const items = useMemo(() => (structure ? billableItems(structure) : []), [structure]);
  const classStudents = students.filter((s) => s.klass === gKlass && (s.status || "Active") === "Active");
  const allTerms = useMemo(() => [...new Set(structs.filter((st) => (st.academicYear || CUR_YEAR) === gYear).flatMap((st) => st.terms || []))], [structs, gYear]);
  const studentMap = useMemo(() => Object.fromEntries(students.map((s) => [s.id, s])), [students]);
  const sName = (inv) => studentMap[inv.studentId]?.name || inv.studentName || "—";
  const sClass = (inv) => { const st = studentMap[inv.studentId]; const k = st?.klass || inv.klass || ""; const sec = st?.section || inv.section || ""; return k + (sec ? " · " + sec : ""); };
  const sAdm = (inv) => studentMap[inv.studentId]?.admissionNo || "";

  const concessionFor = (studentId, subtotal) => {
    const a = concessions.find((c) => c.studentId === studentId && (c.status || "Active") === "Active");
    if (!a) return { amount: 0, label: "" };
    const amount = a.mode === "Percent" ? Math.round(subtotal * (+a.value || 0) / 100) : Math.min(+a.value || 0, subtotal);
    return { amount, label: a.concessionName || a.type };
  };
  const toggleKey = (k) => setSelKeys((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));
  const selectAllTerms = () => setSelKeys(items.filter((i) => i.kind === "term").map((i) => i.key));

  const buildPreview = () => {
    const toInvoice = []; const skipped = [];
    const targets = allClasses ? structs.filter((st) => (st.academicYear || CUR_YEAR) === gYear) : (structure ? [structure] : []);
    if (!targets.length) { toast.error(allClasses ? "No fee structures for this year" : "No fee structure for this class/year"); return; }
    if (!allClasses && !selKeys.length) { toast.error("Select at least one fee item"); return; }
    if (allClasses && !selTerms.length && !incOnetime && !incActivity) { toast.error("Choose terms / one-time / activity to bill"); return; }
    targets.forEach((st) => {
      const bItems = billableItems(st);
      const chosen = allClasses
        ? bItems.filter((i) => (i.kind === "term" && selTerms.includes(i.term)) || (i.kind === "onetime" && incOnetime) || (i.kind === "activity" && incActivity))
        : bItems.filter((i) => selKeys.includes(i.key));
      if (!chosen.length) return;
      const kids = students.filter((x) => x.klass === st.klass && (x.status || "Active") === "Active");
      kids.forEach((s) => {
        const covered = coveredKeys(s.id, invoices);
        const bill = chosen.filter((i) => !covered.has(i.key));
        const allTermPaid = bItems.filter((i) => i.kind === "term").every((i) => paidKeys(s.id, invoices).has(i.key));
        if (bill.length === 0) skipped.push({ s, reason: allTermPaid ? "Full year already paid" : "Already invoiced / paid" });
        else { const sub = bill.reduce((a, i) => a + i.amount, 0); const con = concessionFor(s.id, sub); toInvoice.push({ s, bill, subtotal: sub, klass: st.klass, concession: con.amount, concessionLabel: con.label }); }
      });
    });
    setPreview({ toInvoice, skipped });
  };

  const generate = async () => {
    setSaving(true);
    try {
      const disc = +discount || 0;
      await Promise.all(preview.toInvoice.map(async (row, idx) => {
        const subtotal = row.subtotal; const dAmt = Math.round(subtotal * disc / 100); const concession = +row.concession || 0; const total = Math.max(0, subtotal - dAmt - concession);
        const no = `${settings.invoicePrefix || "INV"}-${gYear.slice(0, 4)}-${Date.now().toString().slice(-5)}${idx}`;
        await invSvc.create({ invoiceNo: no, studentId: row.s.id, studentName: row.s.name, admissionNo: row.s.admissionNo || "", klass: row.klass || row.s.klass, section: row.s.section || "", academicYear: gYear,
          items: row.bill, subtotal, discount: dAmt, concession, concessionLabel: row.concessionLabel || "", total, paid: 0, balance: total, dueDate: "", status: "Due", note: "", createdAt: new Date().toISOString() });
      }));
      toast.success(`${preview.toInvoice.length} invoices generated${preview.skipped.length ? ` · ${preview.skipped.length} skipped` : ""}`);
      setPreview(null); setSelKeys([]); setDiscount(0); await load(); setTab("invoices");
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  // manual payment
  const openPay = (inv) => setPay({ invoice: inv, amount: inv.balance, mode: "Cash", reference: "", note: "" });
  const recordPay = async () => {
    setSaving(true);
    try {
      const inv = pay.invoice; const amt = +pay.amount || 0;
      const paid = (+inv.paid || 0) + amt; const balance = Math.max(0, (+inv.total || 0) - paid);
      const status = balance <= 0 ? "Paid" : paid > 0 ? "Partial" : "Due";
      await invSvc.update(inv.id, { paid, balance, status });
      await paySvc.create({ receiptNo: `RCP-${Date.now().toString().slice(-6)}`, invoiceId: inv.id, invoiceNo: inv.invoiceNo, studentId: inv.studentId, studentName: inv.studentName, amount: amt, mode: pay.mode, reference: pay.reference, note: pay.note, date: new Date().toISOString().slice(0, 10), receivedBy: user?.name || "admin" });
      toast.success("Payment recorded"); setPay(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const razorpayLink = (inv) => {
    if (!settings.razorpayKeyId) { toast.error("Add the school's Razorpay key in Settings first"); return; }
    // Placeholder: real link needs a server call with the school's secret. Copy an in-app pay link for now.
    const url = `${window.location.origin}/pay/${inv.id}`;
    navigator.clipboard?.writeText(url); toast.success("Payment link copied (parent pay page)");
  };

  const saveSettings = async () => { try { if (setId) await setSvc.update(setId, settings); else { const r = await setSvc.create(settings); setSetId(r.id || r._id); } toast.success("Settings saved"); } catch (e) { toast.error(e.message); } };

  const shownInv = invoices.filter((i) => (!fStatus || i.status === fStatus) && (!fKlass || i.klass === fKlass)).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const TABS = [["generate", "Generate", Zap], ["invoices", "Invoices", Receipt], ["settings", "Settings", Settings2]];

  return (
    <div>
      <PageHeader title="Invoices & Fee Collection" icon={FileSpreadsheet} subtitle="Bulk class-wise generation · auto paid-check · full-year discount · online + cash" />
      <div className="flex gap-1 mb-5">{TABS.map(([k, label, Icon]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {label}</button>)}</div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (<>
        {/* GENERATE */}
        {tab === "generate" && (<>
          <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-3 items-end">
            <div className="w-48"><p className="text-xs font-semibold text-navy/60 mb-1.5">Class</p><RefSelect resource="classes" labelKey="name" value={gKlass} onChange={(v) => { setGKlass(v); setSelKeys([]); setPreview(null); }} placeholder="Select class…" /></div>
            <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Academic year</p><input value={gYear} onChange={(e) => setGYear(e.target.value)} className="ctl w-28" /></div>
            <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Discount %</p><input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="ctl w-24" /></div>
            <label className="flex items-center gap-2 text-sm text-navy/70 ml-auto"><input type="checkbox" checked={allClasses} onChange={(e) => { setAllClasses(e.target.checked); setPreview(null); }} /> All classes</label>
          </div>
          {allClasses ? (
            <div className="glass rounded-xl2 shadow-glass p-5">
              <p className="font-semibold text-navy mb-3">Bill across every class that has a {gYear} structure</p>
              <p className="text-xs text-navy/50 mb-2">Terms to bill</p>
              <div className="flex flex-wrap gap-2 mb-3">{allTerms.map((t) => <button key={t} onClick={() => setSelTerms((a) => a.includes(t) ? a.filter((x) => x !== t) : [...a, t])} className={`px-3 h-9 rounded-xl border text-sm ${selTerms.includes(t) ? "border-royal bg-royal-100 text-royal" : "border-navy/12 bg-white/60 text-navy/60"}`}>{t}</button>)}</div>
              <div className="flex gap-4 mb-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={incOnetime} onChange={(e) => setIncOnetime(e.target.checked)} /> Include one-time (Book / Kit / Uniform)</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={incActivity} onChange={(e) => setIncActivity(e.target.checked)} /> Include activity fees</label></div>
              <Button onClick={buildPreview}><Zap size={15} /> Preview generation (all classes)</Button>
            </div>
          ) : !gKlass ? <div className="glass rounded-xl2 shadow-glass py-14 text-center text-navy/50">Pick a class to generate invoices.</div>
            : !structure ? <div className="glass rounded-xl2 shadow-glass py-14 text-center text-navy/50">No fee structure for {gKlass} · {gYear}. Create one in Fee Structure.</div> : (
            <div className="glass rounded-xl2 shadow-glass p-5">
              <div className="flex items-center justify-between mb-3"><p className="font-semibold text-navy">Select fee items to bill ({classStudents.length} students)</p><button onClick={selectAllTerms} className="text-royal text-sm font-semibold">Select all term fees (full year)</button></div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                {items.map((it) => (
                  <button key={it.key} onClick={() => toggleKey(it.key)} className={`flex items-center justify-between text-left px-3 py-2 rounded-xl border text-sm ${selKeys.includes(it.key) ? "border-royal bg-royal-100" : "border-navy/12 bg-white/60"}`}>
                    <span><span className={`inline-block h-4 w-4 rounded mr-2 align-middle ${selKeys.includes(it.key) ? "bg-royal" : "border border-navy/25"}`}>{selKeys.includes(it.key) && <Check size={12} className="text-white" />}</span>{it.title}{it.optional && <Badge color="amber">opt</Badge>}</span>
                    <span className="font-mono text-navy/60">{rupee(it.amount)}</span>
                  </button>
                ))}
              </div>
              <Button onClick={buildPreview} disabled={!selKeys.length}><Zap size={15} /> Preview generation</Button>
            </div>
          )}
        </>)}

        {/* INVOICES */}
        {tab === "invoices" && (<>
          <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-3 items-end">
            <div className="w-44"><p className="text-xs font-semibold text-navy/60 mb-1.5">Class</p><RefSelect resource="classes" labelKey="name" value={fKlass} onChange={setFKlass} placeholder="All" /></div>
            <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Status</p><select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="ctl"><option value="">All</option><option>Due</option><option>Partial</option><option>Paid</option></select></div>
            <span className="ml-auto text-sm text-navy/50">{shownInv.length} invoices</span>
          </div>
          <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Student</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">Paid</th><th className="px-4 py-3 text-right">Balance</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody>
                {shownInv.map((i) => (
                  <tr key={i.id} className="border-b border-navy/5 hover:bg-white/40">
                    <td className="px-4 py-2.5 font-mono text-xs text-navy/70">{i.invoiceNo}</td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Avatar name={sName(i)} size={26} /><div><p className="font-medium text-navy">{sName(i)}</p><p className="text-[11px] text-navy/45">{sAdm(i) ? sAdm(i) + " · " : ""}{sClass(i)}</p></div></div></td>
                    <td className="px-4 py-2.5 text-right font-mono">{rupee(i.total)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-700">{rupee(i.paid)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-coral-600">{rupee(i.balance)}</td>
                    <td className="px-4 py-2.5"><Badge color={i.status === "Paid" ? "green" : i.status === "Partial" ? "amber" : "red"}>{i.status}</Badge></td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => setView(i)} className="text-royal text-sm font-semibold">View</button>
                      {i.status !== "Paid" && <button onClick={() => openPay(i)} className="text-emerald-600 text-xs font-semibold flex items-center gap-1"><HandCoins size={13} /> Pay</button>}
                      {i.status !== "Paid" && <button onClick={() => razorpayLink(i)} className="text-navy/50 text-xs flex items-center gap-1"><Link2 size={13} /> Link</button>}
                    </div></td>
                  </tr>
                ))}
                {shownInv.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">No invoices. Generate them from the Generate tab.</td></tr>}
              </tbody>
            </table>
          </div>
        </>)}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div className="glass rounded-xl2 shadow-glass p-5 max-w-2xl space-y-4">
            <h3 className="font-display text-navy">Payment gateway — school's own Razorpay</h3>
            <p className="text-sm text-navy/50">Each school connects its <b>own</b> Razorpay account. Money settles to the school, not KidoMatic.</p>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!settings.razorpayEnabled} onChange={(e) => setSettings((s) => ({ ...s, razorpayEnabled: e.target.checked }))} /> Enable Razorpay for this school</label>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block"><span className="lbl2">Razorpay Key ID</span><input value={settings.razorpayKeyId} onChange={(e) => setSettings((s) => ({ ...s, razorpayKeyId: e.target.value }))} className="in" placeholder="rzp_live_…" /></label>
              <label className="block"><span className="lbl2">Razorpay Key Secret</span><input type="password" value={settings.razorpayKeySecret} onChange={(e) => setSettings((s) => ({ ...s, razorpayKeySecret: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl2">UPI ID (optional)</span><input value={settings.upiId} onChange={(e) => setSettings((s) => ({ ...s, upiId: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl2">Invoice prefix</span><input value={settings.invoicePrefix} onChange={(e) => setSettings((s) => ({ ...s, invoicePrefix: e.target.value }))} className="in" placeholder="INV" /></label>
            </div>
            <div><p className="lbl2">Notifications (planned integration)</p><div className="flex gap-3">
              {[["notifyEmail", "Email"], ["notifySms", "SMS"], ["notifyWhatsapp", "WhatsApp"]].map(([k, l]) => <label key={k} className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={!!settings[k]} onChange={(e) => setSettings((s) => ({ ...s, [k]: e.target.checked }))} /> {l}</label>)}
            </div><p className="text-[11px] text-navy/40 mt-1">Toggles are stored now; delivery hooks land in the notification phase.</p></div>
            <Button onClick={saveSettings}>Save settings</Button>
          </div>
        )}
      </>)}

      {/* Preview modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Preview — bulk generation" size="lg"
        footer={<ModalFooter onCancel={() => setPreview(null)} onSave={generate} saving={saving} saveLabel={`Generate ${preview?.toInvoice.length || 0} invoices`} />}>
        {preview && (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm"><span className="text-emerald-700 font-semibold">{preview.toInvoice.length} to invoice</span><span className="text-navy/50">{preview.skipped.length} skipped</span>{discount > 0 && <span className="text-royal">{discount}% discount</span>}</div>
            <div className="max-h-[36vh] overflow-auto space-y-1.5">
              {preview.toInvoice.map((r) => { const net = Math.max(0, r.subtotal - Math.round(r.subtotal * (+discount || 0) / 100) - (+r.concession || 0)); return <div key={r.s.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-emerald-50"><span className="text-navy">{r.s.name}{r.concession > 0 && <span className="text-[10px] text-royal ml-1">· {r.concessionLabel} −{rupee(r.concession)}</span>}</span><span className="font-mono text-navy/70">{rupee(net)} · {r.bill.length} item(s)</span></div>; })}
            </div>
            {preview.skipped.length > 0 && <div>
              <p className="text-xs font-semibold text-navy/50 mb-1 flex items-center gap-1"><Ban size={13} /> Skipped (not billed again)</p>
              <div className="max-h-[20vh] overflow-auto space-y-1">{preview.skipped.map((r) => <div key={r.s.id} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-navy/5"><span className="text-navy/70">{r.s.name}</span><span className={r.reason.includes("Full year") ? "text-royal font-medium" : "text-navy/45"}>{r.reason}</span></div>)}</div>
            </div>}
          </div>
        )}
      </Modal>

      {/* Payment modal */}
      <Modal open={!!pay} onClose={() => setPay(null)} title="Record payment" footer={<ModalFooter onCancel={() => setPay(null)} onSave={recordPay} saving={saving} saveLabel="Record" />}>
        {pay && (
          <div className="space-y-4">
            <p className="text-sm text-navy/60">{sName(pay.invoice)} · {sClass(pay.invoice)} · {pay.invoice.invoiceNo} · balance <b>{rupee(pay.invoice.balance)}</b></p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="lbl2">Amount (₹)</span><input type="number" value={pay.amount} onChange={(e) => setPay((p) => ({ ...p, amount: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl2">Mode</span><select value={pay.mode} onChange={(e) => setPay((p) => ({ ...p, mode: e.target.value }))} className="in"><option>Cash</option><option>UPI</option><option>Cheque</option><option>Bank Transfer</option><option>Online (Razorpay)</option></select></label>
            </div>
            <label className="block"><span className="lbl2">Reference (txn / cheque no.)</span><input value={pay.reference} onChange={(e) => setPay((p) => ({ ...p, reference: e.target.value }))} className="in" /></label>
            <label className="block"><span className="lbl2">Note (e.g. paid by cash at office)</span><input value={pay.note} onChange={(e) => setPay((p) => ({ ...p, note: e.target.value }))} className="in" /></label>
          </div>
        )}
      </Modal>

      {/* Invoice view */}
      <Modal open={!!view} onClose={() => setView(null)} title="Invoice" size="lg" footer={<ModalFooter onCancel={() => setView(null)} onSave={() => window.print()} saveLabel="Print" />}>
        {view && (
          <div className="bg-white rounded-xl border border-navy/10 p-6">
            <div className="flex justify-between items-start border-b border-navy/10 pb-4 mb-4"><div><p className="font-display text-lg text-navy">{brand?.name || "School"}</p><p className="text-xs text-navy/50">Invoice · {view.invoiceNo}</p></div><Badge color={view.status === "Paid" ? "green" : view.status === "Partial" ? "amber" : "red"}>{view.status}</Badge></div>
            <p className="text-sm text-navy/70 mb-3">{sName(view)}{sAdm(view) ? " · " + sAdm(view) : ""} · {sClass(view)} · {view.academicYear}</p>
            <table className="w-full text-sm mb-3"><thead><tr className="text-left text-xs uppercase text-navy/40 border-b border-navy/10"><th className="py-1.5">Item</th><th className="text-right">Amount</th></tr></thead>
              <tbody>{(view.items || []).map((it, i) => <tr key={i} className="border-b border-navy/5"><td className="py-1.5 text-navy/80">{it.title}</td><td className="text-right font-mono">{rupee(it.amount)}</td></tr>)}</tbody></table>
            <div className="flex flex-col items-end gap-1 text-sm">
              <span>Subtotal: <b className="font-mono">{rupee(view.subtotal)}</b></span>
              {view.discount > 0 && <span className="text-royal">Discount: −{rupee(view.discount)}</span>}
              {view.concession > 0 && <span className="text-royal">Concession{view.concessionLabel ? ` (${view.concessionLabel})` : ""}: −{rupee(view.concession)}</span>}
              <span>Total: <b className="font-mono">{rupee(view.total)}</b></span>
              <span className="text-emerald-700">Paid: {rupee(view.paid)}</span>
              <span className="text-coral-600 font-semibold">Balance: {rupee(view.balance)}</span>
            </div>
          </div>
        )}
      </Modal>
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}.lbl2{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
