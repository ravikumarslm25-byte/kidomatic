import { useState, useEffect, useMemo } from "react";
import { optionId, optionLabel } from "@/lib/poll";
import { Images, LayoutList, Plus, Heart, MessageCircle, Share2, MoreHorizontal, Flag, Trash2, Pin, BarChart3, Image as ImageIcon, Video, X, Send, ShieldAlert, Play } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import Avatar from "@/components/ui/Avatar";
import FileUpload from "@/components/ui/FileUpload";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";
import { useToast } from "@/store/toast";
import { useAuth } from "@/store/auth";

const postSvc = resourceService("posts");
const likeSvc = resourceService("postLikes");
const cmtSvc = resourceService("postComments");
const voteSvc = resourceService("pollVotes");
const repSvc = resourceService("postReports");
const AUDIENCE = ["Everyone", "Students & Parents", "Staff only"];
const truthy = (v) => v === true || v === "true" || v === 1;
const isVideo = (m) => (m.type === "video") || /\.(mp4|mov|webm|m4v|avi)$/i.test(m.name || m.url || "");
const timeAgo = (d) => { if (!d) return ""; const s = (Date.now() - new Date(d)) / 1000; if (s < 60) return "just now"; if (s < 3600) return `${Math.floor(s / 60)}m`; if (s < 86400) return `${Math.floor(s / 3600)}h`; if (s < 604800) return `${Math.floor(s / 86400)}d`; return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }); };

export default function Gallery() {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = /admin|principal|super/i.test(user?.role || "");
  const [tab, setTab] = useState("timeline");
  const [posts, setPosts] = useState([]); const [likes, setLikes] = useState([]); const [comments, setComments] = useState([]); const [votes, setVotes] = useState([]); const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compose, setCompose] = useState(null); const [lightbox, setLightbox] = useState(null); const [showReports, setShowReports] = useState(false);

  const load = async () => {
    setLoading(true);
    const [p, l, c, v, r] = await Promise.all([postSvc.list({}), likeSvc.list({}), cmtSvc.list({}), voteSvc.list({}), repSvc.list({})]);
    setPosts(normList(p)); setLikes(normList(l)); setComments(normList(c)); setVotes(normList(v)); setReports(normList(r)); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const feed = useMemo(() => posts.filter((p) => p.status !== "Draft").sort((a, b) => (truthy(b.pinned) - truthy(a.pinned)) || (b.publishedAt || b.createdAt || "").localeCompare(a.publishedAt || a.createdAt || "")), [posts]);
  const openReports = reports.filter((r) => r.status === "Open");
  const allMedia = useMemo(() => feed.flatMap((p) => (p.media || []).map((m) => ({ ...m, post: p }))), [feed]);

  return (
    <div>
      <PageHeader title="Media & Timeline" icon={Images} subtitle="Share moments, run polls, celebrate wins — your school's social wall"
        actions={<div className="flex gap-2">{isAdmin && openReports.length > 0 && <Button variant="outline" onClick={() => setShowReports(true)}><ShieldAlert size={15} className="text-coral-500" /> {openReports.length}</Button>}<Button onClick={() => setCompose({ kind: "post", text: "", media: [], audience: "Everyone", allowComments: true, pinned: false, pollOptions: ["", ""], pollMultiple: false })}><Plus size={16} /> New post</Button></div>} />

      <div className="flex gap-1 mb-5">
        {[["timeline", "Timeline", LayoutList], ["gallery", "Gallery", Images]].map(([k, label, Icon]) => <button key={k} onClick={() => setTab(k)} className={`px-4 h-10 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={15} /> {label}</button>)}
      </div>

      {loading ? <div className="glass rounded-xl2 shadow-glass grid place-items-center py-24"><Spinner size={26} /></div> : tab === "timeline" ? (
        <div className="max-w-2xl mx-auto space-y-4">
          {feed.map((p) => <PostCard key={p.id} post={p} user={user} isAdmin={isAdmin} likes={likes} comments={comments} votes={votes} reports={reports} onChange={load} onLightbox={setLightbox} toast={toast} />)}
          {feed.length === 0 && <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/40">No posts yet. Share the first moment!</div>}
        </div>
      ) : (
        <GalleryGrid media={allMedia} onOpen={setLightbox} />
      )}

      {compose && <Composer draft={compose} setDraft={setCompose} user={user} onDone={load} toast={toast} />}
      {lightbox && <Lightbox media={lightbox} onClose={() => setLightbox(null)} />}
      {showReports && <ReportsModal reports={reports} posts={posts} comments={comments} onClose={() => setShowReports(false)} onChange={load} />}
    </div>
  );
}

function PostCard({ post, user, isAdmin, likes, comments, votes, reports, onChange, onLightbox, toast }) {
  const [openC, setOpenC] = useState(false); const [menu, setMenu] = useState(false); const [text, setText] = useState("");
  const myLike = likes.find((l) => l.postId === post.id && l.userId === user?.id);
  const likeCount = likes.filter((l) => l.postId === post.id).length;
  const cmts = comments.filter((c) => c.postId === post.id).sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
  const postReports = reports.filter((r) => r.postId === post.id && r.status === "Open").length;

  const toggleLike = async () => { try { if (myLike) await likeSvc.remove(myLike.id); else await likeSvc.create({ postId: post.id, userId: user?.id, userName: user?.name }); onChange(); } catch (e) { toast.error(e.message); } };
  const share = async () => { try { await postSvc.update(post.id, { shareCount: (+post.shareCount || 0) + 1 }); try { await navigator.clipboard.writeText(`${window.location.origin}/media#post-${post.id}`); } catch {} toast.success("Link copied to share"); onChange(); } catch (e) { toast.error(e.message); } };
  const addComment = async () => { if (!text.trim()) return; try { await cmtSvc.create({ postId: post.id, userId: user?.id, userName: user?.name, userRole: user?.role, text: text.trim(), flagged: false, createdAt: new Date().toISOString() }); setText(""); onChange(); } catch (e) { toast.error(e.message); } };
  const report = async () => { try { await repSvc.create({ targetType: "post", targetId: post.id, postId: post.id, reason: "Reported by user", reportedBy: user?.name, status: "Open", createdAt: new Date().toISOString() }); setMenu(false); toast.success("Reported to admin for review"); onChange(); } catch (e) { toast.error(e.message); } };
  const flagComment = async (c) => { try { await cmtSvc.update(c.id, { flagged: true }); await repSvc.create({ targetType: "comment", targetId: c.id, postId: post.id, reason: "Flagged comment", reportedBy: user?.name, status: "Open", createdAt: new Date().toISOString() }); toast.success("Comment flagged"); onChange(); } catch (e) { toast.error(e.message); } };
  const delPost = async () => { await postSvc.remove(post.id); setMenu(false); onChange(); };
  const pin = async () => { await postSvc.update(post.id, { pinned: !truthy(post.pinned) }); setMenu(false); onChange(); };
  const delComment = async (c) => { await cmtSvc.remove(c.id); onChange(); };

  const media = post.media || [];
  return (
    <div className="glass rounded-xl2 shadow-glass overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <Avatar name={post.authorName} size={40} />
        <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm flex items-center gap-1.5">{post.authorName}{truthy(post.pinned) && <Pin size={12} className="text-royal" />}</p><p className="text-[11px] text-navy/45">{post.authorRole} · {timeAgo(post.publishedAt || post.createdAt)} · {post.audience}</p></div>
        <div className="relative">
          <button onClick={() => setMenu((m) => !m)} className="text-navy/40 hover:text-navy p-1"><MoreHorizontal size={18} /></button>
          {menu && <div className="absolute right-0 top-8 z-10 w-40 glass rounded-xl shadow-glass py-1 text-sm">
            <button onClick={report} className="w-full text-left px-3 py-2 hover:bg-white/50 flex items-center gap-2 text-navy/70"><Flag size={14} /> Report</button>
            {isAdmin && <button onClick={pin} className="w-full text-left px-3 py-2 hover:bg-white/50 flex items-center gap-2 text-navy/70"><Pin size={14} /> {truthy(post.pinned) ? "Unpin" : "Pin"}</button>}
            {isAdmin && <button onClick={delPost} className="w-full text-left px-3 py-2 hover:bg-white/50 flex items-center gap-2 text-coral-600"><Trash2 size={14} /> Delete</button>}
          </div>}
        </div>
      </div>

      {post.text && <p className="px-4 pb-3 text-sm text-navy/80 whitespace-pre-wrap">{post.text}</p>}
      {isAdmin && postReports > 0 && <div className="mx-4 mb-2 text-[11px] text-coral-600 bg-coral-50 rounded px-2 py-1 flex items-center gap-1"><ShieldAlert size={12} /> {postReports} open report(s)</div>}

      {post.kind === "poll" ? <Poll post={post} votes={votes} user={user} onChange={onChange} toast={toast} />
        : media.length > 0 && <MediaGrid media={media} onOpen={onLightbox} />}

      <div className="px-4 py-2.5 flex items-center gap-5 border-t border-navy/6 text-sm">
        <button onClick={toggleLike} className={`flex items-center gap-1.5 ${myLike ? "text-coral-500" : "text-navy/55 hover:text-coral-500"}`}><Heart size={18} fill={myLike ? "currentColor" : "none"} /> {likeCount || ""}</button>
        <button onClick={() => setOpenC((o) => !o)} className="flex items-center gap-1.5 text-navy/55 hover:text-royal"><MessageCircle size={18} /> {cmts.length || ""}</button>
        <button onClick={share} className="flex items-center gap-1.5 text-navy/55 hover:text-royal"><Share2 size={18} /> {post.shareCount || ""}</button>
      </div>

      {openC && (
        <div className="px-4 pb-4 border-t border-navy/6 pt-3 space-y-3">
          {cmts.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar name={c.userName} size={28} />
              <div className="flex-1 min-w-0">
                <div className="rounded-2xl bg-navy/5 px-3 py-1.5"><p className="text-xs font-semibold text-navy">{c.userName} <span className="font-normal text-navy/40">· {timeAgo(c.createdAt)}</span></p><p className={`text-sm ${truthy(c.flagged) ? "text-navy/30 italic" : "text-navy/75"}`}>{truthy(c.flagged) ? "\u2691 flagged \u2014 hidden pending review" : c.text}</p></div>
                <div className="flex gap-3 mt-0.5 pl-2 text-[11px] text-navy/40">
                  {!truthy(c.flagged) && <button onClick={() => flagComment(c)} className="hover:text-coral-500 flex items-center gap-0.5"><Flag size={10} /> flag</button>}
                  {(isAdmin || c.userId === user?.id) && <button onClick={() => delComment(c)} className="hover:text-coral-500">delete</button>}
                </div>
              </div>
            </div>
          ))}
          {truthy(post.allowComments) !== false && <div className="flex gap-2 items-center">
            <Avatar name={user?.name} size={28} />
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()} placeholder="Write a comment\u2026" className="flex-1 h-9 rounded-full bg-white/70 border border-navy/12 px-3.5 text-sm outline-none" />
            <button onClick={addComment} className="text-royal"><Send size={18} /></button>
          </div>}
        </div>
      )}
    </div>
  );
}

function Poll({ post, votes, user, onChange, toast }) {
  const opts = post.pollOptions || [];
  const pv = votes.filter((v) => v.postId === post.id);
  const myVotes = pv.filter((v) => v.userId === user?.id).map((v) => v.optionId);
  const total = pv.length;
  const voted = myVotes.length > 0;
  const cast = async (i) => {
    const optId = optionId(opts[i], i);
    try {
      if (truthy(post.pollMultiple)) { const ex = pv.find((v) => v.userId === user?.id && v.optionId === optId); if (ex) await voteSvc.remove(ex.id); else await voteSvc.create({ postId: post.id, optionId: optId, userId: user?.id }); }
      else { const ex = pv.find((v) => v.userId === user?.id); if (ex && ex.optionId === optId) { await voteSvc.remove(ex.id); } else { if (ex) await voteSvc.remove(ex.id); await voteSvc.create({ postId: post.id, optionId: optId, userId: user?.id }); } }
      onChange();
    } catch (e) { toast.error(e.message); }
  };
  return (
    <div className="px-4 pb-3 space-y-2">
      {opts.map((o, i) => { const oid = optionId(o, i); const c = pv.filter((v) => v.optionId === oid).length; const pct = total ? Math.round((c / total) * 100) : 0; const mine = myVotes.includes(oid); return (
        <button key={i} onClick={() => cast(i)} className="w-full text-left relative overflow-hidden rounded-xl border border-navy/12 px-3 py-2">
          <div className="absolute inset-0 bg-royal/10 transition-all" style={{ width: voted ? `${pct}%` : "0%" }} />
          <div className="relative flex items-center justify-between text-sm"><span className={`${mine ? "font-semibold text-royal" : "text-navy/75"}`}>{mine ? "\u2713 " : ""}{optionLabel(o)}</span>{voted && <span className="text-navy/50 text-xs">{pct}% \u00b7 {c}</span>}</div>
        </button>
      ); })}
      <p className="text-[11px] text-navy/45">{total} vote{total !== 1 ? "s" : ""}{truthy(post.pollMultiple) ? " \u00b7 multiple choice" : ""} \u00b7 tap to {voted ? "change" : "vote"}</p>
    </div>
  );
}

function MediaGrid({ media, onOpen }) {
  const n = media.length;
  const cls = n === 1 ? "grid-cols-1" : "grid-cols-2";
  return (
    <div className={`grid ${cls} gap-0.5 bg-navy/5`}>
      {media.slice(0, 4).map((m, i) => (
        <button key={i} onClick={() => onOpen(m)} className={`relative overflow-hidden bg-navy/5 ${n === 3 && i === 0 ? "col-span-2" : ""}`} style={{ aspectRatio: n === 1 ? "16/10" : "1/1" }}>
          {isVideo(m) ? <><video src={m.url || m.publicUrl} className="w-full h-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-black/25"><Play size={32} className="text-white" fill="white" /></span></> : <img src={m.url || m.publicUrl} alt="" className="w-full h-full object-cover" />}
          {i === 3 && n > 4 && <span className="absolute inset-0 grid place-items-center bg-black/50 text-white font-display text-xl">+{n - 4}</span>}
        </button>
      ))}
    </div>
  );
}

function GalleryGrid({ media, onOpen }) {
  const [filter, setFilter] = useState("all");
  const shown = media.filter((m) => filter === "all" || (filter === "video" ? isVideo(m) : !isVideo(m)));
  return (
    <div>
      <div className="flex gap-2 mb-4">{[["all", "All"], ["image", "Photos"], ["video", "Videos"]].map(([k, l]) => <button key={k} onClick={() => setFilter(k)} className={`px-3 h-8 rounded-lg text-sm ${filter === k ? "bg-royal-100 text-royal font-semibold" : "bg-white/60 border border-navy/10 text-navy/60"}`}>{l}</button>)}</div>
      {shown.length === 0 ? <div className="glass rounded-xl2 shadow-glass py-16 text-center text-navy/40">No media yet.</div> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {shown.map((m, i) => (
            <button key={i} onClick={() => onOpen(m)} className="relative overflow-hidden rounded-xl bg-navy/5 aspect-square group">
              {isVideo(m) ? <><video src={m.url || m.publicUrl} className="w-full h-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-black/25"><Play size={28} className="text-white" fill="white" /></span></> : <img src={m.url || m.publicUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Lightbox({ media, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 grid place-items-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/80 hover:text-white"><X size={28} /></button>
      <div className="max-w-4xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        {isVideo(media) ? <video src={media.url || media.publicUrl} controls autoPlay className="max-w-full max-h-[85vh] rounded-xl" /> : <img src={media.url || media.publicUrl} alt="" className="max-w-full max-h-[85vh] rounded-xl object-contain" />}
      </div>
    </div>
  );
}

function Composer({ draft, setDraft, user, onDone, toast }) {
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const addMedia = (v) => set("media", [...(draft.media || []), { url: v.publicUrl || v.url, name: v.name, key: v.key, type: /\.(mp4|mov|webm|m4v)$/i.test(v.name || "") ? "video" : "image" }]);
  const setOpt = (i, v) => set("pollOptions", draft.pollOptions.map((o, idx) => (idx === i ? v : o)));
  const publish = async () => {
    if (draft.kind === "poll") { const opts = draft.pollOptions.filter((o) => o.trim()); if (!draft.text.trim() || opts.length < 2) { toast.error("Poll needs a question and 2+ options"); return; } }
    else if (!draft.text.trim() && (draft.media || []).length === 0) { toast.error("Add text or media"); return; }
    setSaving(true);
    try {
      await postSvc.create({ authorName: user?.name || "Admin", authorRole: user?.role || "Staff", kind: draft.kind, text: draft.text, media: draft.kind === "poll" ? [] : draft.media, audience: draft.audience, pinned: draft.pinned, allowComments: draft.allowComments, pollOptions: draft.kind === "poll" ? draft.pollOptions.filter((o) => o.trim()) : [], pollMultiple: draft.pollMultiple, status: "Published", shareCount: 0, createdBy: user?.id, createdAt: new Date().toISOString(), publishedAt: new Date().toISOString() });
      toast.success("Posted!"); setDraft(null); onDone();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  return (
    <Modal open onClose={() => setDraft(null)} title="Create post" size="lg" footer={<div className="flex justify-between w-full items-center"><label className="flex items-center gap-1.5 text-sm text-navy/60"><input type="checkbox" checked={draft.pinned} onChange={(e) => set("pinned", e.target.checked)} /> Pin</label><Button onClick={publish} disabled={saving}>{saving ? <Spinner size={14} /> : <Send size={15} />} Publish</Button></div>}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {[["post", "Post", ImageIcon], ["poll", "Poll", BarChart3]].map(([k, l, Icon]) => <button key={k} onClick={() => set("kind", k)} className={`px-3 h-9 rounded-lg text-sm font-medium flex items-center gap-1.5 ${draft.kind === k ? "btn-grad text-white" : "bg-white/60 border border-navy/10 text-navy/60"}`}><Icon size={14} /> {l}</button>)}
        </div>
        <div className="flex items-center gap-2"><Avatar name={user?.name} size={36} /><div><p className="text-sm font-semibold text-navy">{user?.name}</p><p className="text-[11px] text-navy/45">{user?.role}</p></div></div>
        <textarea value={draft.text} onChange={(e) => set("text", e.target.value)} rows={draft.kind === "poll" ? 2 : 4} placeholder={draft.kind === "poll" ? "Ask a question\u2026" : "Share something with your school\u2026"} className="w-full rounded-xl bg-white/70 border border-navy/12 px-3 py-2.5 text-sm outline-none" />

        {draft.kind === "poll" ? (
          <div className="space-y-2">
            {draft.pollOptions.map((o, i) => <div key={i} className="flex gap-2 items-center"><input value={o} onChange={(e) => setOpt(i, e.target.value)} placeholder={`Option ${i + 1}`} className="flex-1 h-10 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm outline-none" />{draft.pollOptions.length > 2 && <button onClick={() => set("pollOptions", draft.pollOptions.filter((_, idx) => idx !== i))} className="text-coral-500"><X size={16} /></button>}</div>)}
            <button onClick={() => set("pollOptions", [...draft.pollOptions, ""])} className="text-royal text-sm font-semibold flex items-center gap-1"><Plus size={14} /> Add option</button>
            <label className="flex items-center gap-1.5 text-sm text-navy/60 mt-1"><input type="checkbox" checked={draft.pollMultiple} onChange={(e) => set("pollMultiple", e.target.checked)} /> Allow multiple choices</label>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap gap-2 mb-2">{(draft.media || []).map((m, i) => <span key={i} className="text-xs px-2 py-1 rounded bg-navy/6 flex items-center gap-1">{m.type === "video" ? <Video size={11} /> : <ImageIcon size={11} />} {m.name || `file ${i + 1}`}<button onClick={() => set("media", draft.media.filter((_, idx) => idx !== i))}><X size={11} /></button></span>)}</div>
            <FileUpload value="" onChange={addMedia} folder="posts" />
          </div>
        )}

        <div className="flex items-center gap-3">
          <select value={draft.audience} onChange={(e) => set("audience", e.target.value)} className="h-9 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm">{AUDIENCE.map((a) => <option key={a}>{a}</option>)}</select>
          <label className="flex items-center gap-1.5 text-sm text-navy/60"><input type="checkbox" checked={draft.allowComments} onChange={(e) => set("allowComments", e.target.checked)} /> Comments</label>
        </div>
      </div>
    </Modal>
  );
}

function ReportsModal({ reports, posts, comments, onClose, onChange }) {
  const open = reports.filter((r) => r.status === "Open");
  const act = async (r, status) => { await repSvc.update(r.id, { status }); onChange(); };
  const label = (r) => r.targetType === "comment" ? (comments.find((c) => c.id === r.targetId)?.text || "comment") : (posts.find((p) => p.id === r.postId)?.text || "post");
  return (
    <Modal open onClose={onClose} title={`Moderation \u2014 ${open.length} open`} size="lg" footer={<ModalFooter onCancel={onClose} onSave={onClose} saveLabel="Done" />}>
      <div className="space-y-2">
        {open.map((r) => (
          <div key={r.id} className="rounded-xl border border-navy/10 bg-white/50 p-3 flex items-start gap-3">
            <ShieldAlert size={18} className="text-coral-500 mt-0.5" />
            <div className="flex-1 min-w-0"><p className="text-sm text-navy/80 truncate">\u201c{label(r)}\u201d</p><p className="text-[11px] text-navy/45">{r.targetType} \u00b7 {r.reason} \u00b7 by {r.reportedBy}</p></div>
            <div className="flex gap-1.5"><button onClick={() => act(r, "Dismissed")} className="text-xs px-2 py-1 rounded bg-navy/6 text-navy/60">Dismiss</button><button onClick={() => act(r, "Reviewed")} className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-600">Reviewed</button></div>
          </div>
        ))}
        {open.length === 0 && <p className="text-sm text-navy/40 py-6 text-center">Nothing to review.</p>}
      </div>
    </Modal>
  );
}
