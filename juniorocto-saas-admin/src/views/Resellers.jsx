import { useEffect, useState } from "react";
import { Store, Plus, Percent, Ban, Check } from "lucide-react";
import { platformService } from "@/services/platform.service";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Spinner from "@/components/ui/Spinner";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Field from "@/components/ui/Field";
import { useToast } from "@/store/toast";

export default function Resellers() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); try { setRows(await platformService.resellers()); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const create = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    setSaving(true);
    try { await platformService.createReseller(form); setForm(null); toast.success("Reseller created"); load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const toggle = async (r) => { const status = r.status === "active" ? "suspended" : "active"; await platformService.updateReseller(r.id, { status }); toast.success(`${r.name} ${status}`); load(); };

  return (
    <div>
      <PageHeader title="Resellers" icon={Store} subtitle={`${rows.length} partners`}
        actions={<Button onClick={() => setForm({})}><Plus size={16} /> New Reseller</Button>} />
      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={26} /></div> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start gap-3">
                <Avatar name={r.name} size={42} />
                <div className="flex-1 min-w-0"><h3 className="font-display text-navy text-lg truncate">{r.name}</h3><p className="text-xs text-navy/45 truncate">{r.contactEmail}</p></div>
                <Badge>{r.status}</Badge>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-navy/70"><Percent size={14} className="text-royal" /> {r.commissionPct}% commission</div>
                <div className="text-navy/50">·</div>
                <div className="text-navy/60">{r.revenueSharePct}% platform</div>
              </div>
              <Button variant={r.status === "active" ? "outline" : "primary"} className="mt-4 w-full" onClick={() => toggle(r)}>
                {r.status === "active" ? <><Ban size={15} /> Suspend</> : <><Check size={15} /> Reactivate</>}
              </Button>
            </Card>
          ))}
        </div>
      )}
      <Modal open={!!form} onClose={() => setForm(null)} title="New Reseller" size="sm"
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={create} saving={saving} saveLabel="Create" />}>
        {form && (<div className="space-y-4">
          <Field label="Partner name" name="name" value={form.name} onChange={set} required />
          <Field label="Contact email" name="contactEmail" type="email" value={form.contactEmail} onChange={set} />
          <Field label="Commission %" name="commissionPct" value={form.commissionPct} onChange={set} />
        </div>)}
      </Modal>
    </div>
  );
}
