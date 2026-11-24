import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { School, Plus, ArrowRight } from "lucide-react";
import { resellerService } from "@/services/reseller.service";
import { PLANS, planList } from "@/config/plans";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Field from "@/components/ui/Field";
import { useToast } from "@/store/toast";

export default function Schools() {
  const toast = useToast();
  const nav = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); try { setSchools(await resellerService.schools()); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const create = async () => {
    if (!form.name) { toast.error("School name is required"); return; }
    setSaving(true);
    try { await resellerService.createSchool({ planKey: "starter", session: "2026–27", ...form }); setForm(null); toast.success("School created"); load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Schools" icon={School} subtitle={`${schools.length} in your network`}
        actions={<Button onClick={() => setForm({ planKey: "starter" })}><Plus size={16} /> New School</Button>} />

      {loading ? (
        <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {schools.map((s) => {
            const c = s.branding?.colors || {};
            return (
              <Card key={s.id} className="flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="min-w-0"><h3 className="font-display text-navy text-lg truncate">{s.name}</h3><p className="text-xs text-navy/45">{s.board} · {s.session}</p></div>
                  <Badge>{s.status}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge color="blue">{PLANS[s.planKey]?.name || s.planKey}</Badge>
                  <span className="text-xs text-navy/50">{s.students ?? 0} students</span>
                  <div className="flex-1" />
                  {[c.blue, c.coral].filter(Boolean).map((col, i) => <span key={i} className="h-5 w-5 rounded-lg border border-white/70 shadow-sm" style={{ background: col }} />)}
                </div>
                <Button variant="outline" className="mt-4 w-full" onClick={() => nav(`/schools/${s.id}`)}>Manage <ArrowRight size={15} /></Button>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title="New School"
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={create} saving={saving} saveLabel="Create" />}>
        {form && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Field label="School name" name="name" value={form.name} onChange={set} required /></div>
            <Field label="Board" name="board" type="select" options={["CBSE", "ICSE", "State Board", "IB"]} value={form.board} onChange={set} />
            <Field label="Academic session" name="session" value={form.session || "2026–27"} onChange={set} />
            <div className="sm:col-span-2">
              <span className="block text-xs font-semibold text-navy/60 mb-1.5">Plan</span>
              <div className="grid grid-cols-3 gap-2">
                {planList().map((p) => (
                  <button key={p.key} type="button" onClick={() => set("planKey", p.key)}
                    className={`rounded-xl border p-2.5 text-left ${form.planKey === p.key ? "border-royal/50 bg-royal-100" : "border-navy/10 bg-white/50"}`}>
                    <p className="font-semibold text-navy text-sm">{p.name}</p><p className="text-[10px] text-navy/50">₹{p.priceMonthly}/mo</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
