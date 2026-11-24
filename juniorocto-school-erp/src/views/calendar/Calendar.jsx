import { useState, useEffect, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, Pencil, MapPin, Megaphone, Mail, PartyPopper, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";
import { EVENT_CATEGORIES, CAT_COLOR, colorOf, MONTHS, WD, toKey, todayKey, monthGrid, mergeItems, onDay, matchesAudience } from "./calendarKit";
import { AUDIENCE_TYPES, classOptions, roleOptions } from "../communication/commKit";

const evSvc = resourceService("events");
const commSvc = resourceService("communications");

export default function CalendarView() {
  const toast = useToast();
  const { user } = useAuth();
  const now = new Date();
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [events, setEvents] = useState([]); const [comms, setComms] = useState([]); const [holidays, setHolidays] = useState([]); const [students, setStudents] = useState([]); const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [fCats, setFCats] = useState([]); const [fAud, setFAud] = useState("all");
  const [dayKey, setDayKey] = useState(null); const [form, setForm] = useState(null);

  const load = async () => {
    setLoading(true);
    const [e, c, h, st, sf] = await Promise.all([evSvc.list({}), commSvc.list({}), resourceService("holidays").list({}), resourceService("students").list({}), resourceService("staff").list({})]);
    setEvents(normList(e)); setComms(normList(c)); setHolidays(normList(h)); setStudents(normList(st)); setStaff(normList(sf)); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const items = useMemo(() => mergeItems(events, comms, holidays)
    .filter((i) => (fCats.length === 0 || fCats.includes(i.category)) && matchesAudience(i, fAud)), [events, comms, holidays, fCats, fAud]);
  const cells = useMemo(() => monthGrid(cur.y, cur.m), [cur]);
  const itemsOn = (key) => items.filter((i) => onDay(i, key)).sort((a, b) => (b.kind === "holiday") - (a.kind === "holiday") || (a.time || "").localeCompare(b.time || ""));
  const upcoming = useMemo(() => { const tk = todayKey(); return items.filter((i) => (i.endDate || i.date) >= tk).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6); }, [items]);

  const move = (d) => setCur((c) => { const nd = new Date(c.y, c.m + d, 1); return { y: nd.getFullYear(), m: nd.getMonth() }; });
  const catList = [...new Set(items.map((i) => i.category))];
  const toggleCat = (c) => setFCats((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  const openNew = (key) => setForm({ title: "", description: "", category: "Event", start: key || todayKey(), end: key || todayKey(), allDay: true, startTime: "", endTime: "", location: "", audienceType: "Everyone", audienceClasses: [], audienceRoles: [], alsoAnnounce: false });
  const openEdit = (raw) => setForm({ ...raw, allDay: raw.allDay === true || raw.allDay === "true", audienceClasses: raw.audienceClasses || [], audienceRoles: raw.audienceRoles || [] });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => {
    if (!form.title) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      const { alsoAnnounce, ...ev } = form;
      const payload = { ...ev, color: CAT_COLOR[ev.category] || "", source: "manual", createdByName: user?.name || "admin" };
      if (form.id) await evSvc.update(form.id, payload); else await evSvc.create({ ...payload, createdAt: new Date().toISOString() });
      if (alsoAnnounce && !form.id) {
        await commSvc.create({ type: "Announcement", title: form.title, body: form.description || form.title, category: form.category, priority: "Normal", audienceType: form.audienceType, audienceClasses: form.audienceClasses, audienceRoles: form.audienceRoles, channels: ["In-app"], status: "Published", publishAt: form.start, publishedAt: new Date().toISOString(), createdByName: user?.name || "admin", createdAt: new Date().toISOString(), recipientCount: 0 });
      }
      toast.success("Event saved"); setForm(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (raw) => { if (raw.id) { await evSvc.remove(raw.id); setForm(null); load(); } };

  const kindIcon = (k) => k === "holiday" ? PartyPopper : k === "circular" ? Mail : k === "announcement" ? Megaphone : CalendarDays;

  return (
    <div>
      <PageHeader title="Calendar & Events" icon={CalendarDays} subtitle="Events, holidays & communications in one place — role-aware"
        actions={<Button onClick={() => openNew()}><Plus size={16} /> New event</Button>} />

      {/* controls */}
      <div className="glass rounded-xl2 shadow-glass p-3 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => move(-1)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-navy/6"><ChevronLeft size={18} /></button>
          <span className="font-display text-navy text-lg min-w-[170px] text-center">{MONTHS[cur.m]} {cur.y}</span>
          <button onClick={() => move(1)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-navy/6"><ChevronRight size={18} /></button>
          <button onClick={() => setCur({ y: now.getFullYear(), m: now.getMonth() })} className="ml-2 text-sm text-royal font-semibold">Today</button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-navy/50">Audience</span>
          <select value={fAud} onChange={(e) => setFAud(e.target.value)} className="ctl">
            <option value="all">Everyone</option><option value="students">Students & Parents</option><option value="staff">Staff</option>
            {roleOptions(staff).map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* category legend / filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {catList.map((c) => <button key={c} onClick={() => toggleCat(c)} className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${fCats.length === 0 || fCats.includes(c) ? "" : "opacity-40"}`} style={{ borderColor: colorOf({ category: c }) }}><span className="h-2.5 w-2.5 rounded-full" style={{ background: colorOf({ category: c }) }} />{c}</button>)}
        {fCats.length > 0 && <button onClick={() => setFCats([])} className="text-xs text-navy/50 flex items-center gap-1"><X size={12} /> clear</button>}
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* calendar grid */}
        <div className="lg:col-span-3 glass rounded-xl2 shadow-glass p-3">
          {loading ? <div className="grid place-items-center py-24"><Spinner size={26} /></div> : (
            <>
              <div className="grid grid-cols-7 mb-1">{WD.map((d) => <div key={d} className="text-center text-[11px] font-semibold uppercase text-navy/40 py-1">{d}</div>)}</div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((d) => { const key = toKey(d); const inMonth = d.getMonth() === cur.m; const dayItems = itemsOn(key); const isToday = key === todayKey(); return (
                  <button key={key} onClick={() => setDayKey(key)} className={`min-h-[92px] rounded-xl border p-1.5 text-left align-top transition ${inMonth ? "bg-white/55 border-white/60 hover:bg-white" : "bg-white/20 border-transparent"}`}>
                    <span className={`inline-grid place-items-center h-6 w-6 rounded-full text-xs font-semibold ${isToday ? "bg-royal text-white" : inMonth ? "text-navy/70" : "text-navy/30"}`}>{d.getDate()}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayItems.slice(0, 3).map((it) => <div key={it.id} className="text-[10px] leading-tight truncate rounded px-1 py-0.5 text-white" style={{ background: colorOf(it) }} title={it.title}>{it.title}</div>)}
                      {dayItems.length > 3 && <div className="text-[10px] text-navy/45 pl-1">+{dayItems.length - 3} more</div>}
                    </div>
                  </button>
                ); })}
              </div>
            </>
          )}
        </div>

        {/* upcoming */}
        <div className="glass rounded-xl2 shadow-glass p-4 self-start">
          <p className="font-semibold text-navy text-sm mb-3">Upcoming</p>
          <div className="space-y-2.5">
            {upcoming.map((it) => { const Icon = kindIcon(it.kind); return (
              <div key={it.id} className="flex gap-2.5">
                <span className="h-8 w-8 rounded-lg grid place-items-center text-white shrink-0" style={{ background: colorOf(it) }}><Icon size={15} /></span>
                <div className="min-w-0"><p className="text-sm font-medium text-navy truncate">{it.title}</p><p className="text-[11px] text-navy/45">{new Date(it.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}{it.time ? ` · ${it.time}` : ""} · {it.category}</p></div>
              </div>
            ); })}
            {upcoming.length === 0 && <p className="text-sm text-navy/40">Nothing upcoming.</p>}
          </div>
        </div>
      </div>

      {/* Day detail */}
      <Modal open={!!dayKey} onClose={() => setDayKey(null)} title={dayKey ? new Date(dayKey).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""}
        footer={<div className="flex justify-between w-full"><button onClick={() => setDayKey(null)} className="text-sm text-navy/50 px-3">Close</button><Button onClick={() => { const k = dayKey; setDayKey(null); openNew(k); }}><Plus size={15} /> Add event</Button></div>}>
        {dayKey && (
          <div className="space-y-2">
            {itemsOn(dayKey).map((it) => { const Icon = kindIcon(it.kind); return (
              <div key={it.id} className="flex items-start gap-3 rounded-xl border border-navy/10 bg-white/50 p-3">
                <span className="h-9 w-9 rounded-lg grid place-items-center text-white shrink-0" style={{ background: colorOf(it) }}><Icon size={16} /></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="font-medium text-navy">{it.title}</p><span className="text-[10px] px-1.5 py-0.5 rounded bg-navy/6 text-navy/55">{it.category}</span></div>
                  {(it.time || it.location) && <p className="text-[11px] text-navy/50">{it.time}{it.time && it.location ? " · " : ""}{it.location}</p>}
                  {it.description && <p className="text-xs text-navy/60 mt-0.5 line-clamp-2">{it.description}</p>}
                  <p className="text-[10px] text-navy/40 mt-0.5 capitalize">{it.kind}{it.status ? ` · ${it.status}` : ""}</p>
                </div>
                {it.kind === "event" && <button onClick={() => { setDayKey(null); openEdit(it.raw); }} className="text-navy/40 hover:text-navy"><Pencil size={14} /></button>}
              </div>
            ); })}
            {itemsOn(dayKey).length === 0 && <p className="text-sm text-navy/40 py-6 text-center">No events this day.</p>}
          </div>
        )}
      </Modal>

      {/* Event editor */}
      {form && <EventEditor form={form} set={set} students={students} staff={staff} saving={saving} onClose={() => setForm(null)} onSave={save} onDelete={form.id ? () => del(form) : null} />}
      <style>{`.ctl{height:34px;border-radius:10px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:13px;color:#14335E;outline:none}.lbl{display:block;font-size:12px;font-weight:600;color:rgba(20,51,94,.6);margin-bottom:6px}.in{width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:9px 12px;font-size:14px;color:#14335E;outline:none}.chip{padding:5px 10px;border-radius:9px;font-size:13px;border:1px solid rgba(20,51,94,.14);cursor:pointer}.chip-on{background:#1651A3;color:#fff;border-color:#1651A3}`}</style>
    </div>
  );
}

function EventEditor({ form, set, students, staff, saving, onClose, onSave, onDelete }) {
  const classes = classOptions(students); const roles = roleOptions(staff);
  const toggleArr = (k, v) => set(k, form[k].includes(v) ? form[k].filter((x) => x !== v) : [...form[k], v]);
  return (
    <Modal open onClose={onClose} title={form.id ? "Edit event" : "New event"} size="lg"
      footer={<div className="flex items-center justify-between w-full">{onDelete ? <button onClick={onDelete} className="text-sm text-coral-600 flex items-center gap-1 px-2"><Trash2 size={14} /> Delete</button> : <span />}<div className="flex gap-2"><button onClick={onClose} className="text-sm text-navy/50 px-3">Cancel</button><Button onClick={onSave} disabled={saving}>{saving ? <Spinner size={14} /> : null} Save</Button></div></div>}>
      <div className="space-y-4">
        <label className="block"><span className="lbl">Title *</span><input value={form.title} onChange={(e) => set("title", e.target.value)} className="in" /></label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block"><span className="lbl">Category</span><select value={form.category} onChange={(e) => set("category", e.target.value)} className="in">{EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="block"><span className="lbl">Location</span><input value={form.location} onChange={(e) => set("location", e.target.value)} className="in" /></label>
          <label className="block"><span className="lbl">Start date</span><input type="date" value={form.start} onChange={(e) => set("start", e.target.value)} className="in" /></label>
          <label className="block"><span className="lbl">End date</span><input type="date" value={form.end} onChange={(e) => set("end", e.target.value)} className="in" /></label>
        </div>
        <div className="flex items-center gap-4">
          <Toggle label="All day" value={form.allDay} onChange={(v) => set("allDay", v)} />
          {!form.allDay && <><label className="block"><span className="lbl">From</span><input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className="in" /></label><label className="block"><span className="lbl">To</span><input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className="in" /></label></>}
        </div>
        <label className="block"><span className="lbl">Description</span><textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="in" /></label>
        <div>
          <span className="lbl">Audience</span>
          <select value={form.audienceType} onChange={(e) => set("audienceType", e.target.value)} className="in mb-2">{AUDIENCE_TYPES.map((a) => <option key={a}>{a}</option>)}</select>
          {form.audienceType === "Specific Classes" && <div className="flex flex-wrap gap-2">{classes.map((c) => <button key={c} type="button" onClick={() => toggleArr("audienceClasses", c)} className={`chip ${form.audienceClasses.includes(c) ? "chip-on" : ""}`}>{c}</button>)}</div>}
          {form.audienceType === "Specific Roles" && <div className="flex flex-wrap gap-2">{roles.map((r) => <button key={r} type="button" onClick={() => toggleArr("audienceRoles", r)} className={`chip ${form.audienceRoles.includes(r) ? "chip-on" : ""}`}>{r}</button>)}</div>}
        </div>
        {!form.id && <Toggle label="Also post as an announcement" value={form.alsoAnnounce} onChange={(v) => set("alsoAnnounce", v)} />}
      </div>
    </Modal>
  );
}
const Toggle = ({ label, value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)} className="flex items-center gap-2">
    <span className="rounded-full transition relative" style={{ width: 40, height: 22, background: value ? "#1651A3" : "rgba(20,51,94,.2)" }}><span className="absolute top-0.5 rounded-full bg-white transition" style={{ height: 18, width: 18, left: value ? 20 : 2 }} /></span>
    <span className="text-sm text-navy/70">{label}</span>
  </button>
);
