import { useState } from "react";
import { Shield, Mail, User as UserIcon, KeyRound, Check, LogOut, Clock } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";
import { authService } from "@/services/auth.service";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Badge from "@/components/ui/Badge";

export default function Profile() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: user?.name || "HackGeniX Admin", email: user?.email || "superadmin@juniorocto.com", phone: "+91 90000 12345" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const setP = (k, v) => setProfile((f) => ({ ...f, [k]: v }));
  const setPwd = (k, v) => setPw((f) => ({ ...f, [k]: v }));

  const changePw = async () => {
    if (pw.newPassword !== pw.confirm) { toast.error("Passwords don't match"); return; }
    setSaving(true);
    try { await authService.changePassword(pw); toast.success("Password updated"); setPw({ currentPassword: "", newPassword: "", confirm: "" }); }
    catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl">
      {/* hero */}
      <div className="relative rounded-xl2 shadow-glass overflow-hidden mb-5">
        <div className="h-28" style={{ background: "linear-gradient(120deg, #14335E, #1651A3 60%, #E85410)" }} />
        <div className="glass px-6 pb-5 pt-0">
          <div className="flex items-end gap-4 -mt-10">
            <div className="grid place-items-center h-20 w-20 rounded-3xl bg-white shadow-glass font-display text-2xl text-royal ring-4 ring-white">{(profile.name || "A").split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
            <div className="flex-1 pb-1"><h1 className="font-display text-2xl text-navy">{profile.name}</h1><p className="text-sm text-navy/50 flex items-center gap-1.5"><Mail size={13} /> {profile.email}</p></div>
            <Badge color="blue">{user?.role || "Super Admin"}</Badge>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4"><UserIcon size={18} className="text-royal" /><h3 className="font-display text-navy text-lg">Profile details</h3></div>
          <div className="space-y-4">
            <Field label="Full name" name="name" value={profile.name} onChange={setP} />
            <Field label="Email" name="email" type="email" value={profile.email} onChange={setP} />
            <Field label="Phone" name="phone" value={profile.phone} onChange={setP} />
          </div>
          <Button className="mt-5" onClick={() => toast.success("Profile saved")}><Check size={16} /> Save changes</Button>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4"><Shield size={18} className="text-royal" /><h3 className="font-display text-navy text-lg">Security</h3></div>
          <div className="space-y-4">
            <Field label="Current password" name="currentPassword" type="password" value={pw.currentPassword} onChange={setPwd} />
            <Field label="New password" name="newPassword" type="password" value={pw.newPassword} onChange={setPwd} />
            <Field label="Confirm new password" name="confirm" type="password" value={pw.confirm} onChange={setPwd} />
          </div>
          <Button className="mt-5" onClick={changePw} disabled={saving}><KeyRound size={16} /> {saving ? "Updating…" : "Update password"}</Button>
          <div className="mt-6 pt-4 border-t border-navy/8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/40 flex items-center gap-1.5"><Clock size={12} /> Recent activity</p>
            <div className="flex justify-between text-sm"><span className="text-navy/60">This device · Chennai</span><span className="text-emerald-600 text-xs font-semibold">Active now</span></div>
            <div className="flex justify-between text-sm"><span className="text-navy/60">Last login</span><span className="text-navy/50 text-xs">08 Aug 2026, 09:14</span></div>
            <button onClick={logout} className="mt-2 flex items-center gap-2 text-sm text-coral-600 font-semibold hover:underline"><LogOut size={14} /> Sign out of all sessions</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
