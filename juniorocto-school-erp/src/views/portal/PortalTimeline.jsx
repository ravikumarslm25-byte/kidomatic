import { useState, useEffect, useMemo } from "react";
import { optionId, optionLabel } from "@/lib/poll";
import { Sparkles, Heart, MessageCircle, Play, X, BarChart3, Send } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Avatar from "@/components/ui/Avatar";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";

const likeSvc = resourceService("postLikes"), cmtSvc = resourceService("postComments"), voteSvc = resourceService("pollVotes");
const truthy = (v) => v === true || v === "true";
const isVideo = (m) => m.type === "video" || /\.(mp4|mov|webm|m4v)$/i.test(m.name || m.url || "");
const ago = (d) => { if (!d) return ""; const s = (Date.now() - new Date(d)) / 1000; if (s < 3600) return `${Math.floor(s / 60)}m`; if (s < 86400) return `${Math.floor(s / 3600)}h`; return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }); };

export default function PortalTimeline() {
  const { user } = useAuth(); const toast = useToast();
  const [posts, setPosts] = useState([]); const [votes, setVotes] = useState([]); const [likes, setLikes] = useState([]); const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true); const [lightbox, setLightbox] = useState(null);
  const load = () => Promise.all(["posts", "pollVotes", "postLikes", "postComments"].map((r) => resourceService(r).list({}).catch(() => [])))
    .then(([p, v, l, c]) => { setPosts(normList(p)); setVotes(normList(v)); setLikes(normList(l)); setComments(normList(c)); }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const feed = useMemo(() => posts.filter((p) => p.status !== "Draft").sort((a, b) => (truthy(b.pinned) - truthy(a.pinned)) || (b.publishedAt || b.createdAt || "").localeCompare(a.publishedAt || a.createdAt || "")), [posts]);

  if (loading) return <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div>;
  return (
    <div>
      <PageHeader title="Timeline" icon={Sparkles} subtitle="Moments & updates from your school" />
      <div className="max-w-2xl mx-auto space-y-4">
        {feed.map((p) => <Post key={p.id} p={p} user={user} likes={likes} comments={comments} votes={votes} onChange={load} onLightbox={setLightbox} toast={toast} />)}
        {feed.length === 0 && <Card className="py-14 text-center text-navy/40">No posts yet.</Card>}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/85 grid place-items-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/80"><X size={28} /></button>
          <div onClick={(e) => e.stopPropagation()}>{isVideo(lightbox) ? <video src={lightbox.url || lightbox.publicUrl} controls autoPlay className="max-w-full max-h-[85vh] rounded-xl" /> : <img src={lightbox.url || lightbox.publicUrl} className="max-w-full max-h-[85vh] rounded-xl object-contain" />}</div>
        </div>
      )}
    </div>
  );
}

function Post({ p, user, likes, comments, votes, onChange, onLightbox, toast }) {
  const [openC, setOpenC] = useState(false); const [text, setText] = useState("");
  const media = p.media || [];
  const myLike = likes.find((l) => l.postId === p.id && l.userId === user?.id);
  const likeN = likes.filter((l) => l.postId === p.id).length;
  const cmts = comments.filter((c) => c.postId === p.id).sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
  const pv = votes.filter((v) => v.postId === p.id); const total = pv.length; const myVote = pv.find((v) => v.userId === user?.id);

  const like = async () => { try { if (myLike) await likeSvc.remove(myLike.id); else await likeSvc.create({ postId: p.id, userId: user?.id, userName: user?.name }); onChange(); } catch (e) { toast.error(e.message); } };
  const comment = async () => { if (!text.trim()) return; try { await cmtSvc.create({ postId: p.id, userId: user?.id, userName: user?.name, userRole: user?.role, text: text.trim(), flagged: false, createdAt: new Date().toISOString() }); setText(""); onChange(); } catch (e) { toast.error(e.message); } };
  const vote = async (i) => { const oid = optionId((p.pollOptions || [])[i], i); try { if (myVote && myVote.optionId === oid) await voteSvc.remove(myVote.id); else { if (myVote) await voteSvc.remove(myVote.id); await voteSvc.create({ postId: p.id, optionId: oid, userId: user?.id }); } onChange(); } catch (e) { toast.error(e.message); } };
  const voted = !!myVote;

  return (
    <Card pad={false} className="overflow-hidden">
      <div className="p-4 flex items-center gap-3"><Avatar name={p.authorName} size={38} /><div className="flex-1"><p className="font-semibold text-navy text-sm">{p.authorName}</p><p className="text-[11px] text-navy/45">{p.authorRole} · {ago(p.publishedAt || p.createdAt)}</p></div></div>
      {p.text && <p className="px-4 pb-3 text-sm text-navy/80 whitespace-pre-wrap">{p.text}</p>}
      {p.kind === "poll" ? (
        <div className="px-4 pb-3 space-y-2">
          {(p.pollOptions || []).map((o, i) => { const oid = optionId(o, i); const c = pv.filter((v) => v.optionId === oid).length; const pct = total ? Math.round((c / total) * 100) : 0; const mine = myVote?.optionId === oid; return (
            <button key={i} onClick={() => vote(i)} className="w-full text-left relative overflow-hidden rounded-xl border border-navy/12 px-3 py-2"><div className="absolute inset-0 bg-royal/10" style={{ width: voted ? `${pct}%` : "0%" }} /><div className="relative flex justify-between text-sm"><span className={mine ? "font-semibold text-royal" : "text-navy/75"}>{mine ? "✓ " : ""}{optionLabel(o)}</span>{voted && <span className="text-navy/50 text-xs">{pct}%</span>}</div></button>
          ); })}
          <p className="text-[11px] text-navy/45 flex items-center gap-1"><BarChart3 size={12} /> {total} vote{total !== 1 ? "s" : ""} · tap to {voted ? "change" : "vote"}</p>
        </div>
      ) : media.length > 0 && (
        <div className={`grid ${media.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-0.5 bg-navy/5`}>
          {media.slice(0, 4).map((m, i) => (
            <button key={i} onClick={() => onLightbox(m)} className={`relative overflow-hidden bg-navy/5 ${media.length === 3 && i === 0 ? "col-span-2" : ""}`} style={{ aspectRatio: media.length === 1 ? "16/10" : "1/1" }}>
              {isVideo(m) ? <><video src={m.url || m.publicUrl} className="w-full h-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-black/25"><Play size={30} className="text-white" fill="white" /></span></> : <img src={m.url || m.publicUrl} alt="" className="w-full h-full object-cover" />}
              {i === 3 && media.length > 4 && <span className="absolute inset-0 grid place-items-center bg-black/50 text-white font-display text-xl">+{media.length - 4}</span>}
            </button>
          ))}
        </div>
      )}
      <div className="px-4 py-2.5 flex items-center gap-5 border-t border-navy/6 text-sm">
        <button onClick={like} className={`flex items-center gap-1.5 ${myLike ? "text-coral-500" : "text-navy/55 hover:text-coral-500"}`}><Heart size={18} fill={myLike ? "currentColor" : "none"} /> {likeN || ""}</button>
        <button onClick={() => setOpenC((o) => !o)} className="flex items-center gap-1.5 text-navy/55 hover:text-royal"><MessageCircle size={18} /> {cmts.length || ""}</button>
      </div>
      {openC && (
        <div className="px-4 pb-4 border-t border-navy/6 pt-3 space-y-3">
          {cmts.map((c) => (
            <div key={c.id} className="flex gap-2.5"><Avatar name={c.userName} size={28} /><div className="flex-1"><div className="rounded-2xl bg-navy/5 px-3 py-1.5"><p className="text-xs font-semibold text-navy">{c.userName} <span className="font-normal text-navy/40">· {ago(c.createdAt)}</span></p><p className={`text-sm ${truthy(c.flagged) ? "text-navy/30 italic" : "text-navy/75"}`}>{truthy(c.flagged) ? "flagged — hidden" : c.text}</p></div></div></div>
          ))}
          {truthy(p.allowComments) !== false && <div className="flex gap-2 items-center"><Avatar name={user?.name} size={28} /><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && comment()} placeholder="Write a comment…" className="flex-1 h-9 rounded-full bg-white/70 border border-navy/12 px-3.5 text-sm outline-none" /><button onClick={comment} className="text-royal"><Send size={18} /></button></div>}
        </div>
      )}
    </Card>
  );
}
