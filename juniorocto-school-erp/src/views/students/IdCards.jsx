import { useState } from "react";
import { CreditCard, Printer } from "lucide-react";
import { useList } from "@/controllers/useList";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import OctoMark from "@/components/brand/OctoMark";
import Avatar from "@/components/ui/Avatar";
import { useBranding } from "@/store/branding";

const TEMPLATES = ["Classic", "Modern"];
const SIZES = { "Standard (portrait)": { w: 210, h: 330 }, "Landscape": { w: 340, h: 210 }, "Large portrait": { w: 250, h: 390 } };
const FIELDS = ["DOB", "Blood group", "Parent", "Phone", "Address", "Route"];

export default function IdCards() {
  const b = useBranding();
  const { rows: all } = useList("students");
  const [tpl, setTpl] = useState("Classic");
  const [size, setSize] = useState("Standard (portrait)");
  const [klass, setKlass] = useState("");
  const [show, setShow] = useState({ DOB: true, "Blood group": true, Parent: true, Phone: true, Address: false, Route: false });
  const dim = SIZES[size];

  const students = all.filter((s) => (s.status || "Active") === "Active" && (!klass || s.klass === klass));
  const classes = [...new Set(all.map((s) => s.klass).filter(Boolean))];
  const session = b?.school?.session || "2026–27";

  return (
    <div>
      <PageHeader title="Student ID Cards" icon={CreditCard} subtitle="Standard template · choose size, design & fields"
        actions={<Button variant="outline" onClick={() => window.print()}><Printer size={16} /> Print</Button>} />

      {/* Designer controls */}
      <div className="glass rounded-xl2 shadow-glass p-4 mb-5 flex flex-wrap gap-4 items-end print:hidden">
        <Ctl label="Design"><select value={tpl} onChange={(e) => setTpl(e.target.value)} className="ctl">{TEMPLATES.map((t) => <option key={t}>{t}</option>)}</select></Ctl>
        <Ctl label="Size"><select value={size} onChange={(e) => setSize(e.target.value)} className="ctl">{Object.keys(SIZES).map((t) => <option key={t}>{t}</option>)}</select></Ctl>
        <Ctl label="Class"><select value={klass} onChange={(e) => setKlass(e.target.value)} className="ctl"><option value="">All classes</option>{classes.map((c) => <option key={c}>{c}</option>)}</select></Ctl>
        <div><p className="text-xs font-semibold text-navy/60 mb-1.5">Fields</p><div className="flex flex-wrap gap-1.5">
          {FIELDS.map((f) => <button key={f} onClick={() => setShow((s) => ({ ...s, [f]: !s[f] }))} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${show[f] ? "bg-royal-100 text-royal" : "bg-white/60 border border-navy/10 text-navy/50"}`}>{f}</button>)}
        </div></div>
        <span className="ml-auto text-sm text-navy/50">{students.length} cards</span>
      </div>

      <div className="flex flex-wrap gap-4">
        {students.map((s) => <Card key={s.id} s={s} b={b} tpl={tpl} dim={dim} show={show} session={session} landscape={size === "Landscape"} />)}
      </div>
      <style>{`.ctl{height:38px;border-radius:12px;background:rgba(255,255,255,.7);border:1px solid rgba(20,51,94,.12);padding:0 10px;font-size:14px;color:#14335E;outline:none}`}</style>
    </div>
  );
}
const Ctl = ({ label, children }) => <div><p className="text-xs font-semibold text-navy/60 mb-1.5">{label}</p>{children}</div>;

function Row({ k, v }) { return v ? <div className="flex text-[10px] leading-tight"><span className="text-navy/45 w-14 shrink-0">{k}</span><span className="text-navy/80 font-medium truncate">{v}</span></div> : null; }

function Card({ s, b, tpl, dim, show, session, landscape }) {
  const header = (
    <div className="flex items-center gap-1.5 text-white">
      <OctoMark size={18} /><div className="leading-tight"><p className="font-display text-[11px]">{b?.name || "School"}</p><p className="text-[7px] text-white/70">{b?.school?.address || "Salem, Tamil Nadu"}</p></div>
    </div>
  );
  const details = (
    <div className="space-y-0.5 mt-1">
      <Row k="Adm. No" v={s.admissionNo} />
      <Row k="Class" v={`${s.klass || ""}${s.section ? " · " + s.section : ""}`} />
      {show.DOB && <Row k="DOB" v={s.dob} />}
      {show["Blood group"] && <Row k="Blood" v={s.bloodGroup || "—"} />}
      {show.Parent && <Row k="Parent" v={s.parentName || s.parent} />}
      {show.Phone && <Row k="Phone" v={s.phone} />}
      {show.Route && <Row k="Route" v={s.route} />}
      {show.Address && <Row k="Address" v={s.address} />}
    </div>
  );
  const footer = <div className="flex items-center justify-between text-[7px] text-navy/50 mt-auto pt-1 border-t border-navy/10"><span>Valid {session}</span><span className="italic">Principal</span></div>;

  if (landscape) return (
    <div className="bg-white rounded-xl overflow-hidden shadow-glass border border-navy/10 flex flex-col" style={{ width: dim.w, height: dim.h }}>
      <div className="px-3 py-1.5" style={{ background: "var(--brand-navy,#14335E)" }}>{header}</div>
      <div className="flex gap-3 p-3 flex-1">
        <div className="flex flex-col items-center gap-1"><Avatar name={s.name} size={56} /><span className="text-[10px] font-display text-navy text-center leading-tight">{s.name}</span></div>
        <div className="flex-1 flex flex-col">{details}{footer}</div>
      </div>
      <div className="h-1.5" style={{ background: "var(--brand-coral,#E85410)" }} />
    </div>
  );

  // Portrait
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-glass border border-navy/10 flex flex-col" style={{ width: dim.w, height: dim.h }}>
      <div className="px-3 py-2" style={{ background: tpl === "Modern" ? "linear-gradient(135deg,#1651A3,#3FB6C9)" : "var(--brand-navy,#14335E)" }}>{header}</div>
      <div className="flex flex-col items-center pt-3 px-3">
        <div className="rounded-xl ring-2 ring-white shadow" style={{ boxShadow: "0 4px 14px rgba(20,51,94,.2)" }}><Avatar name={s.name} size={tpl === "Modern" ? 74 : 68} /></div>
        <p className="font-display text-navy text-sm mt-2 text-center leading-tight">{s.name}</p>
        <span className="text-[9px] text-white px-2 py-0.5 rounded-full mt-1" style={{ background: "var(--brand-coral,#E85410)" }}>{s.klass}{s.section ? " · " + s.section : ""}</span>
      </div>
      <div className="px-3 flex-1 flex flex-col">{details}{footer}</div>
      <div className="h-1.5" style={{ background: tpl === "Modern" ? "#FFC24B" : "var(--brand-coral,#E85410)" }} />
    </div>
  );
}
