import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Pencil, Trash2, AlertTriangle, ChevronRight, Boxes, PackageX, ArrowDownToLine, ArrowUpFromLine, LineChart, ShoppingCart } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { rupee, isLow, stockValue } from "./invKit";

const catSvc = resourceService("invCategories");

export default function InvCategories() {
  const nav = useNavigate();
  const toast = useToast();
  const [cats, setCats] = useState([]); const [subs, setSubs] = useState([]); const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [form, setForm] = useState(null);

  const load = async () => {
    setLoading(true);
    const [c, sc, it] = await Promise.all([catSvc.list({}), resourceService("invSubCategories").list({}), resourceService("invItems").list({})]);
    setCats(normList(c)); setSubs(normList(sc)); setItems(normList(it)); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const stat = useMemo(() => {
    const per = {};
    cats.forEach((c) => { per[c.id] = { subs: 0, items: 0, low: 0, value: 0 }; });
    subs.forEach((s) => { if (per[s.categoryId]) per[s.categoryId].subs++; });
    items.forEach((it) => { const p = per[it.categoryId]; if (!p) return; p.items++; if (isLow(it)) p.low++; p.value += (+it.availableCount || 0) * (+it.unitCost || 0); });
    return per;
  }, [cats, subs, items]);
  const lowItems = useMemo(() => items.filter(isLow), [items]);

  const openNew = () => setForm({ name: "", description: "", active: true });
  const save = async () => { if (!form.name) { toast.error("Name required"); return; } setSaving(true); try { if (form.id) await catSvc.update(form.id, form); else await catSvc.create(form); toast.success("Category saved"); setForm(null); await load(); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };
  const del = async (c) => { if (stat[c.id]?.items) { toast.error("Category has items — move or delete them first"); return; } await catSvc.remove(c.id); load(); };

  const naves = [["/inventory/receive", "Receive stock", ArrowDownToLine], ["/inventory/issue", "Issue / take-out", ArrowUpFromLine], ["/inventory/po", "Purchase orders", ShoppingCart], ["/inventory/analysis", "Consumption analysis", LineChart]];

  return (
    <div>
      <PageHeader title="Inventory" icon={Package} subtitle="Every item — from a pin to a security whistle — by category & sub-category"
        actions={<Button onClick={openNew}><Plus size={16} /> New category</Button>} />

      <div className="flex flex-wrap gap-2 mb-4">
        {naves.map(([to, label, Icon]) => <button key={to} onClick={() => nav(to)} className="px-3.5 h-10 rounded-xl bg-white/60 border border-navy/10 text-sm font-medium text-navy/70 flex items-center gap-2 hover:bg-white"><Icon size={15} /> {label}</button>)}
      </div>

      {lowItems.length > 0 && (
        <div className="rounded-xl2 border border-amber-300 bg-amber-50 p-4 mb-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5" />
          <div><p className="font-semibold text-amber-800 text-sm">{lowItems.length} item(s) at or below reorder level</p>
            <p className="text-xs text-amber-700 mt-0.5">{lowItems.slice(0, 8).map((i) => `${i.name} (${i.availableCount || 0} ${i.unit || ""})`).join(" · ")}{lowItems.length > 8 ? " …" : ""}</p></div>
        </div>
      )}

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (
        <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3 w-12">S.No</th><th className="px-4 py-3">Category</th><th className="px-4 py-3 text-center">Sub-categories</th><th className="px-4 py-3 text-center">Items</th><th className="px-4 py-3 text-center">Low stock</th><th className="px-4 py-3 text-right">Stock value</th><th className="px-4 py-3 w-24" /></tr></thead>
            <tbody>
              {cats.map((c, i) => { const st = stat[c.id] || {}; return (
                <tr key={c.id} className="border-b border-navy/5 hover:bg-white/50 cursor-pointer" onClick={() => nav(`/inventory/cat/${c.id}`)}>
                  <td className="px-4 py-3 text-navy/40">{i + 1}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="h-8 w-8 rounded-lg bg-royal-100 grid place-items-center text-royal"><Boxes size={16} /></span><div><p className="font-semibold text-navy">{c.name}</p>{c.description && <p className="text-[11px] text-navy/45">{c.description}</p>}</div></div></td>
                  <td className="px-4 py-3 text-center text-navy/70">{st.subs || 0}</td>
                  <td className="px-4 py-3 text-center text-navy/70">{st.items || 0}</td>
                  <td className="px-4 py-3 text-center">{st.low ? <span className="inline-flex items-center gap-1 text-coral-600 font-semibold"><PackageX size={13} /> {st.low}</span> : <span className="text-navy/30">0</span>}</td>
                  <td className="px-4 py-3 text-right font-mono text-navy/70">{rupee(st.value || 0)}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setForm({ ...c })} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button>
                    <button onClick={() => del(c)} className="text-coral-500"><Trash2 size={14} /></button>
                    <ChevronRight size={16} className="text-navy/30" />
                  </div></td>
                </tr>
              ); })}
              {cats.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">No categories.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit category" : "New category"} footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="space-y-4">
            <label className="block"><span className="lbl">Category name</span><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="in" /></label>
            <label className="block"><span className="lbl">Description</span><input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="in" /></label>
          </div>
        )}
      </Modal>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
