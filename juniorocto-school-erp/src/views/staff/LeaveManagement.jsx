import { useState, useEffect, useMemo } from "react";
import { CalendarCheck, Plus, Check, X, Trash2, Pencil, Users2, CalendarDays, Settings2, Clipboard, UserCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";
import { DEFAULT_TYPES, HOLIDAY_TYPES, truthy, workingDays, isTeaching, findCover } from "./leaveKit";

const appSvc = resourceService("leaveApplications");
const typeSvc = resourceService("leaveTypes");
const holSvc = resourceService("holidays");
const YEAR = new Date().getFullYear();
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—");

export default function LeaveManagement() {
  const toast = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState("apps");
  const [apps, setApps] = useState([]); const [types, setTypes] = useState([]); const [holidays, setHolidays] = useState([]);
  const [staff, setStaff] = useState([]); const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyForm, setApplyForm] = useState(null); const [typeForm, setTypeForm] = useState(null); const [holForm, setHolForm] = useState(null);
  const [cover, setCover] = useState(null); const [saving, setSaving] = useState(false);
  const [fStatus, setFStatus] = useState("");

  const load = async () => {
    setLoading(true);
    const [a, t, h, s, tt] = await Promise.all([appSvc.list({}), typeSvc.list({}), holSvc.list({}), resourceService("staff").list({}), resourceService("timetable").list({})]);
    setApps(normList(a)); setTypes(normList(t)); setHolidays(normList(h)); setStaff(normList(s)); setTimetable(normList(tt)); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const effectiveTypes = types.length ? types : DEFAULT_TYPES;
  const shownApps = useMemo(() => apps.filter((a) => !fStatus || a.status === fStatus).sort((a, b) => (b.appliedAt || "").localeCompare(a.appliedAt || "")), [apps, fStatus]);

  // Apply
  const openApply = () => setApplyForm({ staffId: "", staffName: "", category: "", leaveType: effectiveTypes[0]?.name || "", code: effectiveTypes[0]?.code || "", paid: effectiveTypes[0]?.paid ?? true, fromDate: "", toDate: "", halfDay: false, reason: "" });
  const pickStaff = (id) => { const st = staff.find((x) => x.id === id); setApplyForm((f) => ({ ...f, staffId: id, staffName: st?.name || "", category: st?.category || "" })); };
  const pickType = (name) => { const t = effectiveTypes.find((x) => x.name === name); setApplyForm((f) => ({ ...f, leaveType: name, code: t?.code || "", paid: t?.paid ?? true })); };
  const applyDays = applyForm ? workingDays(applyForm.fromDate, applyForm.toDate, holidays, applyForm.halfDay) : 0;
  const submitApply = async () => {
    if (!applyForm.staffId || !applyForm.fromDate || !applyForm.toDate) { toast.error("Staff and dates are required"); return; }
    setSaving(true);
    try { await appSvc.create({ ...applyForm, days: applyDays, status: "Pending", appliedAt: new Date().toISOString() }); toast.success("Leave applied"); setApplyForm(null); await load(); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const decide = async (a, status) => { await appSvc.update(a.id, { status, decidedBy: user?.name || "admin", decidedAt: new Date().toISOString() }); load(); };
  const delApp = async (a) => { await appSvc.remove(a.id); load(); };

  // Balances: used = approved days this year per staff+type
  const balances = useMemo(() => {
    const map = {}; // staffId -> { typeCode -> used }
    apps.filter((a) => a.status === "Approved" && (a.fromDate || "").startsWith(String(YEAR))).forEach((a) => {
      map[a.staffId] = map[a.staffId] || {}; map[a.staffId][a.code] = (map[a.staffId][a.code] || 0) + (+a.days || 0);
    });
    return map;
  }, [apps]);

  // Type CRUD
  const openType = (t) => setTypeForm(t ? { ...t } : { name: "", code: "", annualQuota: 12, paid: true, encashable: false, carryForward: false, color: "#1651A3" });
  const saveType = async () => { setSaving(true); try { const p = { ...typeForm, annualQuota: +typeForm.annualQuota || 0 }; if (typeForm.id) await typeSvc.update(typeForm.id, p); else await typeSvc.create(p); toast.success("Saved"); setTypeForm(null); await load(); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };
  const seedTypes = async () => { await Promise.all(DEFAULT_TYPES.map((t) => typeSvc.create(t))); toast.success("Default leave types added"); load(); };

  // Holidays
  const openHol = (h) => setHolForm(h ? { ...h } : { name: "", date: "", type: "Public", description: "" });
  const saveHol = async () => { setSaving(true); try { if (holForm.id) await holSvc.update(holForm.id, holForm); else await holSvc.create(holForm); toast.success("Saved"); setHolForm(null); await load(); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };
  const delHol = async (h) => { await holSvc.remove(h.id); load(); };

  const coverData = cover ? findCover(cover.staffName, cover.fromDate, cover.toDate, timetable, staff) : [];

  const TABS = [["apps", "Applications", Clipboard], ["balances", "Balances", Users2], ["types", "Leave Types", Settings2], ["holidays", "Holidays", CalendarDays]];

  return (
    <div>
      <PageHeader title="Leave Management" icon={CalendarCheck} subtitle="Apply & approve leave · balances · holidays · auto substitution for teachers"
        actions={tab === "apps" ? <Button onClick={openApply}><Plus size={16} /> Apply leave</Button> : tab === "types" ? <Button onClick={() => openType()}><Plus size={16} /> New type</Button> : tab === "holidays" ? <Button onClick={() => openHol()}><Plus size={16} /> Add holiday</Button> : null} />

      <div className="flex gap-1 mb-5">
        {TABS.map(([k, label, Icon]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {label}</button>)}
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div> : (<>
        {/* APPLICATIONS */}
        {tab === "apps" && (<>
          <div className="flex gap-2 mb-3">{["", "Pending", "Approved", "Rejected"].map((s) => <button key={s} onClick={() => setFStatus(s)} className={`px-3 h-8 rounded-lg text-sm ${fStatus === s ? "bg-royal-100 text-royal font-semibold" : "bg-white/60 border border-navy/10 text-navy/60"}`}>{s || "All"}</button>)}</div>
          <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Staff</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Days</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody>
                {shownApps.map((a) => (
                  <tr key={a.id} className="border-b border-navy/5 hover:bg-white/40">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Avatar name={a.staffName} size={28} /><span className="font-medium text-navy">{a.staffName}</span></div></td>
                    <td className="px-4 py-2.5"><Badge>{a.code || a.leaveType}</Badge>{!truthy(a.paid) && <span className="text-[10px] text-coral-600 ml-1">unpaid</span>}</td>
                    <td className="px-4 py-2.5 text-navy/70">{fmt(a.fromDate)} – {fmt(a.toDate)}{truthy(a.halfDay) && " ½"}</td>
                    <td className="px-4 py-2.5 font-mono">{a.days}</td>
                    <td className="px-4 py-2.5 text-navy/60 text-xs max-w-[200px] truncate">{a.reason}</td>
                    <td className="px-4 py-2.5"><Badge color={a.status === "Approved" ? "green" : a.status === "Rejected" ? "red" : "amber"}>{a.status}</Badge></td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-1.5">
                      {a.status === "Pending" && <><button onClick={() => decide(a, "Approved")} className="text-emerald-600" title="Approve"><Check size={16} /></button><button onClick={() => decide(a, "Rejected")} className="text-coral-600" title="Reject"><X size={16} /></button></>}
                      {a.status === "Approved" && a.category?.startsWith("Teaching") && <button onClick={() => setCover(a)} className="text-royal flex items-center gap-1 text-xs font-semibold" title="Find cover"><UserCheck size={14} /> Cover</button>}
                      <button onClick={() => delApp(a)} className="text-navy/30 hover:text-coral-500"><Trash2 size={13} /></button>
                    </div></td>
                  </tr>
                ))}
                {shownApps.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-navy/40">No leave applications.</td></tr>}
              </tbody>
            </table>
          </div>
        </>)}

        {/* BALANCES */}
        {tab === "balances" && (
          <div className="glass rounded-xl2 shadow-glass overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Staff</th>{effectiveTypes.filter((t) => t.annualQuota > 0).map((t) => <th key={t.code} className="px-4 py-3 text-center">{t.code}</th>)}</tr></thead>
              <tbody>
                {staff.filter((s) => (s.status || "Active") === "Active").map((s) => (
                  <tr key={s.id} className="border-b border-navy/5">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Avatar name={s.name} size={26} /><span className="font-medium text-navy">{s.name}</span></div></td>
                    {effectiveTypes.filter((t) => t.annualQuota > 0).map((t) => { const used = balances[s.id]?.[t.code] || 0; const rem = t.annualQuota - used; return (
                      <td key={t.code} className="px-4 py-2.5 text-center"><span className={`font-mono font-semibold ${rem <= 0 ? "text-coral-600" : "text-navy"}`}>{rem}</span><span className="text-navy/35 text-xs">/{t.annualQuota}</span></td>
                    ); })}
                  </tr>
                ))}
                {staff.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-navy/40">No staff.</td></tr>}
              </tbody>
            </table>
            <p className="px-4 py-3 text-xs text-navy/45">Remaining / annual quota for {YEAR}. Used = approved leave this year.</p>
          </div>
        )}

        {/* LEAVE TYPES */}
        {tab === "types" && (
          types.length === 0 ? <div className="glass rounded-xl2 shadow-glass py-14 text-center"><p className="text-navy/50 mb-3">No leave types yet.</p><Button onClick={seedTypes}>Add standard types (CL, SL, EL, ML, Comp-off, LOP)</Button></div>
          : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((t) => (
              <div key={t.id} className="glass rounded-xl2 shadow-glass p-4">
                <div className="flex items-start justify-between"><div className="flex items-center gap-2"><span className="h-8 w-8 rounded-lg grid place-items-center text-white text-xs font-bold" style={{ background: t.color || "#1651A3" }}>{t.code}</span><h3 className="font-display text-navy">{t.name}</h3></div><div className="flex gap-1.5"><button onClick={() => openType(t)} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button><button onClick={async () => { await typeSvc.remove(t.id); load(); }} className="text-coral-500"><Trash2 size={14} /></button></div></div>
                <p className="text-sm text-navy/60 mt-2">{t.annualQuota} days / year · {truthy(t.paid) ? "Paid" : "Unpaid"}{truthy(t.encashable) ? " · Encashable" : ""}{truthy(t.carryForward) ? " · Carry-forward" : ""}</p>
              </div>
            ))}
          </div>
        )}

        {/* HOLIDAYS */}
        {tab === "holidays" && (
          <div className="glass rounded-xl2 shadow-glass overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Holiday</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 w-10" /></tr></thead>
              <tbody>
                {[...holidays].sort((a, b) => (a.date || "").localeCompare(b.date || "")).map((h) => (
                  <tr key={h.id} className="border-b border-navy/5"><td className="px-4 py-2.5 font-medium text-navy">{h.name}</td><td className="px-4 py-2.5 text-navy/70">{new Date(h.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</td><td className="px-4 py-2.5"><Badge>{h.type}</Badge></td><td className="px-4 py-2.5"><div className="flex gap-1.5"><button onClick={() => openHol(h)} className="text-navy/40 hover:text-navy"><Pencil size={13} /></button><button onClick={() => delHol(h)} className="text-coral-500"><Trash2 size={13} /></button></div></td></tr>
                ))}
                {holidays.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-navy/40">No holidays. Add the school calendar so leave days compute correctly.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </>)}

      {/* Apply modal */}
      <Modal open={!!applyForm} onClose={() => setApplyForm(null)} title="Apply for leave" footer={<ModalFooter onCancel={() => setApplyForm(null)} onSave={submitApply} saving={saving} saveLabel="Submit" />}>
        {applyForm && (
          <div className="space-y-4">
            <div><span className="lbl">Staff *</span><RefSelect resource="staff" labelKey="name" valueKey="id" value={applyForm.staffId} onChange={pickStaff} placeholder="Select staff…" /></div>
            <label className="block"><span className="lbl">Leave type</span><select value={applyForm.leaveType} onChange={(e) => pickType(e.target.value)} className="in">{effectiveTypes.map((t) => <option key={t.name}>{t.name}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="lbl">From *</span><input type="date" value={applyForm.fromDate} onChange={(e) => setApplyForm((f) => ({ ...f, fromDate: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">To *</span><input type="date" value={applyForm.toDate} onChange={(e) => setApplyForm((f) => ({ ...f, toDate: e.target.value }))} className="in" /></label>
            </div>
            <label className="flex items-center gap-2 text-sm text-navy/70"><input type="checkbox" checked={applyForm.halfDay} onChange={(e) => setApplyForm((f) => ({ ...f, halfDay: e.target.checked }))} /> Half day (single day only)</label>
            <label className="block"><span className="lbl">Reason</span><textarea rows={2} value={applyForm.reason} onChange={(e) => setApplyForm((f) => ({ ...f, reason: e.target.value }))} className="in" style={{ height: "auto", padding: "10px 12px" }} /></label>
            <p className="text-sm text-navy/60">Working days (excl. Sundays & holidays): <b className="text-navy">{applyDays}</b>{!truthy(applyForm.paid) && <span className="text-coral-600"> · unpaid (LOP)</span>}</p>
          </div>
        )}
      </Modal>

      {/* Type modal */}
      <Modal open={!!typeForm} onClose={() => setTypeForm(null)} title={typeForm?.id ? "Edit leave type" : "New leave type"} footer={<ModalFooter onCancel={() => setTypeForm(null)} onSave={saveType} saving={saving} />}>
        {typeForm && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block"><span className="lbl">Name</span><input value={typeForm.name} onChange={(e) => setTypeForm((f) => ({ ...f, name: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Code</span><input value={typeForm.code} onChange={(e) => setTypeForm((f) => ({ ...f, code: e.target.value }))} className="in" placeholder="CL" /></label>
              <label className="block"><span className="lbl">Annual quota (days)</span><input type="number" value={typeForm.annualQuota} onChange={(e) => setTypeForm((f) => ({ ...f, annualQuota: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Colour</span><input type="color" value={typeForm.color} onChange={(e) => setTypeForm((f) => ({ ...f, color: e.target.value }))} className="in" style={{ padding: 4 }} /></label>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={truthy(typeForm.paid)} onChange={(e) => setTypeForm((f) => ({ ...f, paid: e.target.checked }))} /> Paid</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={truthy(typeForm.encashable)} onChange={(e) => setTypeForm((f) => ({ ...f, encashable: e.target.checked }))} /> Encashable</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={truthy(typeForm.carryForward)} onChange={(e) => setTypeForm((f) => ({ ...f, carryForward: e.target.checked }))} /> Carry-forward</label>
            </div>
          </div>
        )}
      </Modal>

      {/* Holiday modal */}
      <Modal open={!!holForm} onClose={() => setHolForm(null)} title={holForm?.id ? "Edit holiday" : "Add holiday"} footer={<ModalFooter onCancel={() => setHolForm(null)} onSave={saveHol} saving={saving} />}>
        {holForm && (
          <div className="space-y-4">
            <label className="block"><span className="lbl">Name</span><input value={holForm.name} onChange={(e) => setHolForm((f) => ({ ...f, name: e.target.value }))} className="in" placeholder="e.g. Pongal" /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="lbl">Date</span><input type="date" value={holForm.date} onChange={(e) => setHolForm((f) => ({ ...f, date: e.target.value }))} className="in" /></label>
              <label className="block"><span className="lbl">Type</span><select value={holForm.type} onChange={(e) => setHolForm((f) => ({ ...f, type: e.target.value }))} className="in">{HOLIDAY_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
            </div>
          </div>
        )}
      </Modal>

      {/* Substitution modal */}
      <Modal open={!!cover} onClose={() => setCover(null)} title={cover ? `Cover for ${cover.staffName}` : ""} size="lg" footer={<ModalFooter onCancel={() => setCover(null)} onSave={() => setCover(null)} saveLabel="Done" />}>
        {cover && (coverData.length === 0 ? <p className="text-navy/50 py-6 text-center">No timetable periods found for this teacher on the leave dates.</p> : (
          <div className="space-y-4">
            {coverData.map((d) => (
              <div key={d.date}>
                <p className="font-semibold text-navy mb-2">{d.day} · {fmt(d.date)}</p>
                <div className="space-y-2">
                  {d.periods.map((p, i) => (
                    <div key={i} className="rounded-xl border border-navy/10 bg-white/50 p-3">
                      <div className="flex items-center justify-between"><span className="font-medium text-navy">P{p.pi + 1} · {p.klass}</span><Badge color="blue">{p.subject}</Badge></div>
                      <p className="text-xs text-navy/50 mt-2">Free teachers this period:</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">{p.free.length ? p.free.slice(0, 8).map((t) => <span key={t} className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">{t}</span>) : <span className="text-xs text-coral-600">No free teacher — reshuffle needed</span>}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </Modal>
      <style>{`.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
