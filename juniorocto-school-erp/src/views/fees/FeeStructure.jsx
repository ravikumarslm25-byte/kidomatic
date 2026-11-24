import { useState, useEffect } from "react";
import { ReceiptText, Plus, Trash2, Pencil, Save, Copy } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { CATEGORIES, HEAD_TYPES, DEFAULT_TERMS, CUR_YEAR, rupee, uid, billableItems } from "./feeKit";

const svc = resourceService("feeStructures");
const blankHead = () => ({ id: uid(), title: "", category: "Tuition / Term", type: "Term-wise", amount: 0, termAmounts: {} });

export default function FeeStructure() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [klass, setKlass] = useState(""); const [year, setYear] = useState(CUR_YEAR);
  const [terms, setTerms] = useState(DEFAULT_TERMS);
  const [heads, setHeads] = useState([]); const [docId, setDocId] = useState(null);

  const load = async () => { setLoading(true); setRows(normList(await svc.list({}))); setLoading(false); };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!klass) { setHeads([]); setDocId(null); return; }
    const found = rows.find((r) => r.klass === klass && (r.academicYear || CUR_YEAR) === year);
    if (found) { setHeads(found.heads || []); setTerms(found.terms || DEFAULT_TERMS); setDocId(found.id); }
    else { setHeads([]); setTerms(DEFAULT_TERMS); setDocId(null); }
  }, [klass, year, rows]);

  const setHead = (i, k, v) => setHeads((a) => a.map((h, idx) => (idx === i ? { ...h, [k]: v } : h)));
  const setTermAmt = (i, term, v) => setHeads((a) => a.map((h, idx) => (idx === i ? { ...h, termAmounts: { ...h.termAmounts, [term]: +v || 0 } } : h)));
  const addHead = () => setHeads((a) => [...a, blankHead()]);
  const removeHead = (i) => setHeads((a) => a.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!klass) { toast.error("Select a class"); return; }
    setSaving(true);
    try {
      const clean = heads.filter((h) => h.title).map((h) => ({ ...h, amount: +h.amount || 0 }));
      const payload = { klass, academicYear: year, terms, heads: clean, status: "Active" };
      if (docId) await svc.update(docId, payload); else { const c = await svc.create(payload); setDocId(c.id || c._id); }
      toast.success("Fee structure saved"); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const total = heads.reduce((s, h) => s + (h.type === "Term-wise" ? terms.reduce((t, tm) => t + (+(h.termAmounts?.[tm] ?? (+h.amount || 0) / terms.length) || 0), 0) : +h.amount || 0), 0);

  return (
    <div>
      <PageHeader title="Fee Structure" icon={ReceiptText} subtitle="Year-wise, class-wise, fully dynamic — add any fee head (term / one-time / activity)" />
      <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="w-48"><p className="text-xs font-semibold text-navy/60 mb-1.5">Class</p><RefSelect resource="classes" labelKey="name" value={klass} onChange={setKlass} placeholder="Select class…" /></div>
        <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Academic year</p><input value={year} onChange={(e) => setYear(e.target.value)} className="ctl w-32" /></div>
        <div className="flex-1"><p className="text-xs font-semibold text-navy/60 mb-1.5">Terms (comma-sep)</p><input value={terms.join(", ")} onChange={(e) => setTerms(e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} className="ctl w-full" /></div>
        {klass && <Button onClick={save} disabled={saving}>{saving ? <><Spinner size={14} /> Saving…</> : <><Save size={15} /> Save structure</>}</Button>}
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div>
        : !klass ? <div className="glass rounded-xl2 shadow-glass py-14 text-center text-navy/50">Pick a class to build its fee structure.</div> : (
          <div className="glass rounded-xl2 shadow-glass p-5">
            <div className="flex items-center justify-between mb-3"><h3 className="font-display text-navy">{klass} · {year}</h3><span className="text-sm text-navy/60">Annual total: <b className="text-navy">{rupee(total)}</b></span></div>
            <div className="space-y-3">
              {heads.map((h, i) => (
                <div key={h.id} className="rounded-xl border border-navy/10 bg-white/50 p-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                    <label className="block col-span-2 sm:col-span-1"><span className="lbl">Fee title</span><input value={h.title} onChange={(e) => setHead(i, "title", e.target.value)} placeholder="e.g. Book Fees" className="in2" /></label>
                    <label className="block"><span className="lbl">Category</span><select value={h.category} onChange={(e) => setHead(i, "category", e.target.value)} className="in2">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
                    <label className="block"><span className="lbl">Type</span><select value={h.type} onChange={(e) => setHead(i, "type", e.target.value)} className="in2">{HEAD_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
                    {h.type !== "Term-wise" && <label className="block"><span className="lbl">Amount (₹)</span><input type="number" value={h.amount} onChange={(e) => setHead(i, "amount", e.target.value)} className="in2" /></label>}
                    <button onClick={() => removeHead(i)} className="text-coral-500 justify-self-end sm:col-start-4"><Trash2 size={15} /></button>
                  </div>
                  {h.type === "Term-wise" && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {terms.map((t) => <label key={t} className="block"><span className="lbl">{t}</span><input type="number" value={h.termAmounts?.[t] ?? ""} onChange={(e) => setTermAmt(i, t, e.target.value)} placeholder="0" className="in2 w-24" /></label>)}
                    </div>
                  )}
                  {h.type === "One-time (beginning)" && <p className="text-[11px] text-navy/45 mt-1.5">Collected once at the start of the year (e.g. June).</p>}
                  {h.type === "Activity (optional)" && <p className="text-[11px] text-navy/45 mt-1.5">Optional — only billed to opted-in students.</p>}
                </div>
              ))}
              <button onClick={addHead} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add fee head</button>
            </div>
          </div>
        )}
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}.lbl{display:block;font-size:10px;font-weight:600;color:rgba(20,51,94,.5);margin-bottom:3px}.in2{height:36px;width:100%;border-radius:10px;background:rgba(255,255,255,.85);border:1px solid rgba(20,51,94,.12);padding:0 8px;font-size:13px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
