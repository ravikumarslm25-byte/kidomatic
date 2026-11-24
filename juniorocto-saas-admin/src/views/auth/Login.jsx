import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Store, Building2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";
import Logo from "@/components/brand/Logo";
import OctoMark from "@/components/brand/OctoMark";
import { USE_MOCK } from "@/config/app";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState("superadmin@juniorocto.com");
  const [password, setPassword] = useState("demo1234");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try { await login({ email, password }); nav("/"); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div className="hidden lg:flex glass-dark relative overflow-hidden flex-col justify-between p-10">
        <div className="absolute -top-16 -right-10 h-72 w-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(46,107,196,.4), transparent 70%)" }} />
        <div className="absolute bottom-0 -left-10 h-72 w-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(242,106,53,.3), transparent 70%)" }} />
        <Logo dark markSize={34} tag="Master Admin" />
        <div className="relative">
          <div className="animate-floaty mb-6 grid place-items-center h-28 w-28 rounded-3xl bg-white/90 shadow-glass"><OctoMark size={92} /></div>
          <h1 className="font-display text-4xl text-white leading-tight">The whole<br />platform, controlled.</h1>
          <p className="mt-4 text-white/60 max-w-md">Manage resellers, every school on the platform, plans and revenue — from one control plane.</p>
          <div className="mt-8 space-y-3 text-white/75 text-sm">
            <div className="flex items-center gap-2.5"><Store size={16} className="text-coral" /> Onboard & govern resellers</div>
            <div className="flex items-center gap-2.5"><Building2 size={16} className="text-coral" /> Every customer, filterable by reseller</div>
            <div className="flex items-center gap-2.5"><ShieldCheck size={16} className="text-coral" /> Plans, status & revenue control</div>
          </div>
        </div>
        <p className="relative text-white/40 text-xs">Powered by HackGeniX</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo tag="Master Admin" /></div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-royal bg-royal-100 rounded-full px-2.5 py-1">Master Admin</span>
          <h2 className="font-display text-2xl text-navy mt-3">Welcome back</h2>
          <p className="text-sm text-navy/50 mt-1">Sign in to the platform console.</p>
          <div className="mt-7 space-y-4">
            <label className="block">
              <span className="block text-xs font-semibold text-navy/60 mb-1.5">Email</span>
              <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="h-11 w-full rounded-xl bg-white/70 border border-navy/12 pl-9 pr-3 text-sm outline-none focus:border-royal/45 text-navy" /></div>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-navy/60 mb-1.5">Password</span>
              <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" onKeyDown={(e) => e.key === "Enter" && submit()} className="h-11 w-full rounded-xl bg-white/70 border border-navy/12 pl-9 pr-3 text-sm outline-none focus:border-royal/45 text-navy" /></div>
            </label>
            <button onClick={submit} disabled={busy} className="btn-grad text-white font-semibold h-11 w-full rounded-xl shadow-soft flex items-center justify-center gap-2 hover:brightness-105 active:scale-[.99] disabled:opacity-60">
              {busy ? "Signing in…" : <>Sign in <ArrowRight size={17} /></>}
            </button>
            <div className="text-center"><Link to="/forgot-password" className="text-sm text-royal font-semibold hover:underline">Forgot password?</Link></div>
          </div>
          {USE_MOCK && <p className="mt-6 text-center text-xs text-navy/40">Demo mode — any credentials work. Live login uses <span className="font-mono">/api/auth/platform/login</span>.</p>}
        </div>
      </div>
    </>
  );
}
