import { useState, useEffect, useMemo } from "react";
import { Target, Plus, Trash2, Pencil, Wand2, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { rupee, CUR_YEAR, ledgerAll, inYear } from "./accountsKit";

const budSvc = resourceService("budgets");

export default function Budgeting() {
  const toast = useToast();
  const [budgets, setBudgets] = useState([]); const [tx, setTx] = useState([]); const [payments, setPayments] = useState([]); const [payslips, setPayslips] = useState([]); const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [year, setYear] = useState(CUR_YEAR); const [form, setForm] = useState(null);
  const prevYear = String(+year - 1);

  const load = async () => {
    setLoading(true);
    const [b, t, p, s, h] = await Promise.all([budSvc.list({}), resourceService("transactions").list({}), resourceService("payments").list({}), resourceService("payslips").list({}), resourceService("accountHeads").list({})]);
    setBudgets(normList(b)); setTx(normList(t)); setPayments(normList(p)); setPayslips(normList(s)); setHeads(normList(h)); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const all = useMemo(() => ledgerAll(tx, payments, payslips), [tx, payments, payslips]);
  // actuals by head for a given year (expense)
  const actualsFor = (yr) => { const map = {}; inYear(all, yr).filter((e) => e.type === "Expense").forEach((e) => { const k = e.head || "Other"; map[k] = (map[k] || 0) + (+e.amount || 0); }); return map; };
  const prevActuals = useMemo(() => actualsFor(prevYear), [all, prevYear]);
  const thisActuals = useMemo(() => actualsFor(year), [all, year]);

  const lines = budgets.filter((b) => b.year === year);
  const expenseHeads = heads.filter((h) => h.type === "Expense");

  const totals = useMemo(() => {
    const planned = lines.reduce((a, b) => a + (+b.planned || 0), 0);
    const lastYr = lines.reduce((a, b) => a + (+b.lastYearActual || prevActuals[b.head] || 0), 0);
    const spent = lines.reduce((a, b) => a + (thisActuals[b.head] || 0), 0);
    return { planned, lastYr, spent };
  }, [lines, prevActuals, thisActuals]);

  const open = (b) => setForm(b ? { ...b } : { year, department: "", head: "", planned: 0, minChangePct: -10, maxChangePct: 15, note: "" });
  const save = async () => {
    if (!form.head) { toast.error("Pick a head"); return; }
    setSaving(true);
    try { const p = { ...form, planned: +form.planned || 0, lastYearActual: prevActuals[form.head] || +form.lastYearActual || 0, minChangePct: +form.minChangePct || 0, maxChangePct: +form.maxChangePct || 0 }; if (form.id) await budSvc.update(form.id, p); else await budSvc.create(p); toast.success("Budget saved"); setForm(null); await load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (b) => { await budSvc.remove(b.id); load(); };

  const generateFromLastYear = async () => {
    setSaving(true);
    try {
      const existing = new Set(lines.map((l) => l.head));
      const toAdd = expenseHeads.filter((h) => (prevActuals[h.name] || 0) > 0 && !existing.has(h.name));
      if (!toAdd.length) { toast.error("No last-year actuals to seed from (record some expenses in " + prevYear + ")"); setSaving(false); return; }
      await Promise.all(toAdd.map((h) => budSvc.create({ year, department: h.department || "", head: h.name, planned: Math.round((prevActuals[h.name] || 0) * 1.1), lastYearActual: prevActuals[h.name] || 0, minChangePct: -10, maxChangePct: 15, note: "" })));
      toast.success(`${toAdd.length} budget lines created from ${prevYear} actuals`); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const changePct = (b) => { const ly = +b.lastYearActual || prevActuals[b.head] || 0; return ly ? Math.round(((+b.planned || 0) - ly) / ly * 100) : 0; };
  const outside = (b) => { const c = changePct(b); return c < (+b.minChangePct || -999) || c > (+b.maxChangePct || 999); };

  return (
    <div>
      <PageHeader title="Budgeting" icon={Target} subtitle="Plan dept-wise from last year's actuals · guardrails on increase / decrease"
        actions={<div className="flex gap-2"><Button variant="outline" onClick={generateFromLastYear} disabled={saving}><Wand2 size={15} /> Seed from {prevYear}</Button><Button onClick={() => open()}><Plus size={16} /> Budget line</Button></div>} />

      <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex flex-wrap gap-4 items-center">
        <div><p className="lbl">Year</p><input value={year} onChange={(e) => setYear(e.target.value)} className="ctl w-24" /></div>
        <Stat k={`${prevYear} actual`} v={rupee(totals.lastYr)} />
        <Stat k="Planned budget" v={rupee(totals.planned)} accent />
        <Stat k={`${year} spent`} v={rupee(totals.spent)} />
        <Stat k="Remaining" v={rupee(totals.planned - totals.spent)} />
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (
        <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Head</th><th className="px-4 py-3">Dept</th><th className="px-4 py-3 text-right">{prevYear} actual</th><th className="px-4 py-3 text-right">Planned</th><th className="px-4 py-3 text-center">Change</th><th className="px-4 py-3 text-right">Spent</th><th className="px-4 py-3">Utilisation</th><th className="px-4 py-3 w-14" /></tr></thead>
            <tbody>
              {lines.map((b) => { const ly = +b.lastYearActual || prevActuals[b.head] || 0; const spent = thisActuals[b.head] || 0; const util = b.planned ? Math.round(spent / b.planned * 100) : 0; const c = changePct(b); const bad = outside(b); return (
                <tr key={b.id} className="border-b border-navy/5">
                  <td className="px-4 py-2.5 font-medium text-navy">{b.head}</td>
                  <td className="px-4 py-2.5 text-navy/60">{b.department || "—"}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-navy/60">{rupee(ly)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">{rupee(b.planned)}</td>
                  <td className="px-4 py-2.5 text-center"><span className={`text-xs font-semibold ${c > 0 ? "text-coral-600" : c < 0 ? "text-emerald-600" : "text-navy/40"}`}>{c > 0 ? "+" : ""}{c}%</span>{bad && <AlertTriangle size={12} className="inline ml-1 text-amber-500" title={`Outside ${b.minChangePct}% … ${b.maxChangePct}% guardrail`} />}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-navy/70">{rupee(spent)}</td>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2"><div className="h-1.5 w-20 rounded-full bg-navy/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, util)}%`, background: util > 100 ? "#dc2626" : util > 85 ? "#d97706" : "#16a34a" }} /></div><span className="text-xs text-navy/50">{util}%</span></div></td>
                  <td className="px-4 py-2.5"><div className="flex gap-1.5"><button onClick={() => open(b)} className="text-navy/40 hover:text-navy"><Pencil size={13} /></button><button onClick={() => del(b)} className="text-coral-500"><Trash2 size={13} /></button></div></td>
                </tr>
              ); })}
              {lines.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-navy/40">No budget lines for {year}. Add one, or seed from {prevYear} actuals.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit budget line" : "New budget line"} footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="space-y-4">
            <label className="block"><span className="lbl">Expense head</span><select value={form.head} onChange={(e) => setForm((f) => ({ ...f, head: e.target.value }))} className="in"><option value="">Select head…</option>{expenseHeads.map((h) => <option key={h.id}>{h.name}</option>)}</select></label>
            {form.head && <p className="text-xs text-navy/50">{prevYear} actual for this head: <b>{rupee(prevActuals[form.head] || 0)}</b></p>}
            <div><span className="lbl">Department</span><RefSelect resource="departments" labelKey="name" value={form.department} onChange={(v) => setForm((f) => ({ ...f, department: v }))} placeholder="Optional…" /></div>
            <label className="block"><span className="lbl">Planned budget (₹)</span><input type="number" value={form.planned} onChange={(e) => setForm((f) => ({ ...f, planned: e.target.value }))} className="in" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="lbl">Min change %</span><input type="number" value={form.minChangePct} onChange={(e) => setForm((f) => ({ ...f, minChangePct: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Max change %</span><input type="number" value={form.maxChangePct} onChange={(e) => setForm((f) => ({ ...f, maxChangePct: e.target.value }))} className="in" /></label>
            </div>
            {form.head && <p className="text-xs text-navy/55">Planned vs last year: <b className={outside(form) ? "text-amber-600" : "text-navy"}>{changePct(form) > 0 ? "+" : ""}{changePct(form)}%</b>{outside(form) && " — outside guardrail"}</p>}
            <label className="block"><span className="lbl">Note</span><input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} className="in" /></label>
          </div>
        )}
      </Modal>
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const Stat = ({ k, v, accent }) => <div><p className="text-[11px] text-navy/45">{k}</p><p className={`font-display text-lg ${accent ? "text-royal" : "text-navy"}`}>{v}</p></div>;
