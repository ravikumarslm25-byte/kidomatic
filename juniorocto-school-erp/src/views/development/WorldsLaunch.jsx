import { useEffect, useMemo, useState } from "react";
import { Gamepad2, Play, ExternalLink, Award } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { launchWorld } from "@/services/worlds";
import { WORLDS_URL, USE_MOCK } from "@/config/app";
import { WORLD_GRADES, WORLD_LESSONS, gradeForClass } from "@/config/worldsCatalog";

const students = resourceService("students");
const portfolio = resourceService("portfolio");

// KidoMatic Worlds, launched for one child: the lesson opens in the Worlds app with
// that child's launch token, and the finished lesson comes back to Skills & Milestones
// and the Portfolio (see the recent results below).
export default function WorldsLaunch() {
  const toast = useToast();
  const [list, setList] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [grade, setGrade] = useState("");
  const [busy, setBusy] = useState(null);
  const [recent, setRecent] = useState([]);

  const loadRecent = async () => {
    try { setRecent(normList(await portfolio.list({})).filter((p) => p.type === "World").sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 8)); }
    catch { setRecent([]); }
  };
  useEffect(() => {
    (async () => { try { setList(normList(await students.list({}))); } catch (e) { toast.error(e.message); setList([]); } })();
    loadRecent();
    const onFocus = () => loadRecent(); // results arrive while the lesson tab is open
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const student = useMemo(() => (list || []).find((s) => s.id === studentId) || null, [list, studentId]);
  useEffect(() => { setGrade(student ? gradeForClass(student.klass) || "" : ""); }, [student]);
  const lessons = WORLD_LESSONS.filter((l) => !grade || l.grade === grade);

  const play = async (lesson) => {
    if (!student) { toast.error("Choose a student first."); return; }
    setBusy(lesson.id);
    // open the tab right away (browsers block pop-ups opened after a wait), then point it at the lesson
    const tab = window.open("about:blank", "_blank");
    try {
      const url = await launchWorld({ lesson, student });
      if (tab) tab.location.href = url; else window.location.assign(url);
      toast.success(`${lesson.title} opened for ${student.name}`);
    } catch (e) {
      tab?.close();
      toast.error(e.message);
    } finally { setBusy(null); }
  };

  return (
    <div>
      <PageHeader title="KidoMatic Worlds" icon={Gamepad2}
        subtitle="Start a 3D lesson for a student — when they finish, it shows up in Skills & Milestones and the Portfolio" />

      {!WORLDS_URL && (
        <div className="glass rounded-xl2 p-4 mb-5 text-sm text-coral-600">KidoMatic Worlds isn't connected yet — set <code>VITE_WORLDS_URL</code> in this app's <code>.env</code>.</div>
      )}
      {USE_MOCK && WORLDS_URL && (
        <div className="glass rounded-xl2 p-4 mb-5 text-sm text-navy/70">Demo mode: lessons open as a guest and nothing is saved.</div>
      )}

      <div className="glass rounded-xl2 shadow-glass p-4 mb-5 flex flex-wrap gap-4 items-end">
        <label className="block w-72">
          <span className="text-xs font-semibold text-navy/60 mb-1.5 block">Student</span>
          {list === null ? <Spinner /> : (
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="ctl w-full" aria-label="Student">
              <option value="">Choose a student…</option>
              {list.map((s) => <option key={s.id} value={s.id}>{s.name}{s.klass ? ` — ${s.klass}${s.section ? `-${s.section}` : ""}` : ""}</option>)}
            </select>
          )}
        </label>
        <div>
          <span className="text-xs font-semibold text-navy/60 mb-1.5 block">Lessons for</span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Grade">
            {[{ id: "", name: "All" }, ...WORLD_GRADES].map((g) => (
              <button key={g.id || "all"} type="button" onClick={() => setGrade(g.id)} aria-pressed={grade === g.id}
                className={`h-10 px-4 rounded-xl text-sm font-semibold transition ${grade === g.id ? "bg-royal text-white" : "bg-white/60 text-navy/70 hover:bg-white"}`}>
                {g.name}{g.tag ? <span className="font-normal opacity-70"> · {g.tag}</span> : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {lessons.map((l) => {
          const g = WORLD_GRADES.find((x) => x.id === l.grade);
          return (
            <div key={l.id} className="glass rounded-xl2 shadow-glass p-4 flex items-center gap-3">
              <span className="grid place-items-center h-12 w-12 rounded-xl text-2xl shrink-0" style={{ background: `${g?.color || "#1651A3"}22` }} aria-hidden="true">{l.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy truncate">{l.title}</p>
                <Badge>{g?.name || l.grade}</Badge>
              </div>
              <Button size="sm" onClick={() => play(l)} disabled={!student || !WORLDS_URL || busy === l.id} aria-label={`Play ${l.title}${student ? ` for ${student.name}` : ""}`}>
                {busy === l.id ? <Spinner /> : <><Play size={15} /> Play</>}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg text-navy flex items-center gap-2"><Award size={18} /> Recent lesson results</h2>
        <Button variant="ghost" size="sm" onClick={loadRecent}>Refresh</Button>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-navy/55">No finished lessons yet. When a student completes a lesson, it appears here.</p>
      ) : (
        <div className="glass rounded-xl2 divide-y divide-navy/8">
          {recent.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3">
              <Avatar name={r.studentName} size={32} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-navy truncate">{r.studentName || "—"} · {r.title}</p>
                <p className="text-xs text-navy/55">{r.notes || "Finished"} · {r.date ? new Date(r.date).toLocaleString() : ""}</p>
              </div>
              <a href="/development/portfolio" className="text-royal text-xs font-semibold inline-flex items-center gap-1">Portfolio <ExternalLink size={12} /></a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
