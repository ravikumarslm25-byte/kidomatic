import { useState, useEffect, useMemo } from "react";
import { MonitorPlay, FileText, Video, Download, X, Eye } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { usePortal } from "@/store/portal";

const ytId = (url) => { const m = (url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/); return m ? m[1] : null; };

export default function PortalMaterials() {
  const { child } = usePortal();
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [subject, setSubject] = useState("all"); const [view, setView] = useState(null);
  useEffect(() => {
    if (!child) return; setLoading(true);
    Promise.all([resourceService("lmsLessons").list({ studentId: child.studentId }).catch(() => []), resourceService("lessons").list({ studentId: child.studentId }).catch(() => [])])
      .then(([a, b]) => setRows([...normList(a), ...normList(b)].filter((l) => l.status !== "Draft"))).catch(() => setRows([])).finally(() => setLoading(false));
  }, [child?.studentId]);
  const subjects = useMemo(() => [...new Set(rows.map((r) => r.subject).filter(Boolean))], [rows]);
  const shown = rows.filter((r) => subject === "all" || r.subject === subject);

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  return (
    <div>
      <PageHeader title="Syllabus & Materials" icon={MonitorPlay} subtitle={`Lessons & resources for ${child?.klass || "your class"}`} />
      {subjects.length > 0 && <div className="flex gap-2 flex-wrap mb-4"><button onClick={() => setSubject("all")} className={`px-3 h-8 rounded-lg text-sm ${subject === "all" ? "bg-royal-100 text-royal font-semibold" : "bg-white/60 border border-navy/10 text-navy/60"}`}>All</button>{subjects.map((s) => <button key={s} onClick={() => setSubject(s)} className={`px-3 h-8 rounded-lg text-sm ${subject === s ? "bg-royal-100 text-royal font-semibold" : "bg-white/60 border border-navy/10 text-navy/60"}`}>{s}</button>)}</div>}
      <div className="grid sm:grid-cols-2 gap-3">
        {shown.map((l) => {
          const isVid = /video/i.test(l.type) || l.videoUrl;
          return (
            <Card key={l.id} className="flex items-start gap-3">
              <span className={`h-11 w-11 rounded-2xl grid place-items-center shrink-0 ${isVid ? "bg-coral-100 text-coral-600" : "bg-royal-100 text-royal"}`}>{isVid ? <Video size={19} /> : <FileText size={19} />}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy text-sm">{l.title}</p>
                <p className="text-[11px] text-navy/45 mb-2">{l.subject || "General"}{l.duration ? ` · ${l.duration} min` : ""}</p>
                <button onClick={() => setView(l)} className="text-xs text-royal font-semibold flex items-center gap-1 bg-royal-50 px-2.5 py-1.5 rounded-lg"><Eye size={13} /> View</button>
              </div>
            </Card>
          );
        })}
        {shown.length === 0 && <Card className="py-14 text-center text-navy/40 sm:col-span-2">No materials published yet.</Card>}
      </div>

      {view && (
        <Modal open onClose={() => setView(null)} title={view.title} size="lg" footer={null}>
          <div className="space-y-3">
            <p className="text-xs text-navy/50">{view.subject || "General"}{view.type ? ` · ${view.type}` : ""}{view.duration ? ` · ${view.duration} min` : ""}</p>
            {view.videoUrl && (
              <div className="rounded-xl overflow-hidden bg-black aspect-video">
                {ytId(view.videoUrl)
                  ? <iframe src={`https://www.youtube-nocookie.com/embed/${ytId(view.videoUrl)}`} title={view.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  : <video src={view.videoUrl} controls className="w-full h-full" />}
              </div>
            )}
            {view.content && <div className="rounded-xl bg-white/60 border border-navy/8 p-4 text-sm text-navy/75 whitespace-pre-wrap leading-relaxed">{view.content}</div>}
            {view.attachment && (view.attachment.publicUrl || view.attachment.url) && <a href={view.attachment.publicUrl || view.attachment.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-royal font-semibold bg-royal-50 px-3 py-2 rounded-lg"><Download size={15} /> {view.attachment.name || "Download material"}</a>}
            {!view.videoUrl && !view.content && !view.attachment && <p className="text-sm text-navy/40 py-8 text-center">No preview available for this lesson.</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
