import { useState, useEffect, useMemo } from "react";
import { GraduationCap, FileText, Video, HelpCircle, ArrowLeft, CheckCircle2, XCircle, Download, Trophy } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RefSelect from "@/components/ui/RefSelect";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useAuth } from "@/store/auth";
import { signGet } from "@/services/upload";

const svc = resourceService("lmsLessons");
const progSvc = resourceService("lmsProgress");
const TYPE = { material: { label: "Material", icon: FileText, color: "#1651A3" }, video: { label: "Video", icon: Video, color: "#E85410" }, quiz: { label: "Quiz", icon: HelpCircle, color: "#7c3aed" } };

const ytId = (url = "") => { const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/); return m ? m[1] : null; };

export default function Learn() {
  const { user } = useAuth();
  const [klass, setKlass] = useState(user?.klass || "");
  const [subject, setSubject] = useState("");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  const load = async () => { setLoading(true); setLessons(normList(await svc.list({})).filter((l) => (l.status || "Published") === "Published")); setLoading(false); };
  useEffect(() => { load(); }, []);
  const shown = useMemo(() => lessons.filter((l) => (!klass || l.klass === klass) && (!subject || l.subject === subject)), [lessons, klass, subject]);

  if (open) return <LessonView lesson={open} onBack={() => setOpen(null)} user={user} />;

  return (
    <div>
      <PageHeader title="My Learning" icon={GraduationCap} subtitle="Read, watch and practise — pick a subject to begin" />
      <div className="glass rounded-xl2 shadow-glass p-4 mb-5 flex flex-wrap gap-3 items-end">
        <div className="w-44"><p className="text-xs font-semibold text-navy/60 mb-1.5">Class</p><RefSelect resource="classes" labelKey="name" value={klass} onChange={setKlass} placeholder="Class…" /></div>
        <div className="w-44"><p className="text-xs font-semibold text-navy/60 mb-1.5">Subject</p><RefSelect resource="subjects" labelKey="name" value={subject} onChange={setSubject} placeholder="All subjects" /></div>
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>
        : !klass ? <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/50">Choose your class to see your lessons.</div>
        : shown.length === 0 ? <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/50">No lessons published for this selection yet.</div>
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((l) => { const t = TYPE[l.type] || TYPE.material; return (
              <button key={l.id} onClick={() => setOpen(l)} className="glass rounded-xl2 shadow-glass p-5 text-left hover:shadow-lift transition group">
                <div className="h-11 w-11 rounded-xl grid place-items-center text-white mb-3" style={{ background: t.color }}><t.icon size={20} /></div>
                <h3 className="font-display text-navy leading-tight group-hover:text-royal">{l.title}</h3>
                <div className="flex flex-wrap gap-1.5 mt-2"><Badge>{t.label}</Badge>{l.subject && <Badge color="blue">{l.subject}</Badge>}</div>
                {l.type === "quiz" && <p className="text-xs text-navy/50 mt-2">{(l.questions || []).length} questions</p>}
                {l.type === "video" && l.duration ? <p className="text-xs text-navy/50 mt-2">{l.duration} min watch</p> : null}
              </button>
            ); })}
          </div>
        )}
    </div>
  );
}

function LessonView({ lesson, onBack, user }) {
  const t = TYPE[lesson.type] || TYPE.material;
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-navy/60 hover:text-navy text-sm mb-4"><ArrowLeft size={16} /> Back to lessons</button>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-11 w-11 rounded-xl grid place-items-center text-white" style={{ background: t.color }}><t.icon size={20} /></div>
        <div><h1 className="font-display text-2xl text-navy">{lesson.title}</h1><p className="text-sm text-navy/50">{lesson.klass}{lesson.subject ? " · " + lesson.subject : ""}</p></div>
      </div>
      {lesson.type === "material" && <Material lesson={lesson} />}
      {lesson.type === "video" && <VideoLesson lesson={lesson} />}
      {lesson.type === "quiz" && <Quiz lesson={lesson} user={user} />}
    </div>
  );
}

function Material({ lesson }) {
  const [url, setUrl] = useState(null);
  const openFile = async () => { try { const u = lesson.attachment?.publicUrl || (lesson.attachment?.key ? await signGet(lesson.attachment.key) : null); if (u) window.open(u, "_blank"); } catch {} };
  return (
    <Card>
      <div className="prose max-w-none whitespace-pre-wrap text-navy/80 leading-relaxed">{lesson.content || "No content."}</div>
      {lesson.attachment?.name && <button onClick={openFile} className="mt-5 inline-flex items-center gap-2 text-royal font-semibold text-sm"><Download size={16} /> {lesson.attachment.name}</button>}
    </Card>
  );
}

function VideoLesson({ lesson }) {
  const id = ytId(lesson.videoUrl);
  return (
    <Card pad={false} className="overflow-hidden">
      <div className="aspect-video bg-black">
        {id ? <iframe title={lesson.title} className="w-full h-full" src={`https://www.youtube.com/embed/${id}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          : lesson.videoUrl ? <video className="w-full h-full" src={lesson.videoUrl} controls /> : <div className="grid place-items-center h-full text-white/50">No video URL</div>}
      </div>
    </Card>
  );
}

function Quiz({ lesson, user }) {
  const questions = lesson.questions || [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const total = questions.reduce((a, q) => a + (+q.marks || 1), 0);
  const score = questions.reduce((a, q, i) => a + (answers[i] === q.correct ? (+q.marks || 1) : 0), 0);
  const pct = total ? Math.round((score / total) * 100) : 0;
  const passed = pct >= (lesson.passingScore || 0);

  const submit = async () => {
    setSubmitted(true);
    try { await progSvc.create({ studentId: user?.id || "", studentName: user?.name || "", lessonId: lesson.id, lessonTitle: lesson.title, klass: lesson.klass, subject: lesson.subject, status: "completed", score, maxScore: total, completedAt: new Date().toISOString() }); } catch {}
  };

  if (submitted) return (
    <Card>
      <div className="text-center py-4">
        <div className="mx-auto h-16 w-16 rounded-full grid place-items-center mb-3" style={{ background: passed ? "#dcfce7" : "#fee2e2" }}>{passed ? <Trophy size={30} className="text-emerald-600" /> : <XCircle size={30} className="text-coral-600" />}</div>
        <h2 className="font-display text-2xl text-navy">{passed ? "Well done!" : "Keep practising!"}</h2>
        <p className="text-navy/60 mt-1">You scored <b className="text-navy">{score}/{total}</b> ({pct}%) · pass mark {lesson.passingScore}%</p>
      </div>
      <div className="space-y-3 mt-4">
        {questions.map((q, i) => { const right = answers[i] === q.correct; return (
          <div key={i} className="rounded-xl border border-navy/10 p-3">
            <p className="font-medium text-navy flex items-start gap-2">{right ? <CheckCircle2 size={16} className="text-emerald-600 mt-0.5" /> : <XCircle size={16} className="text-coral-600 mt-0.5" />} {i + 1}. {q.q}</p>
            <div className="mt-2 space-y-1 pl-6">{q.options.map((o, oi) => (
              <div key={oi} className={`text-sm px-2 py-1 rounded ${oi === q.correct ? "bg-emerald-50 text-emerald-700 font-medium" : oi === answers[i] ? "bg-coral-50 text-coral-600" : "text-navy/60"}`}>{o}{oi === q.correct ? " ✓" : ""}</div>
            ))}</div>
          </div>
        ); })}
      </div>
      <Button className="mt-5" onClick={() => { setSubmitted(false); setAnswers({}); }}>Try again</Button>
    </Card>
  );

  return (
    <Card>
      <p className="text-sm text-navy/50 mb-4">{questions.length} questions · pass mark {lesson.passingScore}%</p>
      <div className="space-y-5">
        {questions.map((q, i) => (
          <div key={i}>
            <p className="font-medium text-navy mb-2">{i + 1}. {q.q}</p>
            <div className="space-y-2">{q.options.map((o, oi) => (
              <button key={oi} onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))} className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl border text-sm ${answers[i] === oi ? "border-royal bg-royal-100 text-royal" : "border-navy/12 bg-white/60 text-navy/70 hover:border-royal/40"}`}>
                <span className={`h-4 w-4 rounded-full border grid place-items-center ${answers[i] === oi ? "border-royal" : "border-navy/30"}`}>{answers[i] === oi && <span className="h-2 w-2 rounded-full bg-royal" />}</span>{o}
              </button>
            ))}</div>
          </div>
        ))}
      </div>
      <Button className="mt-6" onClick={submit} disabled={Object.keys(answers).length < questions.length}>Submit quiz</Button>
    </Card>
  );
}
