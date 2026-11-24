import { Package, Check } from "lucide-react";
import { planList } from "@/config/plans";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function Plans() {
  return (
    <div>
      <PageHeader title="Plans" icon={Package} subtitle="The catalogue offered across the platform" />
      <div className="grid sm:grid-cols-3 gap-4">
        {planList().map((p) => (
          <Card key={p.key} className="flex flex-col">
            <div className="flex items-center justify-between"><h3 className="font-display text-navy text-xl">{p.name}</h3><Badge color="blue">₹{p.priceMonthly}/mo</Badge></div>
            <p className="text-sm text-navy/55 mt-2 flex-1">{p.blurb}</p>
            <div className="mt-4 pt-4 border-t border-navy/8 flex items-center gap-2 text-sm text-navy/70"><Check size={15} className="text-emerald-500" /> Up to {p.maxBranches} branch{p.maxBranches > 1 ? "es" : ""}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
