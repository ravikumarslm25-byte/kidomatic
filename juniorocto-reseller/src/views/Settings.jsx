import { Settings as Cog, Percent, Package } from "lucide-react";
import { useAuth } from "@/store/auth";
import { planList } from "@/config/plans";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/store/toast";
import { useState } from "react";

export default function Settings() {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user?.reseller || "Acme EdTech", contact: "ops@acme.edu" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div>
      <PageHeader title="Settings" icon={Cog} subtitle="Your partner account" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display text-navy text-lg mb-4">Partner profile</h3>
          <div className="grid gap-4">
            <Field label="Organisation name" name="name" value={form.name} onChange={set} />
            <Field label="Contact email" name="contact" type="email" value={form.contact} onChange={set} />
          </div>
          <Button className="mt-5" onClick={() => toast.success("Profile saved")}>Save</Button>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3"><Percent size={18} className="text-royal" /><h3 className="font-display text-navy text-lg">Commercials</h3></div>
          <div className="flex justify-between text-sm py-2 border-b border-navy/8"><span className="text-navy/55">Revenue share to platform</span><span className="font-mono text-navy">20%</span></div>
          <div className="flex justify-between text-sm py-2"><span className="text-navy/55">Plans you can offer</span><span className="font-medium text-navy">Starter · Growth · Pro</span></div>
          <p className="text-xs text-navy/40 mt-2">Set by HackGeniX. Contact your platform manager to change.</p>
        </Card>
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3"><Package size={18} className="text-royal" /><h3 className="font-display text-navy text-lg">Plan catalogue</h3></div>
          <div className="grid sm:grid-cols-3 gap-3">
            {planList().map((p) => (
              <div key={p.key} className="rounded-2xl border border-navy/10 bg-white/50 p-4">
                <div className="flex items-center justify-between"><p className="font-display text-navy">{p.name}</p><Badge color="blue">₹{p.priceMonthly}/mo</Badge></div>
                <p className="text-xs text-navy/55 mt-1.5">{p.blurb}</p>
                <p className="text-[11px] text-navy/45 mt-2">Up to {p.maxBranches} branch{p.maxBranches > 1 ? "es" : ""}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
