import { Filter } from "lucide-react";
import { useList } from "@/controllers/useList";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import Chip from "@/components/ui/Chip";

const STAGES = [
  { key: "New", tint: "bg-amber-50 border-amber-200" },
  { key: "Contacted", tint: "bg-royal-100 border-royal/20" },
  { key: "Visit Scheduled", tint: "bg-sea-100 border-sea/30" },
  { key: "Application", tint: "bg-royal-100 border-royal/20" },
  { key: "Admitted", tint: "bg-emerald-50 border-emerald-200" },
  { key: "Lost", tint: "bg-coral-100 border-coral/25" },
];

export default function Funnel() {
  const { rows } = useList("enquiries");
  const byStage = (k) => rows.filter((r) => r.status === k);
  return (
    <div>
      <PageHeader title="Admission Funnel" icon={Filter} subtitle="Drag-ready pipeline across every stage" />
      <div className="flex gap-3 overflow-x-auto pb-3">
        {STAGES.map((s) => {
          const items = byStage(s.key);
          return (
            <div key={s.key} className="w-64 shrink-0">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="font-semibold text-navy text-sm">{s.key}</span>
                <Chip>{items.length}</Chip>
              </div>
              <div className="space-y-2 min-h-[120px]">
                {items.map((it) => (
                  <div key={it.id} className={`rounded-2xl border p-3 ${s.tint}`}>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={it.name} size={30} />
                      <div className="min-w-0"><p className="text-sm font-medium text-navy truncate">{it.name}</p><p className="text-[11px] text-navy/50">{it.klass}</p></div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-navy/55">
                      <span>{it.parent}</span><span className="font-mono">{it.phone}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div className="rounded-2xl border border-dashed border-navy/15 h-20 grid place-items-center text-xs text-navy/35">Empty</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
