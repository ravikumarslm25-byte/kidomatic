import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Waves } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useBranding } from "@/store/branding";
import { USE_MOCK } from "@/config/app";
import { useToast } from "@/store/toast";
import Logo from "@/components/brand/Logo";
import OctoMark from "@/components/brand/OctoMark";
import logoLandscape from "@/assets/logo-landscape.png";

export default function Login() {
  const { login } = useAuth();
  const b = useBranding();
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState("principal@bluelagoon.edu");
  const [password, setPassword] = useState("demo1234");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try { await login({ email, password }); nav("/app"); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <>
      {/* Showcase panel */}
      <div className="hidden lg:flex glass-dark relative overflow-hidden flex-col justify-between p-10">
        <div className="absolute -top-16 -right-10 h-72 w-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(242,106,53,.35), transparent 70%)" }} />
        <div className="absolute bottom-0 -left-10 h-72 w-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(79,168,196,.35), transparent 70%)" }} />
        <Logo dark markSize={34} />
        <div className="relative">
          <div className="animate-floaty mb-6 grid place-items-center h-32 w-32 rounded-3xl bg-white/90 shadow-glass"><OctoMark size={104} /></div>
          <h1 className="font-display text-4xl text-white leading-tight">Run your whole school<br />from one calm place.</h1>
          <p className="mt-4 text-white/60 max-w-md">{b?.tagline}. Admissions, fees, academics, attendance and AI insights — for every classroom from Nursery to Grade 12.</p>
          <div className="mt-8 flex gap-6 text-white/70 text-sm">
            <div><p className="font-display text-2xl text-white">1,240</p>students</div>
            <div><p className="font-display text-2xl text-white">96%</p>fee collection</div>
            <div><p className="font-display text-2xl text-white">4</p>AI copilots</div>
          </div>
        </div>
        <p className="relative text-white/40 text-xs flex items-center gap-1.5"><Waves size={13} /> Powered by HackGeniX</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center"><img src={logoLandscape} alt="KidoMatic" className="h-14" /></div>
          <h2 className="font-display text-2xl text-navy">Welcome back</h2>
          <p className="text-sm text-navy/50 mt-1">Sign in to your school dashboard.</p>

          <div className="mt-7 space-y-4">
            <label className="block">
              <span className="block text-xs font-semibold text-navy/60 mb-1.5">Email</span>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                  className="h-11 w-full rounded-xl bg-white/70 border border-navy/12 pl-9 pr-3 text-sm outline-none focus:border-royal/45 text-navy" />
              </div>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-navy/60 mb-1.5">Password</span>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="h-11 w-full rounded-xl bg-white/70 border border-navy/12 pl-9 pr-3 text-sm outline-none focus:border-royal/45 text-navy" />
              </div>
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-navy/60"><input type="checkbox" className="accent-[var(--jo-blue)]" defaultChecked /> Remember me</label>
              <Link to="/app/forgot" className="text-royal font-semibold hover:underline">Forgot password?</Link>
            </div>
            <button onClick={submit} disabled={busy}
              className="btn-grad text-white font-semibold h-11 w-full rounded-xl shadow-soft flex items-center justify-center gap-2 hover:brightness-105 active:scale-[.99] disabled:opacity-60">
              {busy ? "Signing in…" : <>Sign in <ArrowRight size={17} /></>}
            </button>
          </div>
          {USE_MOCK && <p className="mt-6 text-center text-xs text-navy/40">Demo mode — any credentials work. Wire <span className="font-mono">VITE_USE_MOCK=false</span> for your API.</p>}
        </div>
      </div>
    </>
  );
}
