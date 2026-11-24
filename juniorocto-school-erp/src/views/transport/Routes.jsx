import { useState, useEffect, useMemo } from "react";
import { Route as RouteIcon, Plus, Trash2, Save, MapPin, ArrowUp, ArrowDown, Map as MapIcon, Bus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import TransportMap from "./TransportMap";

const svc = resourceService("routes");
const vehSvc = resourceService("vehicles");
const uid = () => Math.random().toString(36).slice(2, 8);
const asArr = (v) => (Array.isArray(v) ? v : []);

export default function Routes() {
  const toast = useToast();
  const [routes, setRoutes] = useState([]); const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("build"); const [edit, setEdit] = useState(null);

  const load = async () => { setLoading(true); const [r, v] = await Promise.all([svc.list({}), vehSvc.list({})]); setRoutes(normList(r)); setVehicles(normList(v)); setLoading(false); };
  useEffect(() => { load(); }, []);

  const newRoute = () => setEdit({ name: "", code: "", shift: "Morning + Evening", stops: [], vehicleNo: "", driverName: "", attenderName: "", fare: 0, distanceKm: 0, active: true });
  const pickRoute = (r) => setEdit({ ...r, stops: asArr(r.stops) });
  const set = (k, v) => setEdit((f) => ({ ...f, [k]: v }));

  const addStop = (lat, lng) => setEdit((f) => ({ ...f, stops: [...(f.stops || []), { id: uid(), name: `Stop ${(f.stops || []).length + 1}`, pickupTime: "", dropTime: "", lat: lat ?? "", lng: lng ?? "" }] }));
  const setStop = (i, k, v) => setEdit((f) => ({ ...f, stops: f.stops.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) }));
  const rmStop = (i) => setEdit((f) => ({ ...f, stops: f.stops.filter((_, idx) => idx !== i) }));
  const move = (i, d) => setEdit((f) => { const a = [...f.stops]; const j = i + d; if (j < 0 || j >= a.length) return f; [a[i], a[j]] = [a[j], a[i]]; return { ...f, stops: a }; });

  const save = async () => {
    if (!edit.name) { toast.error("Route name required"); return; }
    setSaving(true);
    try {
      const p = { ...edit, fare: +edit.fare || 0, distanceKm: +edit.distanceKm || 0 };
      let saved;
      if (edit.id) { await svc.update(edit.id, p); saved = { ...p, id: edit.id }; } else { const c = await svc.create(p); saved = { ...p, id: c.id || c._id }; }
      // sync: link assigned vehicle to this route + driver
      if (edit.vehicleNo) { const v = vehicles.find((x) => x.number === edit.vehicleNo); if (v) await vehSvc.update(v.id, { routeId: saved.id, routeName: edit.name, driverName: edit.driverName || v.driverName }); }
      toast.success("Route saved"); setEdit(null); await load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const del = async (r) => { await svc.remove(r.id); if (edit?.id === r.id) setEdit(null); load(); };

  // all stops across routes for the overview map
  const allStops = useMemo(() => routes.flatMap((r) => asArr(r.stops).filter((s) => s.lat && s.lng).map((s) => ({ ...s, routeName: r.name }))), [routes]);

  return (
    <div>
      <PageHeader title="Routes & Stops" icon={RouteIcon} subtitle="Plan routes on the map · add stops · assign bus & driver"
        actions={<div className="flex gap-2"><Button variant="outline" onClick={() => setTab(tab === "map" ? "build" : "map")}><MapIcon size={15} /> {tab === "map" ? "Builder" : "All routes map"}</Button><Button onClick={newRoute}><Plus size={16} /> New route</Button></div>} />

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-20"><Spinner size={24} /></div>
        : tab === "map" ? (
          <div className="glass rounded-xl2 shadow-glass p-3">
            <p className="text-sm text-navy/60 mb-2 px-1">{allStops.length} stops across {routes.length} routes</p>
            <TransportMap stops={allStops} height={520} showRoute={false} />
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-4">
            {/* route list + builder */}
            <div className="lg:col-span-3 space-y-4">
              {!edit ? (
                <div className="glass rounded-xl2 shadow-glass overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left border-b border-navy/8 text-xs uppercase text-navy/45"><th className="px-4 py-3">Route</th><th className="px-4 py-3">Stops</th><th className="px-4 py-3">Bus</th><th className="px-4 py-3">Driver</th><th className="px-4 py-3 w-16" /></tr></thead>
                    <tbody>
                      {routes.map((r) => (
                        <tr key={r.id} className="border-b border-navy/5 hover:bg-white/40 cursor-pointer" onClick={() => pickRoute(r)}>
                          <td className="px-4 py-2.5"><p className="font-medium text-navy">{r.name}</p><p className="text-[11px] text-navy/45">{r.code} · {r.shift}</p></td>
                          <td className="px-4 py-2.5 text-navy/70">{asArr(r.stops).length}</td>
                          <td className="px-4 py-2.5 text-navy/70">{r.vehicleNo || "—"}</td>
                          <td className="px-4 py-2.5 text-navy/70">{r.driverName || "—"}</td>
                          <td className="px-4 py-2.5"><button onClick={(e) => { e.stopPropagation(); del(r); }} className="text-coral-500"><Trash2 size={14} /></button></td>
                        </tr>
                      ))}
                      {routes.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-navy/40">No routes yet. Create one and add stops on the map.</td></tr>}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="glass rounded-xl2 shadow-glass p-4 space-y-4">
                  <div className="flex items-center justify-between"><h3 className="font-display text-navy">{edit.id ? "Edit route" : "New route"}</h3><button onClick={() => setEdit(null)} className="text-navy/50 text-sm">Close</button></div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <L label="Route name *"><input value={edit.name} onChange={(e) => set("name", e.target.value)} className="in" placeholder="Salem Town Route" /></L>
                    <L label="Code"><input value={edit.code} onChange={(e) => set("code", e.target.value)} className="in" placeholder="R-01" /></L>
                    <L label="Shift"><select value={edit.shift} onChange={(e) => set("shift", e.target.value)} className="in"><option>Morning</option><option>Evening</option><option>Morning + Evening</option></select></L>
                    <L label="Bus / vehicle"><RefSelect resource="vehicles" labelKey="number" value={edit.vehicleNo} onChange={(v) => set("vehicleNo", v)} placeholder="Assign bus…" /></L>
                    <L label="Driver"><RefSelect resource="drivers" labelKey="name" value={edit.driverName} onChange={(v) => set("driverName", v)} placeholder="Assign driver…" /></L>
                    <L label="Attender / Ayah"><input value={edit.attenderName} onChange={(e) => set("attenderName", e.target.value)} className="in" /></L>
                    <L label="Fare (₹ / term)"><input type="number" value={edit.fare} onChange={(e) => set("fare", e.target.value)} className="in" /></L>
                    <L label="Distance (km)"><input type="number" value={edit.distanceKm} onChange={(e) => set("distanceKm", e.target.value)} className="in" /></L>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2"><p className="text-xs font-bold uppercase text-royal">Stops ({(edit.stops || []).length})</p><button onClick={() => addStop()} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add stop</button></div>
                    <p className="text-[11px] text-navy/45 mb-2">Tip: click anywhere on the map to drop a stop, then rename it and set the time.</p>
                    <div className="space-y-2 max-h-[36vh] overflow-auto">
                      {(edit.stops || []).map((s, i) => (
                        <div key={s.id || i} className="rounded-xl border border-navy/10 bg-white/50 p-2">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-royal text-white grid place-items-center text-xs font-bold shrink-0">{i + 1}</span>
                            <input value={s.name} onChange={(e) => setStop(i, "name", e.target.value)} placeholder="Stop name" className="in2 flex-1" />
                            <div className="flex flex-col"><button onClick={() => move(i, -1)} className="text-navy/30 hover:text-navy"><ArrowUp size={12} /></button><button onClick={() => move(i, 1)} className="text-navy/30 hover:text-navy"><ArrowDown size={12} /></button></div>
                            <button onClick={() => rmStop(i)} className="text-coral-500"><Trash2 size={13} /></button>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                            <label className="text-[10px] text-navy/45">Pickup<input type="time" value={s.pickupTime} onChange={(e) => setStop(i, "pickupTime", e.target.value)} className="in2" /></label>
                            <label className="text-[10px] text-navy/45">Drop<input type="time" value={s.dropTime} onChange={(e) => setStop(i, "dropTime", e.target.value)} className="in2" /></label>
                            <label className="text-[10px] text-navy/45">Lat<input value={s.lat} onChange={(e) => setStop(i, "lat", e.target.value)} className="in2" /></label>
                            <label className="text-[10px] text-navy/45">Lng<input value={s.lng} onChange={(e) => setStop(i, "lng", e.target.value)} className="in2" /></label>
                          </div>
                        </div>
                      ))}
                      {(edit.stops || []).length === 0 && <p className="text-sm text-navy/40 py-3 text-center">No stops yet — click the map or “Add stop”.</p>}
                    </div>
                  </div>
                  <Button onClick={save} disabled={saving} className="w-full">{saving ? <><Spinner size={14} /> Saving…</> : <><Save size={15} /> Save route</>}</Button>
                </div>
              )}
            </div>

            {/* map */}
            <div className="lg:col-span-2">
              <div className="glass rounded-xl2 shadow-glass p-3 sticky top-4">
                <p className="text-xs text-navy/55 mb-2 px-1 flex items-center gap-1"><MapPin size={13} /> {edit ? "Click to drop a stop" : "Select a route to view its map"}</p>
                <TransportMap stops={edit ? (edit.stops || []) : allStops} onPick={edit ? (lat, lng) => addStop(lat, lng) : undefined} height={460} showRoute={!!edit} />
              </div>
            </div>
          </div>
        )}
      <style>{`.in{height:40px;width:100%;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 12px;font-size:14px;color:#14335E;outline:none}.in2{height:32px;width:100%;border-radius:8px;background:rgba(255,255,255,.85);border:1px solid rgba(20,51,94,.12);padding:0 7px;font-size:12px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const L = ({ label, children }) => <label className="block"><span className="block text-xs font-semibold text-navy/60 mb-1.5">{label}</span>{children}</label>;
