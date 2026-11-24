import { MapPin, Navigation } from "lucide-react";
import { useList } from "@/controllers/useList";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function LiveTracking() {
  const { rows: vehicles } = useList("vehicles");
  return (
    <div>
      <PageHeader title="Live Tracking" icon={MapPin} subtitle="Real-time bus locations via GPS" />
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 !p-0 overflow-hidden h-[440px] relative">
          <div className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 30% 30%, rgba(79,168,196,.18), transparent), radial-gradient(50% 50% at 80% 70%, rgba(30,86,168,.12), transparent), repeating-linear-gradient(0deg, rgba(38,54,79,.05) 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, rgba(38,54,79,.05) 0 1px, transparent 1px 40px)" }} />
          {[[30, 40], [62, 55], [48, 72]].map(([x, y], i) => (
            <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
              <div className="grid place-items-center h-9 w-9 rounded-full btn-grad text-white shadow-soft animate-floaty"><Navigation size={16} /></div>
            </div>
          ))}
          <div className="absolute bottom-3 left-3 glass rounded-xl px-3 py-1.5 text-xs text-navy/60">Map preview — plug in Google Maps / Mapbox in production</div>
        </Card>
        <Card pad={false}>
          <div className="px-5 pt-5 pb-3"><h3 className="font-display text-navy text-lg">Fleet</h3></div>
          <div className="divide-y divide-navy/6">
            {vehicles.map((v) => (
              <div key={v.id} className="px-5 py-3">
                <div className="flex items-center justify-between"><span className="font-mono text-sm text-navy">{v.number}</span><Badge>{v.status}</Badge></div>
                <p className="text-xs text-navy/50 mt-0.5">{v.route} · {v.driver}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
