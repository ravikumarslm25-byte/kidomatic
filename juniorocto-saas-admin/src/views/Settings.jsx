import { Settings as Cog } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { useToast } from "@/store/toast";

export default function Settings() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "HackGeniX", email: "platform@juniorocto.com" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div>
      <PageHeader title="Settings" icon={Cog} subtitle="Platform account" />
      <Card className="max-w-xl">
        <h3 className="font-display text-navy text-lg mb-4">Platform profile</h3>
        <div className="grid gap-4">
          <Field label="Organisation" name="name" value={form.name} onChange={set} />
          <Field label="Contact email" name="email" type="email" value={form.email} onChange={set} />
        </div>
        <Button className="mt-5" onClick={() => toast.success("Saved")}>Save</Button>
      </Card>
    </div>
  );
}
