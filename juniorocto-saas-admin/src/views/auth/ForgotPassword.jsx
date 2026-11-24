import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, MailCheck } from "lucide-react";
import { authService } from "@/services/auth.service";
import Logo from "@/components/brand/Logo";
import OctoMark from "@/components/brand/OctoMark";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async () => { setBusy(true); try { await authService.forgotPassword({ email }); setSent(true); } finally { setBusy(false); } };
  return (
    <>
      <div className="hidden lg:flex glass-dark relative overflow-hidden flex-col justify-between p-10">
        <Logo dark markSize={34} tag="Master Admin" />
        <div className="relative"><div className="animate-floaty mb-6 grid place-items-center h-28 w-28 rounded-3xl bg-white/90 shadow-glass"><OctoMark size={92} /></div>
          <h1 className="font-display text-4xl text-white leading-tight">Reset your<br />password.</h1>
          <p className="mt-4 text-white/60 max-w-md">We'll email you a secure link to set a new password.</p></div>
        <p className="relative text-white/40 text-xs">Powered by HackGeniX</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-royal font-semibold hover:underline mb-6"><ArrowLeft size={15} /> Back to sign in</Link>
          {sent ? (
            <div className="text-center">
              <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-500 mb-4"><MailCheck size={30} /></div>
              <h2 className="font-display text-2xl text-navy">Check your email</h2>
              <p className="text-sm text-navy/50 mt-2">If an account exists for <span className="font-medium text-navy">{email}</span>, a reset link is on its way.</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl text-navy">Forgot password?</h2>
              <p className="text-sm text-navy/50 mt-1">Enter your account email.</p>
              <label className="block mt-7"><span className="block text-xs font-semibold text-navy/60 mb-1.5">Email</span>
                <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" onKeyDown={(e) => e.key === "Enter" && submit()} className="h-11 w-full rounded-xl bg-white/70 border border-navy/12 pl-9 pr-3 text-sm outline-none focus:border-royal/45 text-navy" /></div>
              </label>
              <button onClick={submit} disabled={busy} className="btn-grad text-white font-semibold h-11 w-full rounded-xl shadow-soft mt-5 disabled:opacity-60">{busy ? "Sending…" : "Send reset link"}</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
