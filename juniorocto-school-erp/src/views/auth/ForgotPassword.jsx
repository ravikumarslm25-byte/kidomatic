import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import Logo from "@/components/brand/Logo";
import Button from "@/components/ui/Button";
import { useToast } from "@/store/toast";

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="lg:col-span-2 flex items-center justify-center p-6">
      <div className="w-full max-w-sm glass rounded-xl3 shadow-glass p-8">
        <Logo markSize={30} />
        <h2 className="font-display text-2xl text-navy mt-6">Reset password</h2>
        <p className="text-sm text-navy/50 mt-1">
          {sent ? "If that email exists, a reset link is on its way." : "We'll email you a secure reset link."}
        </p>
        {!sent && (
          <div className="mt-6 space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" type="email"
                className="h-11 w-full rounded-xl bg-white/70 border border-navy/12 pl-9 pr-3 text-sm outline-none focus:border-royal/45 text-navy" />
            </div>
            <Button className="w-full" onClick={() => { setSent(true); toast.success("Reset link sent"); }}>Send reset link</Button>
          </div>
        )}
        <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-royal font-semibold hover:underline"><ArrowLeft size={15} /> Back to sign in</Link>
      </div>
    </div>
  );
}
