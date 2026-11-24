import { useState, useEffect, useMemo, useRef } from "react";
import { Sparkles, AlertTriangle, IndianRupee, Package, CalendarDays, Send, Bot, TrendingUp, Users, RefreshCw } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { inr } from "@/lib/format";

const money = (v) => inr(+v || 0);

export default function AICenter() {
  const [data, setData] = useState(null);
  const load = async () => {
    const names = ["students", "invoices", "invItems", "events", "communications", "payments"];
    const out = {};
    await Promise.all(names.map((n) => resourceService(n).list({}).then((r) => { out[n] = normList(r); }).catch(() => { out[n] = []; })));
    setData(out);
  };
  useEffect(() => { load(); }, []);

  const insights = useMemo(() => {
    if (!data) return [];
    const list = [];
    const unpaid = (data.invoices || []).filter((i) => i.status !== "Paid");
    if (unpaid.length) { const total = unpaid.reduce((a, i) => a + (+i.amount || 0), 0); list.push({ icon: IndianRupee, tone: "coral", title: "Fee defaulters", text: `${unpaid.length} unpaid invoice(s) worth ${money(total)}. Sending reminders today improves recovery.`, cta: "/fees/invoices" }); }
    const low = (data.invItems || []).filter((it) => (+it.availableCount || 0) <= (+it.reorderLevel || 0) && it.reorderLevel != null);
    if (low.length) list.push({ icon: Package, tone: "royal", title: "Low stock", text: `${low.length} item(s) at or below reorder level: ${low.slice(0, 3).map((i) => i.name).join(", ")}${low.length > 3 ? "…" : ""}.`, cta: "/inventory" });
    const soon = (data.events || []).filter((e) => { const d = new Date(e.start || e.date || 0); const days = (d - Date.now()) / 864e5; return days >= 0 && days <= 7; });
    if (soon.length) list.push({ icon: CalendarDays, tone: "sea", title: "This week", text: `${soon.length} event(s) in the next 7 days: ${soon.slice(0, 3).map((e) => e.title).join(", ")}.`, cta: "/calendar" });
    const students = (data.students || []).length;
    if (students) list.push({ icon: Users, tone: "royal", title: "Enrolment", text: `${students} students on roll. Retention and admission trends are in Reports & Analytics.`, cta: "/analytics" });
    if (!list.length) list.push({ icon: Sparkles, tone: "sea", title: "All clear", text: "No pressing alerts from your live data right now. Ask me anything below.", cta: null });
    return list;
  }, [data]);

  return (
    <div>
      <PageHeader title="AI Center" icon={Sparkles} subtitle="Insights and answers from your school's live data"
        actions={<Button variant="outline" onClick={() => { setData(null); load(); }}><RefreshCw size={15} /> Refresh</Button>} />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-display text-navy text-lg mb-2 flex items-center gap-2"><TrendingUp size={18} className="text-royal" /> Live Insights</h3>
            {!data ? <Card className="grid place-items-center py-14"><Spinner size={24} /></Card> : (
              <div className="grid sm:grid-cols-2 gap-3">
                {insights.map((ins, i) => { const map = { coral: "text-coral-600 bg-coral-100", royal: "text-royal bg-royal-100", sea: "text-sea bg-sea-100" }; return (
                  <Card key={i} className="hover:shadow-soft transition">
                    <div className="flex items-start gap-3">
                      <span className={`grid place-items-center h-10 w-10 rounded-2xl shrink-0 ${map[ins.tone]}`}><ins.icon size={18} /></span>
                      <div className="flex-1"><p className="font-semibold text-navy text-sm">{ins.title}</p><p className="text-[13px] text-navy/65 mt-0.5 leading-snug">{ins.text}</p>{ins.cta && <a href={ins.cta} className="text-royal text-xs font-semibold mt-1 inline-block hover:underline">Open →</a>}</div>
                    </div>
                  </Card>
                ); })}
              </div>
            )}
          </div>
        </div>

        <AskConsole data={data} />
      </div>
    </div>
  );
}

function AskConsole({ data }) {
  const [chat, setChat] = useState([{ role: "bot", text: "Hi! I'm Octo. Ask me about students, fees, stock, or upcoming events — I read your live data." }]);
  const [input, setInput] = useState("");
  const scroller = useRef(null);
  useEffect(() => { scroller.current?.scrollTo(0, scroller.current.scrollHeight); }, [chat]);

  const answer = (q) => {
    const s = q.toLowerCase();
    const d = data || {};
    const inv = d.invoices || [], stu = d.students || [], items = d.invItems || [], events = d.events || [];
    if (/how many student|student count|total student|enrol/.test(s)) return `${stu.length} students are currently on roll.`;
    if (/outstanding|defaulter|unpaid|pending fee/.test(s)) { const u = inv.filter((i) => i.status !== "Paid"); return u.length ? `${u.length} unpaid invoice(s) totalling ${money(u.reduce((a, i) => a + (+i.amount || 0), 0))}.` : "No outstanding fees — everything's collected."; }
    if (/low stock|reorder|out of stock/.test(s)) { const low = items.filter((it) => (+it.availableCount || 0) <= (+it.reorderLevel || 0) && it.reorderLevel != null); return low.length ? `${low.length} item(s) need restocking: ${low.map((i) => i.name).slice(0, 6).join(", ")}.` : "All inventory items are above their reorder levels."; }
    if (/next event|upcoming|ptm|holiday|meeting/.test(s)) { const up = events.filter((e) => new Date(e.start || e.date || 0) >= new Date()).sort((a, b) => new Date(a.start) - new Date(b.start)); return up.length ? `Next up: ${up[0].title} on ${new Date(up[0].start).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}.` : "Nothing scheduled ahead on the calendar."; }
    const nameMatch = stu.find((x) => s.includes((x.name || "").toLowerCase().split(" ")[0]) && (x.name || "").length > 2);
    if (/fee|due|invoice/.test(s) && nameMatch) { const bill = inv.find((i) => (i.student || "").toLowerCase().includes((nameMatch.name || "").toLowerCase())); return bill ? `${nameMatch.name}: invoice ${bill.invoiceNo || ""} of ${money(bill.amount)} is ${bill.status || "pending"}.` : `No invoice found for ${nameMatch.name}.`; }
    if (nameMatch) return `${nameMatch.name} is in ${nameMatch.klass || "—"}${nameMatch.section ? "-" + nameMatch.section : ""}. Ask about their fees or attendance.`;
    return "I can answer about student counts, outstanding fees, low stock, and upcoming events — try one of the chips above. (Deeper natural-language analytics connects to your configured AI provider in Settings → Integrations.)";
  };

  const send = (q) => { const text = (q ?? input).trim(); if (!text) return; setChat((c) => [...c, { role: "me", text }, { role: "bot", text: answer(text) }]); setInput(""); };
  const QUICK = ["How many students?", "Any outstanding fees?", "Low stock items?", "Next event?"];

  return (
    <Card pad={false} className="flex flex-col h-[540px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-navy/6"><span className="grid place-items-center h-8 w-8 rounded-xl btn-grad text-white"><Bot size={16} /></span><div><p className="font-semibold text-navy text-sm">Ask your school</p><p className="text-[11px] text-navy/45">Answers from live data</p></div></div>
      <div ref={scroller} className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.role === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${m.role === "me" ? "btn-grad text-white" : "bg-white/70 border border-navy/8 text-navy/80"}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="px-3 pb-2 flex flex-wrap gap-1.5">{QUICK.map((q) => <button key={q} onClick={() => send(q)} className="text-[11px] px-2.5 py-1 rounded-full bg-royal-100 text-royal hover:bg-royal-200">{q}</button>)}</div>
      <div className="flex items-center gap-2 p-3 border-t border-navy/6">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask a question…" className="flex-1 h-10 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm outline-none" />
        <button onClick={() => send()} className="grid place-items-center h-10 w-10 rounded-xl btn-grad text-white"><Send size={16} /></button>
      </div>
    </Card>
  );
}
