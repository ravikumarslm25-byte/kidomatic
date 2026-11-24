import { useState, useEffect, useMemo } from "react";
import { ArrowDownToLine, Plus, Trash2, ShoppingCart, FileText, Check } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import FileUpload from "@/components/ui/FileUpload";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";
import { rupee } from "./invKit";

const itemSvc = resourceService("invItems");
const recSvc = resourceService("invReceipts");
const poSvc = resourceService("invPOs");
const billSvc = resourceService("vendorBills");
const today = () => new Date().toISOString().slice(0, 10);

export default function InvReceive() {
  const toast = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState("direct");
  const [items, setItems] = useState([]); const [pos, setPOs] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);

  // direct receive cart
  const [vendor, setVendor] = useState(""); const [billNo, setBillNo] = useState(""); const [billFile, setBillFile] = useState(""); const [date, setDate] = useState(today()); const [note, setNote] = useState("");
  const [lines, setLines] = useState([{ itemId: "", qty: 1, unitCost: 0 }]);
  // PO receive
  const [poId, setPoId] = useState(""); const [poLines, setPoLines] = useState([]);

  const load = async () => { setLoading(true); const [it, po] = await Promise.all([itemSvc.list({}), poSvc.list({})]); setItems(normList(it)); setPOs(normList(po).filter((p) => p.status === "Ordered")); setLoading(false); };
  useEffect(() => { load(); }, []);

  const itemById = (id) => items.find((i) => i.id === id);
  const setLine = (i, k, v) => setLines((L) => L.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const onPickItem = (i, id) => { const it = itemById(id); setLines((L) => L.map((x, idx) => (idx === i ? { ...x, itemId: id, unitCost: it?.unitCost || 0 } : x))); };
  const directTotal = useMemo(() => lines.reduce((a, l) => a + (+l.qty || 0) * (+l.unitCost || 0), 0), [lines]);

  // apply a received line to stock + receipt
  const applyReceipt = async (it, qty, unitCost, meta) => {
    await itemSvc.update(it.id, { availableCount: (+it.availableCount || 0) + qty, lastOrderedDate: meta.date, unitCost });
    await recSvc.create({ itemId: it.id, itemName: it.name, categoryName: it.categoryName, qty, unitCost, total: qty * unitCost, source: meta.source, poId: meta.poId || "", poNo: meta.poNo || "", vendorName: meta.vendor || "", billNo: meta.billNo || "", billFile: meta.billFile || "", date: meta.date, note: meta.note || "", receivedBy: user?.name || "admin" });
  };
  const postVendorBill = async ({ vendor, billNo, billFile, date, total, items: billItems, poNo, note }) => {
    if (!total) return;
    const due = new Date(date); due.setDate(due.getDate() + 30);
    await billSvc.create({ vendorName: vendor || "—", billNo: billNo || `INV-STK-${Date.now().toString().slice(-5)}`, billDate: date, dueDate: due.toISOString().slice(0, 10), category: "Inventory", head: "Inventory Purchases", department: "", items: billItems, subtotal: total, tax: 0, total, paid: 0, balance: total, status: "Unpaid", poNo: poNo || "", note: note || "Stock received", attachment: billFile || "", createdAt: new Date().toISOString() });
  };

  const submitDirect = async () => {
    const valid = lines.filter((l) => l.itemId && +l.qty > 0);
    if (!valid.length) { toast.error("Add at least one item"); return; }
    if (!billNo && !note) { toast.error("A bill number or note is required for direct stock-in"); return; }
    setSaving(true);
    try {
      const billItems = [];
      for (const l of valid) { const it = itemById(l.itemId); const qty = +l.qty, uc = +l.unitCost || 0; await applyReceipt(it, qty, uc, { source: "Direct", date, vendor, billNo, billFile, note }); billItems.push({ name: it.name, qty, unitCost: uc, total: qty * uc }); }
      await postVendorBill({ vendor, billNo, billFile, date, total: directTotal, items: billItems, note });
      toast.success("Stock received & bill posted to accounts");
      setLines([{ itemId: "", qty: 1, unitCost: 0 }]); setVendor(""); setBillNo(""); setBillFile(""); setNote(""); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const pickPO = (id) => { setPoId(id); const po = pos.find((p) => p.id === id); setPoLines((po?.items || []).map((it) => ({ ...it, recvQty: it.qty }))); };
  const poTotal = useMemo(() => poLines.reduce((a, l) => a + (+l.recvQty || 0) * (+l.unitCost || 0), 0), [poLines]);
  const submitPO = async () => {
    const po = pos.find((p) => p.id === poId); if (!po) { toast.error("Select a PO"); return; }
    setSaving(true);
    try {
      const billItems = [];
      for (const l of poLines) { const it = items.find((x) => x.id === l.itemId) || items.find((x) => x.name === l.name); if (!it || +l.recvQty <= 0) continue; const qty = +l.recvQty, uc = +l.unitCost || 0; await applyReceipt(it, qty, uc, { source: "PO", poId: po.id, poNo: po.poNo, date, vendor: po.vendorName, note: `PO ${po.poNo}` }); billItems.push({ name: it.name, qty, unitCost: uc, total: qty * uc }); }
      await postVendorBill({ vendor: po.vendorName, billNo: po.poNo, date, total: poTotal, items: billItems, poNo: po.poNo, note: `Received against PO ${po.poNo}` });
      await poSvc.update(po.id, { status: "Received", receivedDate: date });
      toast.success("PO received, stock updated & bill posted"); setPoId(""); setPoLines([]); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Receive Stock" icon={ArrowDownToLine} subtitle="Add stock via a Purchase Order or directly with a bill — auto-posts the expense to accounts" />
      <div className="flex gap-1 mb-5">
        {[["direct", "Direct (with bill)", FileText], ["po", "Against PO", ShoppingCart]].map(([k, label, Icon]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {label}</button>)}
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : tab === "direct" ? (
        <div className="glass rounded-xl2 shadow-glass p-5 space-y-4 max-w-3xl">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><span className="lbl">Vendor</span><RefSelect resource="vendors" labelKey="name" value={vendor} onChange={setVendor} placeholder="Vendor (optional)…" /></div>
            <label className="block"><span className="lbl">Bill / invoice no.</span><input value={billNo} onChange={(e) => setBillNo(e.target.value)} className="in" /></label>
            <label className="block"><span className="lbl">Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="in" /></label>
            <div><span className="lbl">Bill attachment</span><FileUpload value={billFile} onChange={setBillFile} folder="inv-bills" /></div>
          </div>
          <div>
            <p className="lbl">Items</p>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6"><select value={l.itemId} onChange={(e) => onPickItem(i, e.target.value)} className="in"><option value="">Select item…</option>{items.map((it) => <option key={it.id} value={it.id}>{it.name} · {it.categoryName} ({it.availableCount || 0} {it.unit})</option>)}</select></div>
                  <div className="col-span-2"><input type="number" value={l.qty} onChange={(e) => setLine(i, "qty", e.target.value)} placeholder="Qty" className="in" /></div>
                  <div className="col-span-3"><input type="number" value={l.unitCost} onChange={(e) => setLine(i, "unitCost", e.target.value)} placeholder="Unit ₹" className="in" /></div>
                  <div className="col-span-1 text-right"><button onClick={() => setLines((L) => L.filter((_, idx) => idx !== i))} className="text-coral-500"><Trash2 size={15} /></button></div>
                </div>
              ))}
            </div>
            <button onClick={() => setLines((L) => [...L, { itemId: "", qty: 1, unitCost: 0 }])} className="text-royal text-sm font-semibold flex items-center gap-1 mt-2"><Plus size={14} /> Add line</button>
          </div>
          <label className="block"><span className="lbl">Note</span><input value={note} onChange={(e) => setNote(e.target.value)} className="in" /></label>
          <div className="flex items-center justify-between border-t border-navy/8 pt-3">
            <p className="text-sm text-navy/60">Total: <b className="text-navy">{rupee(directTotal)}</b> <span className="text-xs text-navy/45">→ posts a payable to accounts</span></p>
            <Button onClick={submitDirect} disabled={saving}>{saving ? <Spinner size={14} /> : <Check size={15} />} Receive stock</Button>
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl2 shadow-glass p-5 space-y-4 max-w-3xl">
          <label className="block"><span className="lbl">Select an ordered PO</span><select value={poId} onChange={(e) => pickPO(e.target.value)} className="in"><option value="">Choose PO…</option>{pos.map((p) => <option key={p.id} value={p.id}>{p.poNo} · {p.vendorName} · {rupee(p.total)}</option>)}</select></label>
          {pos.length === 0 && <p className="text-sm text-navy/50">No open POs. Raise one in Purchase Orders, or use Direct.</p>}
          {poLines.length > 0 && (<>
            <div className="rounded-xl border border-navy/10 divide-y divide-navy/5">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs uppercase text-navy/45"><span className="col-span-6">Item</span><span className="col-span-2">Ordered</span><span className="col-span-2">Receive</span><span className="col-span-2 text-right">Unit ₹</span></div>
              {poLines.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2 items-center text-sm"><span className="col-span-6 text-navy">{l.name}</span><span className="col-span-2 text-navy/60">{l.qty}</span><span className="col-span-2"><input type="number" value={l.recvQty} onChange={(e) => setPoLines((P) => P.map((x, idx) => (idx === i ? { ...x, recvQty: e.target.value } : x)))} className="in2" /></span><span className="col-span-2 text-right font-mono text-navy/70">{rupee(l.unitCost)}</span></div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-navy/8 pt-3">
              <p className="text-sm text-navy/60">Receiving: <b className="text-navy">{rupee(poTotal)}</b></p>
              <Button onClick={submitPO} disabled={saving}>{saving ? <Spinner size={14} /> : <Check size={15} />} Receive & close PO</Button>
            </div>
          </>)}
        </div>
      )}
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}.in2{height:34px;width:100%;border-radius:9px;background:rgba(255,255,255,.85);border:1px solid rgba(20,51,94,.12);padding:0 8px;font-size:13px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
