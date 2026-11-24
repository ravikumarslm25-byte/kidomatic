import { useState, useEffect, useMemo } from "react";
import { ShoppingCart, Plus, Trash2, Check, ArrowDownToLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { rupee } from "./invKit";

const poSvc = resourceService("invPOs");
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—");

export default function InvPurchaseOrders() {
  const toast = useToast();
  const nav = useNavigate();
  const [pos, setPOs] = useState([]); const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [form, setForm] = useState(null);

  const load = async () => { setLoading(true); const [p, it] = await Promise.all([poSvc.list({}), resourceService("invItems").list({})]); setPOs(normList(p).sort((a, b) => (b.date || "").localeCompare(a.date || ""))); setItems(normList(it)); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openNew = () => setForm({ vendorName: "", date: today(), expectedDate: "", items: [{ itemId: "", name: "", qty: 1, unitCost: 0 }], tax: 0, note: "" });
  const setLine = (i, k, v) => setForm((f) => ({ ...f, items: f.items.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)) }));
  const pickItem = (i, id) => { const it = items.find((x) => x.id === id); setForm((f) => ({ ...f, items: f.items.map((x, idx) => (idx === i ? { ...x, itemId: id, name: it?.name || "", unitCost: it?.unitCost || 0 } : x)) })); };
  const subtotal = form ? form.items.reduce((a, l) => a + (+l.qty || 0) * (+l.unitCost || 0), 0) : 0;
  const total = subtotal + (form ? +form.tax || 0 : 0);

  const save = async () => {
    const valid = form.items.filter((l) => l.itemId && +l.qty > 0);
    if (!form.vendorName || !valid.length) { toast.error("Vendor and at least one item required"); return; }
    setSaving(true);
    try {
      const poNo = `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
      await poSvc.create({ poNo, vendorName: form.vendorName, date: form.date, expectedDate: form.expectedDate, items: valid.map((l) => ({ itemId: l.itemId, name: l.name, qty: +l.qty, unitCost: +l.unitCost || 0, total: +l.qty * (+l.unitCost || 0) })), subtotal, tax: +form.tax || 0, total, status: "Ordered", note: form.note, createdAt: new Date().toISOString() });
      toast.success(`${poNo} raised`); setForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (p) => { await poSvc.remove(p.id); load(); };

  return (
    <div>
      <PageHeader title="Purchase Orders" icon={ShoppingCart} subtitle="Raise a PO to a vendor · receive it in Receive Stock to add inventory & post the bill"
        actions={<Button onClick={openNew}><Plus size={16} /> Raise PO</Button>} />
      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (
        <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">PO</th><th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-center">Items</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 w-24" /></tr></thead>
            <tbody>
              {pos.map((p) => (
                <tr key={p.id} className="border-b border-navy/5 hover:bg-white/40">
                  <td className="px-4 py-2.5 font-mono text-xs text-navy/70">{p.poNo}</td>
                  <td className="px-4 py-2.5 font-medium text-navy">{p.vendorName}</td>
                  <td className="px-4 py-2.5 text-navy/60">{fmt(p.date)}</td>
                  <td className="px-4 py-2.5 text-center text-navy/70">{(p.items || []).length}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{rupee(p.total)}</td>
                  <td className="px-4 py-2.5"><Badge color={p.status === "Received" ? "green" : p.status === "Cancelled" ? "gray" : "amber"}>{p.status}</Badge></td>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2 justify-end">{p.status === "Ordered" && <button onClick={() => nav("/inventory/receive")} className="text-emerald-600 text-xs font-semibold flex items-center gap-1"><ArrowDownToLine size={13} /> Receive</button>}<button onClick={() => del(p)} className="text-coral-500"><Trash2 size={14} /></button></div></td>
                </tr>
              ))}
              {pos.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">No purchase orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title="Raise purchase order" size="lg" footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} saveLabel="Raise PO" />}>
        {form && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div><span className="lbl">Vendor *</span><RefSelect resource="vendors" labelKey="name" value={form.vendorName} onChange={(v) => setForm((f) => ({ ...f, vendorName: v }))} placeholder="Vendor…" /></div>
              <label className="block"><span className="lbl">PO date</span><input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Expected delivery</span><input type="date" value={form.expectedDate} onChange={(e) => setForm((f) => ({ ...f, expectedDate: e.target.value }))} className="in" /></label>
            </div>
            <div>
              <p className="lbl">Items</p>
              <div className="space-y-2">
                {form.items.map((l, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6"><select value={l.itemId} onChange={(e) => pickItem(i, e.target.value)} className="in"><option value="">Select item…</option>{items.map((it) => <option key={it.id} value={it.id}>{it.name} · {it.categoryName}</option>)}</select></div>
                    <div className="col-span-2"><input type="number" value={l.qty} onChange={(e) => setLine(i, "qty", e.target.value)} placeholder="Qty" className="in" /></div>
                    <div className="col-span-3"><input type="number" value={l.unitCost} onChange={(e) => setLine(i, "unitCost", e.target.value)} placeholder="Unit ₹" className="in" /></div>
                    <div className="col-span-1 text-right"><button onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))} className="text-coral-500"><Trash2 size={15} /></button></div>
                  </div>
                ))}
              </div>
              <button onClick={() => setForm((f) => ({ ...f, items: [...f.items, { itemId: "", name: "", qty: 1, unitCost: 0 }] }))} className="text-royal text-sm font-semibold flex items-center gap-1 mt-2"><Plus size={14} /> Add line</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 items-end">
              <label className="block"><span className="lbl">Tax / GST (₹)</span><input type="number" value={form.tax} onChange={(e) => setForm((f) => ({ ...f, tax: e.target.value }))} className="in" /></label>
              <p className="text-sm text-navy/60 text-right">Subtotal {rupee(subtotal)} · <b className="text-navy">Total {rupee(total)}</b></p>
            </div>
            <label className="block"><span className="lbl">Note</span><input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} className="in" /></label>
          </div>
        )}
      </Modal>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
