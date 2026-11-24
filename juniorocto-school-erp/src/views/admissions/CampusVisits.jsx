import { useState, useEffect } from "react";
import { CalendarClock, Plus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";

const svc = resourceService("campusVisits");
const COLUMNS = [
  { key: "studentName", label: "Student", type: "avatar" },
  { key: "klass", label: "Class", type: "chip" },
  { key: "phone", label: "Phone", type: "mono" },
  { key: "counsellor", label: "Counsellor" },
  { key: "slot", label: "Date & time", type: "mono" },
  { key: "status", label: "Status", type: "badge" },
  { key: "note", label: "Note" },
];
const fmtSlot = (v) => (v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

export default function CampusVisits() {
  const toast = useToast();
  const [visits, setVisits] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [vs, es] = await Promise.all([svc.list({}), resourceService("enquiries").list({})]);
    setVisits(normList(vs)); setEnquiries(normList(es)); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => setForm({ enquiryId: "", studentName: "", klass: "", phone: "", counsellor: "", slot: "", note: "", status: "Pending" });
  const openEdit = (v) => setForm({ id: v.id, enquiryId: v.enquiryId || "", studentName: v.studentName || v.enquiry || "", klass: v.klass || "", phone: v.phone || "", counsellor: v.counsellor || "", slot: v.slot || "", note: v.note || "", status: v.status || "Pending" });

  // Selecting an enquiry auto-fills student, class and phone
  const pickEnquiry = (id) => {
    const e = enquiries.find((x) => x.id === id);
    setForm((f) => ({ ...f, enquiryId: id, studentName: e?.name || "", klass: e?.klass || "", phone: e?.phone || "" }));
  };

  const save = async () => {
    if (!form.studentName) { toast.error("Pick an enquiry"); return; }
    setSaving(true);
    try {
      const payload = { enquiryId: form.enquiryId, enquiry: form.studentName, studentName: form.studentName, klass: form.klass, phone: form.phone, counsellor: form.counsellor, slot: form.slot, note: form.note, status: form.status };
      if (form.id) await svc.update(form.id, payload); else await svc.create(payload);
      toast.success("Visit saved"); setForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (v) => { await svc.remove(v.id); load(); };

  const rows = visits.map((v) => ({ ...v, studentName: v.studentName || v.enquiry, slot: fmtSlot(v.slot) }));

  return (
    <div>
      <PageHeader title="Campus Visits" icon={CalendarClock} subtitle="Scheduled from enquiries · student, class & phone auto-filled"
        actions={<Button onClick={openNew}><Plus size={16} /> New Visit</Button>} />
      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>
        : <DataTable columns={COLUMNS} rows={rows} onEdit={openEdit} onDelete={del} exportName="campus-visits" />}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit Visit" : "New Campus Visit"}
        footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-navy/60 mb-1.5">Enquiry / Student *</span>
              <RefSelect resource="enquiries" labelKey="name" valueKey="id" value={form.enquiryId} onChange={pickEnquiry} placeholder="Select from enquiries…" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/60 border border-navy/10 px-3 py-2"><p className="text-[11px] text-navy/45">Class</p><p className="text-sm text-navy font-medium">{form.klass || "—"}</p></div>
              <div className="rounded-xl bg-white/60 border border-navy/10 px-3 py-2"><p className="text-[11px] text-navy/45">Phone</p><p className="text-sm text-navy font-medium font-mono">{form.phone || "—"}</p></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><span className="block text-xs font-semibold text-navy/60 mb-1.5">Counsellor</span>
                <RefSelect resource="staff" labelKey="name" value={form.counsellor} onChange={(v) => setForm((f) => ({ ...f, counsellor: v }))} placeholder="Select staff…" /></div>
              <label className="block"><span className="block text-xs font-semibold text-navy/60 mb-1.5">Date & time</span>
                <input type="datetime-local" value={form.slot} onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}
                  className="h-10 w-full rounded-xl bg-white/70 border border-navy/12 px-3 text-sm text-navy outline-none focus:border-royal/45" /></label>
            </div>
            <label className="block"><span className="block text-xs font-semibold text-navy/60 mb-1.5">Note</span>
              <textarea rows={3} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Anything the team should know for this visit…"
                className="w-full rounded-xl bg-white/70 border border-navy/12 px-3 py-2 text-sm text-navy outline-none focus:border-royal/45" /></label>
            <label className="block"><span className="block text-xs font-semibold text-navy/60 mb-1.5">Status</span>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="h-10 w-full rounded-xl bg-white/70 border border-navy/12 px-3 text-sm text-navy outline-none focus:border-royal/45">
                {["Pending", "Confirmed", "Completed", "No-show"].map((o) => <option key={o}>{o}</option>)}</select></label>
          </div>
        )}
      </Modal>
    </div>
  );
}
