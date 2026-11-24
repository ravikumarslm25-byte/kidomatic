import { useState, useEffect, useMemo } from "react";
import { Megaphone, Mail, Pin, Paperclip } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";

const truthy = (v) => v === true || v === "true";
const dt = (v) => (v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "");
export default function PortalCirculars() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [tab, setTab] = useState("all");
  useEffect(() => {
    resourceService("communications").list({}).then((r) => setRows(normList(r).filter((c) => c.status !== "Draft"))).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  const feed = useMemo(() => [...rows]
    .filter((c) => tab === "all" || (tab === "circular" ? /circular/i.test(c.type) : /announcement/i.test(c.type)))
    .sort((a, b) => (truthy(b.pinned) - truthy(a.pinned)) || (b.publishAt || b.createdAt || "").localeCompare(a.publishAt || a.createdAt || "")), [rows, tab]);

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  return (
    <div>
      <PageHeader title="Circulars & Announcements" icon={Megaphone} subtitle="Notices from your school" />
      <div className="flex gap-1 mb-4">
        {[["all", "All"], ["announcement", "Announcements"], ["circular", "Circulars"]].map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`px-3 h-9 rounded-xl text-sm font-medium ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}>{l}</button>)}
      </div>
      <div className="space-y-3">
        {feed.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start gap-3">
              <span className="h-10 w-10 rounded-xl bg-royal-100 text-royal grid place-items-center shrink-0">{/circular/i.test(c.type) ? <Mail size={18} /> : <Megaphone size={18} />}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-navy">{c.title}</p>
                  {truthy(c.pinned) && <Pin size={13} className="text-royal" />}
                  {c.priority && c.priority !== "Normal" && <Badge color="amber">{c.priority}</Badge>}
                </div>
                <p className="text-[11px] text-navy/45 mb-1">{c.circularNo ? `${c.circularNo} · ` : ""}{c.category || c.type} · {dt(c.publishAt || c.createdAt)}</p>
                {c.body && <p className="text-sm text-navy/70 whitespace-pre-wrap leading-snug">{c.body}</p>}
                {Array.isArray(c.attachments) && c.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">{c.attachments.map((a, i) => <a key={i} href={a.publicUrl || a.url} target="_blank" rel="noreferrer" className="text-xs text-royal flex items-center gap-1 bg-royal-50 px-2 py-1 rounded"><Paperclip size={11} /> {a.name || `Attachment ${i + 1}`}</a>)}</div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {feed.length === 0 && <Card className="py-14 text-center text-navy/40">No circulars yet.</Card>}
      </div>
    </div>
  );
}
