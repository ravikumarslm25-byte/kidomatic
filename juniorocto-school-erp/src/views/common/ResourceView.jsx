import { useState } from "react";
import { Plus } from "lucide-react";
import * as Icons from "lucide-react";
import { MODULES } from "@/config/modules";
import { useResource } from "@/controllers/useResource";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import DataTable from "@/components/ui/DataTable";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Field from "@/components/ui/Field";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import ErrorBanner from "@/components/ui/ErrorBanner";

const empty = (fields) => Object.fromEntries(fields.map((f) => [f.name, ""]));

export default function ResourceView({ resource, subtitle }) {
  const cfg = MODULES[resource];
  const Icon = Icons[cfg.icon] || Icons.Folder;
  const { rows, loading, error, q, setQ, reload, create, update, remove } = useResource(resource);

  const [form, setForm] = useState(null);       // null | {} (new) | row (edit)
  const [saving, setSaving] = useState(false);
  const [creds, setCreds] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const openNew = () => setForm(empty(cfg.fields));
  const openEdit = (row) => setForm({ ...row });
  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const save = async () => {
    setSaving(true);
    try {
      let created;
      if (form.id) created = await update(form.id, form);
      else created = await create(form);
      const prov = created?.__provisioned;
      const acct = prov?.parent || prov?.staff;
      if (acct?.created && acct?.tempPassword) setCreds({ email: acct.email, tempPassword: acct.tempPassword });
      setForm(null);
    } catch (e) { /* toast handled in controller */ }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader
        title={cfg.title} subtitle={subtitle || `${rows.length} ${rows.length === 1 ? "record" : "records"}`} icon={Icon}
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder={`Search ${cfg.title.toLowerCase()}…`} />
            <Button onClick={openNew}><Plus size={16} /> New {cfg.singular}</Button>
          </>
        }
      />

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={reload} /></div>}

      {loading ? (
        <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>
      ) : rows.length === 0 ? (
        <div className="glass rounded-xl2 shadow-glass">
          <EmptyState title={`No ${cfg.title.toLowerCase()} yet`} hint={`Add your first ${cfg.singular.toLowerCase()} to get started.`} action={`New ${cfg.singular}`} onAction={openNew} />
        </div>
      ) : (
        <DataTable columns={cfg.columns} rows={rows} onEdit={openEdit} onDelete={(r) => setToDelete(r)} exportName={resource} />
      )}

      <Modal open={!!form} onClose={() => setForm(null)}
        title={form?.id ? `Edit ${cfg.singular}` : `New ${cfg.singular}`}
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="grid sm:grid-cols-2 gap-4">
            {cfg.fields.map((f) => (
              <div key={f.name} className={(f.type === "textarea" || f.type === "toggle") ? "sm:col-span-2" : ""}>
                <Field {...f} value={form[f.name]} onChange={setField} />
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)}
        onConfirm={() => { remove(toDelete.id); setToDelete(null); }}
        message={`Delete this ${cfg.singular.toLowerCase()}? This can't be undone.`} />

      {creds && (
        <Modal open onClose={() => setCreds(null)} title="Login account created">
          <div className="space-y-3">
            <p className="text-sm text-navy/70">A login account was created. Share these one-time credentials — the user should change the password after first sign-in.</p>
            <div className="rounded-xl bg-white/70 border border-navy/12 p-4 text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-navy/50">Email</span><span className="font-mono text-navy">{creds.email}</span></div>
              <div className="flex justify-between"><span className="text-navy/50">Temp password</span><span className="font-mono text-navy">{creds.tempPassword}</span></div>
            </div>
            <button onClick={() => { navigator.clipboard?.writeText(`${creds.email} / ${creds.tempPassword}`); }} className="text-royal text-sm font-semibold">Copy</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
