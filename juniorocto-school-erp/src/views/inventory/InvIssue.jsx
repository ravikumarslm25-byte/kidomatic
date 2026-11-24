import { useState, useEffect, useMemo } from "react";
import { ArrowUpFromLine, Check, Search } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";
import { rupee, ISSUE_TYPES, isLow } from "./invKit";

const itemSvc = resourceService("invItems");
const issueSvc = resourceService("invIssues");
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—");

export default function InvIssue() {
  const toast = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState([]); const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ itemId: "", qty: 1, issuedToType: "Staff / Teacher", recipientName: "", recipientId: "", purpose: "", date: today(), note: "" });
  const [q, setQ] = useState("");

  const load = async () => { setLoading(true); const [it, is] = await Promise.all([itemSvc.list({}), issueSvc.list({})]); setItems(normList(it)); setIssues(normList(is)); setLoading(false); };
  useEffect(() => { load(); }, []);

  const item = items.find((i) => i.id === f.itemId);
  const cost = (item ? +item.unitCost || 0 : 0) * (+f.qty || 0);
  const recent = useMemo(() => [...issues].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 20), [issues]);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const useRef = ["Student"].includes(f.issuedToType) ? "students" : ["Staff / Teacher", "Class / Advisor", "PT Master", "Cleaner", "Security", "Admin Team"].includes(f.issuedToType) ? "staff" : null;

  const submit = async () => {
    if (!item) { toast.error("Select an item"); return; }
    const qty = +f.qty || 0;
    if (qty <= 0) { toast.error("Quantity must be positive"); return; }
    if (qty > (+item.availableCount || 0)) { toast.error(`Only ${item.availableCount || 0} ${item.unit} available`); return; }
    if (!f.recipientName) { toast.error("Who is taking it out?"); return; }
    setSaving(true);
    try {
      await itemSvc.update(item.id, { availableCount: (+item.availableCount || 0) - qty });
      await issueSvc.create({ itemId: item.id, itemName: item.name, categoryName: item.categoryName, subCategoryName: item.subCategoryName, qty, unitCost: +item.unitCost || 0, cost: qty * (+item.unitCost || 0), issuedToType: f.issuedToType, recipientId: f.recipientId, recipientName: f.recipientName, purpose: f.purpose, date: f.date, issuedBy: user?.name || "admin", note: f.note });
      toast.success(`${qty} ${item.unit} issued to ${f.recipientName}`);
      setF({ itemId: "", qty: 1, issuedToType: f.issuedToType, recipientName: "", recipientId: "", purpose: "", date: today(), note: "" }); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Issue / Take-out" icon={ArrowUpFromLine} subtitle="Track who takes what — students, teachers, PT master, cleaner, admin — every unit logged" />
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 glass rounded-xl2 shadow-glass p-5 space-y-4 self-start">
          <label className="block"><span className="lbl">Item *</span><select value={f.itemId} onChange={(e) => set("itemId", e.target.value)} className="in"><option value="">Select item…</option>{items.map((it) => <option key={it.id} value={it.id}>{it.name} · {it.categoryName} ({it.availableCount || 0} {it.unit})</option>)}</select></label>
          {item && <p className="text-xs text-navy/55">Available: <b className={isLow(item) ? "text-coral-600" : "text-navy"}>{item.availableCount || 0} {item.unit}</b> · unit {rupee(item.unitCost)}</p>}
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="lbl">Quantity *</span><input type="number" value={f.qty} onChange={(e) => set("qty", e.target.value)} className="in" /></label>
            <label className="block"><span className="lbl">Date</span><input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className="in" /></label>
          </div>
          <label className="block"><span className="lbl">Issued to (type)</span><select value={f.issuedToType} onChange={(e) => { set("issuedToType", e.target.value); set("recipientName", ""); set("recipientId", ""); }} className="in">{ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
          {useRef
            ? <div><span className="lbl">Recipient *</span><RefSelect resource={useRef} labelKey="name" value={f.recipientName} onChange={(v) => set("recipientName", v)} placeholder={`Select ${useRef}…`} /></div>
            : <label className="block"><span className="lbl">Recipient name *</span><input value={f.recipientName} onChange={(e) => set("recipientName", e.target.value)} className="in" placeholder="Name / class / team" /></label>}
          <label className="block"><span className="lbl">Purpose</span><input value={f.purpose} onChange={(e) => set("purpose", e.target.value)} className="in" placeholder="e.g. Class 3 uniform kit, PT session" /></label>
          <label className="block"><span className="lbl">Note</span><input value={f.note} onChange={(e) => set("note", e.target.value)} className="in" /></label>
          <div className="flex items-center justify-between border-t border-navy/8 pt-3">
            <p className="text-sm text-navy/60">Value: <b className="text-navy">{rupee(cost)}</b></p>
            <Button onClick={submit} disabled={saving}>{saving ? <Spinner size={14} /> : <Check size={15} />} Issue</Button>
          </div>
        </div>

        <div className="lg:col-span-3 glass rounded-xl2 shadow-glass overflow-hidden self-start">
          <div className="px-5 py-3 border-b border-navy/8"><p className="font-semibold text-navy text-sm">Recent issues</p></div>
          {loading ? <div className="grid place-items-center py-16"><Spinner size={22} /></div> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Item</th><th className="px-4 py-2.5">Taken by</th><th className="px-4 py-2.5 text-right">Qty</th><th className="px-4 py-2.5 text-right">Value</th></tr></thead>
              <tbody>
                {recent.map((x) => (
                  <tr key={x.id} className="border-b border-navy/5"><td className="px-4 py-2 text-navy/55">{fmt(x.date)}</td><td className="px-4 py-2 text-navy">{x.itemName}<p className="text-[10px] text-navy/40">{x.categoryName}</p></td><td className="px-4 py-2"><span className="text-navy/75">{x.recipientName}</span><p className="text-[10px] text-navy/40">{x.issuedToType} · by {x.issuedBy}</p></td><td className="px-4 py-2 text-right font-mono text-coral-600">−{x.qty}</td><td className="px-4 py-2 text-right font-mono text-navy/60">{rupee(x.cost)}</td></tr>
                ))}
                {recent.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-navy/40">No issues logged yet.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
