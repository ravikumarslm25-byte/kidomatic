import { useState, useEffect, useMemo } from "react";
import { Bus, Plus, Pencil, Trash2, Search, AlertTriangle, Wrench, ShieldAlert, Radio, Gauge } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import FileUpload from "@/components/ui/FileUpload";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";

const svc = resourceService("vehicles");
const truthy = (v) => v === true || v === "true" || v === 1;
const daysUntil = (d) => (d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null);
const rupee = (n) => "₹" + Math.round(+n || 0).toLocaleString("en-IN");

export default function Vehicles() {
  const toast = useToast();
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null); const [tab, setTab] = useState("details"); const [q, setQ] = useState("");

  const load = async () => { setLoading(true); setRows(normList(await svc.list({}))); setLoading(false); };
  useEffect(() => { load(); }, []);
  const shown = useMemo(() => rows.filter((r) => !q || `${r.number} ${r.make} ${r.model}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);

  const openNew = () => { setTab("details"); setForm({ number: "", type: "Bus", make: "", model: "", capacity: 0, seatingType: "Seater", yearOfMake: "", rcNumber: "", chassisNumber: "", engineNumber: "", insuranceNo: "", insuranceExpiry: "", fcNumber: "", fcExpiry: "", permitNo: "", permitExpiry: "", pucExpiry: "", lastInspection: "", lastService: "", nextService: "", gpsEnabled: false, gpsDeviceId: "", driverId: "", driverName: "", status: "Active", maintenance: [], accidents: [], documents: [], notes: "" }); };
  const openEdit = (r) => { setTab("details"); setForm({ ...r, gpsEnabled: truthy(r.gpsEnabled), maintenance: r.maintenance || [], accidents: r.accidents || [] }); };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addMaint = () => set("maintenance", [...(form.maintenance || []), { date: "", type: "Service", odometer: "", cost: 0, vendor: "", note: "" }]);
  const setMaint = (i, k, v) => set("maintenance", form.maintenance.map((m, idx) => (idx === i ? { ...m, [k]: v } : m)));
  const addAcc = () => set("accidents", [...(form.accidents || []), { date: "", location: "", description: "", damage: "", cost: 0, action: "" }]);
  const setAcc = (i, k, v) => set("accidents", form.accidents.map((a, idx) => (idx === i ? { ...a, [k]: v } : a)));

  const save = async () => {
    if (!form.number) { toast.error("Vehicle number required"); return; }
    setSaving(true);
    try { const p = { ...form, capacity: +form.capacity || 0, maintenance: (form.maintenance || []).filter((m) => m.date || m.type), accidents: (form.accidents || []).filter((a) => a.date || a.description) }; if (form.id) await svc.update(form.id, p); else await svc.create(p); toast.success("Vehicle saved"); setForm(null); await load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (r) => { await svc.remove(r.id); load(); };

  const expBadge = (d, label) => { const dl = daysUntil(d); if (dl === null) return null; if (dl < 0) return <Badge color="red">{label} exp</Badge>; if (dl <= 30) return <Badge color="red">{label} {dl}d</Badge>; if (dl <= 60) return <Badge color="amber">{label} {dl}d</Badge>; return null; };

  const TABS = [["details", "Details"], ["compliance", "Compliance & Dates"], ["maintenance", "Maintenance"], ["accidents", "Accident Register"]];

  return (
    <div>
      <PageHeader title="Vehicles / Buses" icon={Bus} subtitle="RC · insurance · FC · permit · engine & chassis · service, maintenance & accident records"
        actions={<Button onClick={openNew}><Plus size={16} /> New vehicle</Button>} />
      <div className="glass rounded-xl2 shadow-glass p-4 mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm"><Search size={15} className="absolute left-3 top-3 text-navy/35" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Number / make / model" className="ctl w-full pl-8" /></div>
        <span className="text-sm text-navy/50 ml-auto">{shown.length} vehicles</span>
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (
        <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Capacity</th><th className="px-4 py-3">Driver</th><th className="px-4 py-3">Route</th><th className="px-4 py-3">Compliance</th><th className="px-4 py-3">GPS</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 w-16" /></tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-b border-navy/5 hover:bg-white/40">
                  <td className="px-4 py-2.5"><p className="font-semibold text-navy font-mono">{r.number}</p><p className="text-[11px] text-navy/45">{[r.make, r.model].filter(Boolean).join(" ") || r.type}</p></td>
                  <td className="px-4 py-2.5 text-navy/70">{r.capacity || "—"}</td>
                  <td className="px-4 py-2.5 text-navy/70">{r.driverName || "—"}</td>
                  <td className="px-4 py-2.5 text-navy/70">{r.routeName || "—"}</td>
                  <td className="px-4 py-2.5"><div className="flex flex-wrap gap-1">{expBadge(r.insuranceExpiry, "Ins")}{expBadge(r.fcExpiry, "FC")}{expBadge(r.permitExpiry, "Permit")}{expBadge(r.pucExpiry, "PUC")}{!r.insuranceExpiry && !r.fcExpiry && <span className="text-navy/30 text-xs">—</span>}</div></td>
                  <td className="px-4 py-2.5">{truthy(r.gpsEnabled) ? <span className="flex items-center gap-1 text-emerald-600 text-xs"><Radio size={13} /> on</span> : <span className="text-navy/35 text-xs">off</span>}</td>
                  <td className="px-4 py-2.5"><Badge color={(r.status || "Active") === "Active" ? "green" : "gray"}>{r.status || "Active"}</Badge></td>
                  <td className="px-4 py-2.5"><div className="flex gap-1.5"><button onClick={() => openEdit(r)} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button><button onClick={() => del(r)} className="text-coral-500"><Trash2 size={14} /></button></div></td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-navy/40">No vehicles yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? `Edit ${form.number}` : "New vehicle"} size="lg" footer={<ModalFooter onCancel={() => setForm(null)} onSave={save} saving={saving} />}>
        {form && (
          <div>
            <div className="flex gap-1 mb-4 flex-wrap">{TABS.map(([k, label]) => <button key={k} onClick={() => setTab(k)} className={`px-3 h-9 rounded-lg text-sm font-medium ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}>{label}</button>)}</div>

            {tab === "details" && (
              <div className="grid sm:grid-cols-2 gap-3">
                <L label="Vehicle number *"><input value={form.number} onChange={(e) => set("number", e.target.value)} className="in" placeholder="TN 30 AB 1234" /></L>
                <L label="Type"><select value={form.type} onChange={(e) => set("type", e.target.value)} className="in"><option>Bus</option><option>Mini Bus</option><option>Van</option><option>Car</option></select></L>
                <L label="Make"><input value={form.make} onChange={(e) => set("make", e.target.value)} className="in" placeholder="Tata / Ashok Leyland" /></L>
                <L label="Model"><input value={form.model} onChange={(e) => set("model", e.target.value)} className="in" /></L>
                <L label="Capacity (seats)"><input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} className="in" /></L>
                <L label="Seating type"><select value={form.seatingType} onChange={(e) => set("seatingType", e.target.value)} className="in"><option>Seater</option><option>Seater + Standing</option></select></L>
                <L label="Year of make"><input value={form.yearOfMake} onChange={(e) => set("yearOfMake", e.target.value)} className="in" /></L>
                <L label="RC number"><input value={form.rcNumber} onChange={(e) => set("rcNumber", e.target.value)} className="in" /></L>
                <L label="Chassis number"><input value={form.chassisNumber} onChange={(e) => set("chassisNumber", e.target.value)} className="in" /></L>
                <L label="Engine number"><input value={form.engineNumber} onChange={(e) => set("engineNumber", e.target.value)} className="in" /></L>
                <L label="Assigned driver"><RefSelect resource="drivers" labelKey="name" value={form.driverName} onChange={(v) => set("driverName", v)} placeholder="Driver…" /></L>
                <L label="Status"><select value={form.status} onChange={(e) => set("status", e.target.value)} className="in"><option>Active</option><option>In Maintenance</option><option>Inactive</option></select></L>
                <div className="sm:col-span-2 flex items-center gap-4 pt-1"><Toggle label="GPS device fitted (for live tracking)" value={form.gpsEnabled} onChange={(v) => set("gpsEnabled", v)} />{form.gpsEnabled && <L label="GPS device ID"><input value={form.gpsDeviceId} onChange={(e) => set("gpsDeviceId", e.target.value)} className="in" /></L>}</div>
              </div>
            )}

            {tab === "compliance" && (
              <div className="grid sm:grid-cols-2 gap-3">
                <L label="Insurance policy no."><input value={form.insuranceNo} onChange={(e) => set("insuranceNo", e.target.value)} className="in" /></L>
                <L label="Insurance expiry"><input type="date" value={form.insuranceExpiry} onChange={(e) => set("insuranceExpiry", e.target.value)} className="in" /></L>
                <L label="Fitness Certificate (FC) no."><input value={form.fcNumber} onChange={(e) => set("fcNumber", e.target.value)} className="in" /></L>
                <L label="FC expiry"><input type="date" value={form.fcExpiry} onChange={(e) => set("fcExpiry", e.target.value)} className="in" /></L>
                <L label="Permit number"><input value={form.permitNo} onChange={(e) => set("permitNo", e.target.value)} className="in" /></L>
                <L label="Permit expiry"><input type="date" value={form.permitExpiry} onChange={(e) => set("permitExpiry", e.target.value)} className="in" /></L>
                <L label="PUC expiry"><input type="date" value={form.pucExpiry} onChange={(e) => set("pucExpiry", e.target.value)} className="in" /></L>
                <L label="Last inspection"><input type="date" value={form.lastInspection} onChange={(e) => set("lastInspection", e.target.value)} className="in" /></L>
                <L label="Last service"><input type="date" value={form.lastService} onChange={(e) => set("lastService", e.target.value)} className="in" /></L>
                <L label="Next service due"><input type="date" value={form.nextService} onChange={(e) => set("nextService", e.target.value)} className="in" /></L>
              </div>
            )}

            {tab === "maintenance" && (
              <div className="space-y-2">
                {(form.maintenance || []).map((m, i) => (
                  <div key={i} className="grid grid-cols-2 sm:grid-cols-6 gap-2 rounded-xl border border-navy/10 bg-white/50 p-2 items-center">
                    <input type="date" value={m.date} onChange={(e) => setMaint(i, "date", e.target.value)} className="in2" />
                    <select value={m.type} onChange={(e) => setMaint(i, "type", e.target.value)} className="in2"><option>Service</option><option>Repair</option><option>Tyre</option><option>Battery</option><option>Bodywork</option><option>Other</option></select>
                    <input value={m.odometer} onChange={(e) => setMaint(i, "odometer", e.target.value)} placeholder="Odometer" className="in2" />
                    <input type="number" value={m.cost} onChange={(e) => setMaint(i, "cost", e.target.value)} placeholder="Cost" className="in2" />
                    <input value={m.vendor} onChange={(e) => setMaint(i, "vendor", e.target.value)} placeholder="Vendor" className="in2" />
                    <input value={m.note} onChange={(e) => setMaint(i, "note", e.target.value)} placeholder="Note" className="in2" />
                  </div>
                ))}
                <button onClick={addMaint} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add maintenance record</button>
                {(form.maintenance || []).length > 0 && <p className="text-xs text-navy/50 mt-2">Total spent: {rupee((form.maintenance || []).reduce((a, m) => a + (+m.cost || 0), 0))}</p>}
              </div>
            )}

            {tab === "accidents" && (
              <div className="space-y-2">
                {(form.accidents || []).map((a, i) => (
                  <div key={i} className="rounded-xl border border-navy/10 bg-white/50 p-2.5 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input type="date" value={a.date} onChange={(e) => setAcc(i, "date", e.target.value)} className="in2" />
                      <input value={a.location} onChange={(e) => setAcc(i, "location", e.target.value)} placeholder="Location" className="in2" />
                      <input value={a.damage} onChange={(e) => setAcc(i, "damage", e.target.value)} placeholder="Damage" className="in2" />
                      <input type="number" value={a.cost} onChange={(e) => setAcc(i, "cost", e.target.value)} placeholder="Repair cost" className="in2" />
                    </div>
                    <input value={a.description} onChange={(e) => setAcc(i, "description", e.target.value)} placeholder="Description" className="in2 w-full" />
                    <input value={a.action} onChange={(e) => setAcc(i, "action", e.target.value)} placeholder="Action taken / FIR / insurance claim" className="in2 w-full" />
                  </div>
                ))}
                <button onClick={addAcc} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add accident record</button>
              </div>
            )}
          </div>
        )}
      </Modal>
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}.in2{height:34px;width:100%;border-radius:9px;background:rgba(255,255,255,.85);border:1px solid rgba(20,51,94,.12);padding:0 8px;font-size:13px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const L = ({ label, children }) => <label className="block"><span className="block text-xs font-semibold text-navy/60 mb-1.5">{label}</span>{children}</label>;
const Toggle = ({ label, value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)} className="flex items-center gap-2">
    <span className="rounded-full transition relative" style={{ width: 40, height: 22, background: value ? "#1651A3" : "rgba(20,51,94,.2)" }}><span className="absolute top-0.5 rounded-full bg-white transition" style={{ height: 18, width: 18, left: value ? 20 : 2 }} /></span>
    <span className="text-sm text-navy/70">{label}</span>
  </button>
);
