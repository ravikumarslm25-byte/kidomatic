import { useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { PORTAL_NAV } from "@/config/portalNav";

export default function PortalPlaceholder() {
  const { pathname } = useLocation();
  const item = PORTAL_NAV.find((n) => n.to === pathname) || { label: "Section", icon: Sparkles };
  const Icon = item.icon || Sparkles;
  return (
    <div>
      <PageHeader title={item.label} icon={Icon} subtitle="Part of your parent & student portal" />
      <Card className="py-16 text-center">
        <div className="grid place-items-center h-14 w-14 rounded-2xl bg-royal-100 text-royal mx-auto mb-4"><Icon size={26} /></div>
        <h3 className="font-display text-navy text-lg">{item.label} is being switched on</h3>
        <p className="text-sm text-navy/50 mt-1 max-w-md mx-auto">This section is part of the portal roadmap and will show your child's live data shortly.</p>
      </Card>
    </div>
  );
}
