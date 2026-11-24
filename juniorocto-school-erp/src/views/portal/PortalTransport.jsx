import { useState, useEffect } from "react";
import { Bus, Phone, User, Navigation, Radio } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import TransportMap from "@/views/transport/TransportMap";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { usePortal } from "@/store/portal";

const asArr = (v) => (Array.isArray(v) ? v : []);
export default function PortalTransport() {
  const { child } = usePortal();
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!child) return; setLoading(true);
    Promise.all(["students", "routes", "vehicles", "drivers"].map((r, i) => resourceService(r).list(i === 0 ? { studentId: child.studentId } : {}).catch(() => [])))
      .then(([stu, rt, veh, drv]) => {
        const s = normList(stu).find((x) => x.id === child.studentId) || normList(stu)[0] || {};
        const route = normList(rt).find((r) => r.name === s.route || r.code === s.route) || null;
        const vehicle = route ? normList(veh).find((v) => v.id === route.vehicleId || v.number === route.vehicleNo) : null;
        const driver = route ? normList(drv).find((d) => d.id === route.driverId || d.name === route.driverName) : null;
        setData({ routeName: s.route, route, vehicle, driver });
      }).catch(() => setData(null)).finally(() => setLoading(false));
  }, [child?.studentId]);

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  if (!data?.route) return <div><PageHeader title="Transport" icon={Bus} subtitle="School bus & route" /><Card className="py-14 text-center text-navy/40">{data?.routeName ? `Route "${data.routeName}" details aren't available yet.` : "No transport route assigned."}</Card></div>;

  const { route, vehicle, driver } = data;
  const stops = asArr(route.stops);
  const mapped = stops.filter((st) => st.lat && st.lng);
  const gps = vehicle?.gpsEnabled;

  return (
    <div>
      <PageHeader title="Transport" icon={Bus} subtitle={`${child?.studentName || ""}'s school bus`} />
      <Card className="mb-4 flex items-center gap-3">
        <span className="h-12 w-12 rounded-2xl bg-royal-100 text-royal grid place-items-center"><Bus size={22} /></span>
        <div className="flex-1"><p className="font-display text-navy text-lg">{route.name}{route.code ? ` · ${route.code}` : ""}</p><p className="text-xs text-navy/50">{route.shift || ""}{vehicle?.number ? ` · Bus ${vehicle.number}` : route.vehicleNo ? ` · Bus ${route.vehicleNo}` : ""}{route.distanceKm ? ` · ${route.distanceKm} km` : ""}</p></div>
        <Badge color={gps ? "emerald" : "gray"}>{gps ? "GPS on" : "GPS off"}</Badge>
      </Card>

      {mapped.length > 0 ? (
        <Card pad={false} className="mb-4 overflow-hidden">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between"><h3 className="font-display text-navy">Route map</h3>{gps && <span className="text-xs text-emerald-600 flex items-center gap-1"><Radio size={13} /> live when on road</span>}</div>
          <TransportMap stops={stops} showRoute height={340} />
        </Card>
      ) : (
        <Card className="mb-4 flex items-center gap-3"><span className="h-11 w-11 rounded-2xl bg-navy/8 text-navy/50 grid place-items-center"><Navigation size={19} /></span><p className="text-sm text-navy/55">Stop locations aren't mapped yet, so the route map isn't available. Stop times are listed below.</p></Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card pad={false}>
          <div className="px-5 pt-4 pb-2"><h3 className="font-display text-navy">Stops</h3></div>
          <div className="divide-y divide-navy/6">
            {stops.map((st, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2.5"><span className="h-7 w-7 rounded-full bg-royal-100 text-royal grid place-items-center text-xs font-bold shrink-0">{i + 1}</span><div className="flex-1 min-w-0"><p className="text-sm font-medium text-navy">{st.name || st.stop}</p></div><div className="text-right text-xs text-navy/50">{(st.pickupTime || st.pickup) && <p>Pickup {st.pickupTime || st.pickup}</p>}{(st.dropTime || st.drop) && <p>Drop {st.dropTime || st.drop}</p>}</div></div>
            ))}
            {stops.length === 0 && <p className="px-5 py-6 text-center text-navy/40 text-sm">No stops listed.</p>}
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-navy mb-3">Driver & crew</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3"><span className="h-10 w-10 rounded-xl bg-royal-100 text-royal grid place-items-center"><User size={17} /></span><div className="flex-1"><p className="text-sm font-medium text-navy">{driver?.name || route.driverName || "—"}</p><p className="text-xs text-navy/45">Driver</p></div>{driver?.phone && <a href={`tel:${driver.phone}`} className="grid place-items-center h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600"><Phone size={16} /></a>}</div>
            {route.attenderName && <div className="flex items-center gap-3"><span className="h-10 w-10 rounded-xl bg-sea-100 text-sea grid place-items-center"><User size={17} /></span><div className="flex-1"><p className="text-sm font-medium text-navy">{route.attenderName}</p><p className="text-xs text-navy/45">Attender</p></div></div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
