import { useState } from "react";
import { Link } from "react-router-dom";
import { USE_MOCK, API_URL } from "@/config/app";
import Octo from "../Octo";

const RATE = 50, GST = 18;
const params = new URLSearchParams(window.location.search);
const REF = params.get("ref");

async function checkout(body) {
  if (USE_MOCK) { await new Promise((r) => setTimeout(r, 500)); return { activated: !REF, invoiceNumber: "JO-INV-26-0007", tempPassword: Math.random().toString(36).slice(2, 10), model: REF ? "referral" : "direct_web" }; }
  const create = await fetch(`${API_URL}/public/checkout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, ref: REF }) });
  const c = await create.json(); if (!create.ok) throw new Error(c.error || "Checkout failed");
  const verify = await fetch(`${API_URL}/public/checkout/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: c.data.orderId, paymentId: "pay_mock", signature: "mock_ok", invoiceId: c.data.invoiceId, model: c.data.model, ...body, ref: REF }) });
  const v = await verify.json(); if (!verify.ok) throw new Error(v.error || "Verification failed"); return v.data;
}

export default function GetStarted() {
  const [step, setStep] = useState(0);
  const [seats, setSeats] = useState(120);
  const [f, setF] = useState({ schoolName: "", adminName: "", adminEmail: "" });
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const sub = seats * RATE, tax = Math.round((sub * GST) / 100), total = sub + tax;

  const pay = async () => {
    if (!f.schoolName || !f.adminEmail) { setErr("Add your school name and email."); return; }
    setBusy(true); setErr("");
    try { setRes(await checkout({ schoolName: f.schoolName, adminName: f.adminName, adminEmail: f.adminEmail, seats })); setStep(3); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const steps = ["Plan", "Details", "Pay", "Done"];

  return (
    <section className="grad-foam min-h-[80vh] py-16">
      <div className="max-w-xl mx-auto px-5">
        <div className="text-center mb-8"><div className="flex justify-center mb-3 bob"><Octo size={64} /></div>
          <h1 className="font-display text-3xl text-ink">Start your school on KidoMatic</h1>
          {REF && <span className="chip bg-white text-coral shadow-soft mt-3">Invited by a partner</span>}
        </div>
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => <div key={s} className="flex items-center gap-2 flex-1"><div className={`h-8 w-8 rounded-full grid place-items-center text-sm font-bold shrink-0 ${i <= step ? "btn-coral text-white" : "bg-white text-ink/40 border border-ink/10"}`}>{i < step ? "✓" : i + 1}</div><span className={`text-sm font-semibold ${i <= step ? "text-ink" : "text-ink/40"}`}>{s}</span>{i < 3 && <div className={`h-0.5 flex-1 rounded ${i < step ? "bg-royal/40" : "bg-ink/10"}`} />}</div>)}
        </div>
        {err && <div className="mb-4 rounded-xl bg-coral/10 text-coral px-4 py-2.5 text-sm">{err}</div>}

        {step === 0 && (
          <div className="mcard p-7">
            <h2 className="font-display text-xl text-ink">How many users?</h2><p className="text-sm text-ink/55">₹{RATE}/user/month — students + staff.</p>
            <div className="flex items-center justify-center gap-5 my-6"><button onClick={() => setSeats((s) => Math.max(10, s - 10))} className="h-11 w-11 rounded-xl border border-ink/12">−</button><div className="text-center"><div className="font-display text-5xl text-ink">{seats}</div><div className="text-xs text-ink/45">users</div></div><button onClick={() => setSeats((s) => s + 10)} className="h-11 w-11 rounded-xl border border-ink/12">+</button></div>
            <input type="range" min="10" max="1000" step="10" value={seats} onChange={(e) => setSeats(+e.target.value)} className="w-full accent-[#E85410]" />
            <div className="rounded-2xl bg-foam p-4 mt-5 text-sm"><Row k={`${seats} × ₹50`} v={`₹${sub.toLocaleString("en-IN")}`} /><Row k="GST 18%" v={`₹${tax.toLocaleString("en-IN")}`} /><div className="flex justify-between mt-2 pt-2 border-t border-ink/10"><b>Per month</b><b className="text-coral">₹{total.toLocaleString("en-IN")}</b></div></div>
            <button onClick={() => setStep(1)} className="mbtn btn-coral w-full justify-center py-3 mt-5">Continue</button>
          </div>
        )}
        {step === 1 && (
          <div className="mcard p-7 space-y-4">
            <h2 className="font-display text-xl text-ink">About your school</h2>
            {[["schoolName", "School name"], ["adminName", "Your name"], ["adminEmail", "Email"]].map(([k, l]) => <label key={k} className="block"><span className="text-xs font-semibold text-ink/60">{l}</span><input value={f[k]} onChange={(e) => set(k, e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-ink/12 px-3 text-sm outline-none focus:border-royal/50" /></label>)}
            <div className="flex gap-3"><button onClick={() => setStep(0)} className="mbtn btn-ghost px-5 py-3">Back</button><button onClick={() => setStep(2)} className="mbtn btn-coral flex-1 justify-center py-3">Review & pay</button></div>
          </div>
        )}
        {step === 2 && (
          <div className="mcard p-7">
            <h2 className="font-display text-xl text-ink">Confirm & pay</h2>
            {REF && <p className="text-sm text-ink/55 mt-1">Via partner — our team activates your licence after payment.</p>}
            <div className="rounded-2xl bg-foam p-4 mt-4 text-sm"><Row k={`${f.schoolName || "Your school"} · ${seats} users`} v={`₹${sub.toLocaleString("en-IN")}`} /><Row k="GST 18%" v={`₹${tax.toLocaleString("en-IN")}`} /><div className="flex justify-between mt-2 pt-2 border-t border-ink/10"><b>Total</b><b className="text-coral text-lg">₹{total.toLocaleString("en-IN")}</b></div></div>
            <p className="text-xs text-ink/45 mt-2">🔒 Secured by Razorpay{USE_MOCK ? " (demo)" : ""}</p>
            <div className="flex gap-3 mt-5"><button onClick={() => setStep(1)} className="mbtn btn-ghost px-5 py-3">Back</button><button onClick={pay} disabled={busy} className="mbtn btn-coral flex-1 justify-center py-3 disabled:opacity-60">{busy ? "Processing…" : `Pay ₹${total.toLocaleString("en-IN")}`}</button></div>
          </div>
        )}
        {step === 3 && res && (
          <div className="mcard p-8 text-center">
            <div className="text-4xl mb-2">🎉</div><h2 className="font-display text-2xl text-ink">{res.activated ? "You're live!" : "Payment received"}</h2>
            <p className="text-sm text-ink/60 mt-2">{res.activated ? "Your licence is active — sign in with the temporary password below." : "Our team will activate your licence shortly and email you."}</p>
            <div className="rounded-2xl bg-foam p-4 mt-5 text-sm text-left max-w-xs mx-auto space-y-1.5"><Row k="Invoice" v={<span className="font-mono">{res.invoiceNumber}</span>} /><Row k="Email" v={f.adminEmail} /><Row k="Temp password" v={<span className="font-mono">{res.tempPassword}</span>} /></div>
            <Link to="/app/login" className="mbtn btn-coral px-6 py-3 mt-6 inline-flex">Go to sign in →</Link>
          </div>
        )}
      </div>
    </section>
  );
}
const Row = ({ k, v }) => <div className="flex justify-between py-0.5"><span className="text-ink/55">{k}</span><span className="text-ink font-medium">{v}</span></div>;
