import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Package, Plus, Pencil, Trash2, Eye, ArrowLeft, AlertTriangle, FolderPlus, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { rupee, UNITS, isLow, daysUntil } from "./invKit";

const itemSvc = resourceService("invItems");
const subSvc = resourceService("invSubCategories");
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—");

export default function InvCategoryItems() {
  const { catId } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [cat, setCat] = useState(null); const [subs, setSubs] = useState([]); const [items, setItems] = useState([]); const [issues, setIssues] = useState([]); const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null); const [subForm, setSubForm] = useState(null); const [view, setView] = useState(null);
  const [fSub, setFSub] = useState("");

  const load = async () => {
    setLoading(true);
    const [c, sc, it, is, rc] = await Promise.all([resourceService("invCategories").list({}), subSvc.list({}), itemSvc.list({}), resourceService("invIssues").list({}), resourceService("invReceipts").list({})]);
    setCat(normList(c).find((x) => x.id === catId) || null); setSubs(normList(sc).filter((x) => x.categoryId === catId)); setItems(normList(it).filter((x) => x.categoryId === catId)); setIssues(normList(is)); setReceipts(normList(rc)); setLoading(false);
  };
  useEffect(() => { load(); }, [catId]);

  const shown = useMemo(() => items.filter((i) => !fSub || i.subCategoryId === fSub), [items, fSub]);

  const openItem = (it) => setForm(it ? { ...it, _edit: true } : { name: "", sku: "", categoryId: catId, categoryName: cat?.name || "", subCategoryId: "", subCategoryName: "", unit: "pcs", unitCost: 0, availableCount: 0, reorderLevel: 5, expiryApplicable: false, expiryDate: "", location: "", notes: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const saveItem = async () => {
    if (!form.name || !form.subCategoryId) { toast.error("Item name and sub-category required"); return; }
    setSaving(true);
    try {
      const sub = subs.find((s) => s.id === form.subCategoryId);
      const base = { ...form, categoryName: cat?.name || "", subCategoryName: sub?.name || "", unitCost: +form.unitCost || 0, reorderLevel: +form.reorderLevel || 0 };
      delete base._edit;
      if (form.id) { const { availableCount, lastOrderedDate, ...editable } = base; await itemSvc.update(form.id, editable); } // count + lastOrdered locked on edit
      else await itemSvc.create({ ...base, availableCount: 0, lastOrderedDate: "", createdAt: new Date().toISOString() });
      toast.success("Item saved"); setForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const delItem = async (it) => { await itemSvc.remove(it.id); load(); };

  const saveSub = async () => { if (!subForm.name) { toast.error("Name required"); return; } setSaving(true); try { await subSvc.create({ name: subForm.name, categoryId: catId, categoryName: cat?.name || "", note: subForm.note || "" }); toast.success("Sub-category added"); setSubForm(null); await load(); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };

  const itemMoves = (id) => ({ rec: receipts.filter((r) => r.itemId === id), iss: issues.filter((i) => i.itemId === id) });

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;

  return (
    <div>
      <button onClick={() => nav("/inventory")} className="text-sm text-navy/50 flex items-center gap-1 mb-2"><ArrowLeft size={14} /> All categories</button>
      <PageHeader title={cat?.name || "Category"} icon={Package} subtitle={`${items.length} items · ${subs.length} sub-categories`}
        actions={<div className="flex gap-2"><Button variant="outline" onClick={() => setSubForm({ name: "", note: "" })}><FolderPlus size={15} /> Sub-category</Button><Button onClick={() => openItem()}><Plus size={16} /> Add item</Button></div>} />

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFSub("")} className={`px-3 h-8 rounded-lg text-sm ${!fSub ? "bg-royal-100 text-royal font-semibold" : "bg-white/60 border border-navy/10 text-navy/60"}`}>All ({items.length})</button>
        {subs.map((s) => { const n = items.filter((i) => i.subCategoryId === s.id).length; return <button key={s.id} onClick={() => setFSub(s.id)} className={`px-3 h-8 rounded-lg text-sm ${fSub === s.id ? "bg-royal-100 text-royal font-semibold" : "bg-white/60 border border-navy/10 text-navy/60"}`}>{s.name} ({n})</button>; })}
      </div>

      <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3 w-12">S.No</th><th className="px-4 py-3">Item</th><th className="px-4 py-3">Sub Category</th><th className="px-4 py-3 text-center">Availability</th><th className="px-4 py-3">Last Ordered</th><th className="px-4 py-3">Expiry</th><th className="px-4 py-3 text-right w-32">Actions</th></tr></thead>
          <tbody>
            {shown.map((it, i) => { const low = isLow(it); const exp = it.expiryDate ? daysUntil(it.expiryDate) : null; return (
              <tr key={it.id} className={`border-b border-navy/5 hover:bg-white/40 ${low ? "bg-amber-50/60" : ""}`}>
                <td className="px-4 py-2.5 text-navy/40">{i + 1}</td>
                <td className="px-4 py-2.5"><p className="font-medium text-navy">{it.name}</p>{it.sku && <p className="text-[11px] text-navy/40 font-mono">{it.sku}</p>}</td>
                <td className="px-4 py-2.5 text-navy/65">{it.subCategoryName}</td>
                <td className="px-4 py-2.5 text-center"><span className={`font-mono font-semibold ${low ? "text-coral-600" : "text-navy"}`}>{it.availableCount || 0}</span> <span className="text-[11px] text-navy/45">{it.unit}</span>{low && <AlertTriangle size={12} className="inline ml-1 text-amber-500" />}</td>
                <td className="px-4 py-2.5 text-navy/60">{fmt(it.lastOrderedDate)}</td>
                <td className="px-4 py-2.5">{it.expiryDate ? <span className={exp !== null && exp <= 30 ? "text-coral-600 font-medium" : "text-navy/60"}>{fmt(it.expiryDate)}</span> : <span className="text-navy/30">—</span>}</td>
                <td className="px-4 py-2.5"><div className="flex items-center gap-2 justify-end">
                  <button onClick={() => setView(it)} className="text-navy/40 hover:text-royal" title="View"><Eye size={15} /></button>
                  <button onClick={() => openItem(it)} className="text-navy/40 hover:text-navy" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => delItem(it)} className="text-coral-500" title="Delete"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ); })}
            {shown.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">No items. Add one with the button above.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-navy/45 mt-2">Availability & last-ordered are driven by <b>Receive stock</b> and <b>Issue</b> — they can't be edited directly.</p>

      {/* Item modal */}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit item" : "Add item"} footer={<ModalFooter onCancel={() => setForm(null)} onSave={saveItem} saving={saving} />}>
        {form && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block"><span className="lbl">Item name *</span><input value={form.name} onChange={(e) => set("name", e.target.value)} className="in" /></label>
              <label className="block"><span className="lbl">SKU / code</span><input value={form.sku} onChange={(e) => set("sku", e.target.value)} className="in" /></label>
              <label className="block"><span className="lbl">Sub-category *</span><select value={form.subCategoryId} onChange={(e) => set("subCategoryId", e.target.value)} className="in"><option value="">Select…</option>{subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
              <label className="block"><span className="lbl">Unit</span><select value={form.unit} onChange={(e) => set("unit", e.target.value)} className="in">{UNITS.map((u) => <option key={u}>{u}</option>)}</select></label>
              <label className="block"><span className="lbl">Unit cost (₹)</span><input type="number" value={form.unitCost} onChange={(e) => set("unitCost", e.target.value)} className="in" /></label>
              <label className="block"><span className="lbl">Reorder level (low-stock alert)</span><input type="number" value={form.reorderLevel} onChange={(e) => set("reorderLevel", e.target.value)} className="in" /></label>
              <label className="block"><span className="lbl">Available count</span><input value={form.availableCount || 0} disabled className="in opacity-60 cursor-not-allowed" /></label>
              <label className="block"><span className="lbl">Last ordered</span><input value={form.lastOrderedDate ? fmt(form.lastOrderedDate) : "—"} disabled className="in opacity-60 cursor-not-allowed" /></label>
              <label className="block"><span className="lbl">Storage location</span><input value={form.location} onChange={(e) => set("location", e.target.value)} className="in" /></label>
            </div>
            <div className="flex items-center gap-3">
              <Toggle label="Has expiry date" value={form.expiryApplicable} onChange={(v) => set("expiryApplicable", v)} />
              {form.expiryApplicable && <label className="block flex-1"><span className="lbl">Expiry date</span><input type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} className="in" /></label>}
            </div>
            <label className="block"><span className="lbl">Notes</span><input value={form.notes} onChange={(e) => set("notes", e.target.value)} className="in" /></label>
            {form.id && <p className="text-[11px] text-navy/45">Available count and last-ordered are locked — update them via Receive / Issue.</p>}
          </div>
        )}
      </Modal>

      {/* Sub-category modal */}
      <Modal open={!!subForm} onClose={() => setSubForm(null)} title="Add sub-category" footer={<ModalFooter onCancel={() => setSubForm(null)} onSave={saveSub} saving={saving} />}>
        {subForm && (
          <div className="space-y-4">
            <label className="block"><span className="lbl">Sub-category name</span><input value={subForm.name} onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value }))} className="in" /></label>
            <label className="block"><span className="lbl">Note</span><input value={subForm.note} onChange={(e) => setSubForm((f) => ({ ...f, note: e.target.value }))} className="in" /></label>
          </div>
        )}
      </Modal>

      {/* View modal */}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.name || "Item"} size="lg" footer={<ModalFooter onCancel={() => setView(null)} onSave={() => { setView(null); openItem(view); }} saveLabel="Edit" />}>
        {view && (() => { const mv = itemMoves(view.id); const used = mv.iss.reduce((a, x) => a + (+x.qty || 0), 0); const recd = mv.rec.reduce((a, x) => a + (+x.qty || 0), 0); return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat k="Available" v={`${view.availableCount || 0} ${view.unit}`} hi={isLow(view)} />
              <Stat k="Unit cost" v={rupee(view.unitCost)} />
              <Stat k="Stock value" v={rupee((+view.availableCount || 0) * (+view.unitCost || 0))} />
              <Stat k="Reorder at" v={`${view.reorderLevel || 0} ${view.unit}`} />
              <Stat k="Total received" v={`${recd} ${view.unit}`} />
              <Stat k="Total issued" v={`${used} ${view.unit}`} />
              <Stat k="Last ordered" v={fmt(view.lastOrderedDate)} />
              <Stat k="Expiry" v={view.expiryDate ? fmt(view.expiryDate) : "—"} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-royal mb-1.5">Recent issues</p>
              <div className="rounded-xl border border-navy/10 divide-y divide-navy/5 max-h-40 overflow-auto">
                {mv.iss.slice(-8).reverse().map((x, i) => <div key={i} className="flex justify-between text-sm px-3 py-1.5"><span className="text-navy/70">{fmt(x.date)} · {x.recipientName || x.issuedToType}</span><span className="font-mono text-coral-600">−{x.qty} {view.unit}</span></div>)}
                {mv.iss.length === 0 && <p className="text-sm text-navy/40 px-3 py-2">No issues yet.</p>}
              </div>
            </div>
          </div>
        ); })()}
      </Modal>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const Stat = ({ k, v, hi }) => <div className="rounded-xl bg-white/60 border border-navy/8 p-2.5"><p className="text-[11px] text-navy/45">{k}</p><p className={`font-semibold ${hi ? "text-coral-600" : "text-navy"}`}>{v}</p></div>;
const Toggle = ({ label, value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)} className="flex items-center gap-2">
    <span className="rounded-full transition relative" style={{ width: 40, height: 22, background: value ? "#1651A3" : "rgba(20,51,94,.2)" }}><span className="absolute top-0.5 rounded-full bg-white transition" style={{ height: 18, width: 18, left: value ? 20 : 2 }} /></span>
    <span className="text-sm text-navy/70">{label}</span>
  </button>
);
