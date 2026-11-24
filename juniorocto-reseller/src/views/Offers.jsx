import { useEffect, useState } from "react";
import { Ticket, Plus, Copy } from "lucide-react";
import { resellerService } from "@/services/reseller.service";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Field from "@/components/ui/Field";
import { useToast } from "@/store/toast";

export default function Offers() {
  const toast = useToast();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); try { setOffers(await resellerService.offers()); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const create = async () => {
    if (!form.title || !form.code) { toast.error("Title and code are required"); return; }
    setSaving(true);
    try { await resellerService.createOffer({ discountType: "percent", ...form, value: Number(form.value) || 0 }); setForm(null); toast.success("Offer created"); load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Offers" icon={Ticket} subtitle="Promo codes you can share to win schools"
        actions={<Button onClick={() => setForm({ discountType: "percent" })}><Plus size={16} /> New Offer</Button>} />

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={26} /></div> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {offers.map((o) => (
            <Card key={o.id} className="relative">
              <div className="flex items-start justify-between">
                <div><h3 className="font-display text-navy text-lg">{o.title}</h3>
                  <button onClick={() => { navigator.clipboard?.writeText(o.code); toast.success("Code copied"); }} className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-navy/5 px-2 py-1 font-mono text-sm text-navy hover:bg-navy/10">{o.code} <Copy size={12} /></button>
                </div>
                <Badge color={o.status === "active" ? "emerald" : "coral"}>{o.status}</Badge>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div><p className="font-display text-3xl text-coral-600">{o.discountType === "percent" ? `${o.value}%` : `₹${o.value}`}</p><p className="text-xs text-navy/45">discount</p></div>
                <p className="text-xs text-navy/50">{o.uses}{o.maxUses ? ` / ${o.maxUses}` : ""} used</p>
              </div>
            </Card>
          ))}
          {offers.length === 0 && <p className="col-span-full text-center text-sm text-navy/45 py-10">No offers yet.</p>}
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title="New Offer" size="sm"
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={create} saving={saving} saveLabel="Create" />}>
        {form && (
          <div className="space-y-4">
            <Field label="Title" name="title" value={form.title} onChange={set} required />
            <Field label="Code" name="code" value={form.code} onChange={set} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount type" name="discountType" type="select" options={["percent", "flat"]} value={form.discountType} onChange={set} />
              <Field label="Value" name="value" value={form.value} onChange={set} />
            </div>
            <Field label="Max uses (0 = unlimited)" name="maxUses" value={form.maxUses} onChange={set} />
          </div>
        )}
      </Modal>
    </div>
  );
}
