import { Link, useParams } from "react-router-dom";
import { Eyebrow, H2, Lead, Section } from "./ui";
import { useSeo } from "../useSeo";

// Cover art is a branded gradient + emoji motif (no external images → fast + no licensing).
const POSTS = [
  { slug: "why-play-based-learning-works", cat: "Learning", emoji: "🎈", grad: "linear-gradient(135deg,#1651A3,#3FB6C9)",
    title: "Why play-based learning works for ages 3–6", read: "5 min",
    excerpt: "The science is clear: young children learn fastest when they play. Here's how play-based, screen-smart learning builds real skills.",
    body: ["For children between three and six, play isn't a break from learning — it is the learning. Neuroscience shows that young brains build language, numeracy and motor skills through exploration, repetition and joy, not through worksheets.", "KidoMatic Worlds is designed around this. Each world — Farm, Ocean, Town and more — turns a concept into a place a child can explore. Counting sea creatures teaches numbers. Sorting farm animals teaches categories. Every lesson is two to four minutes, matched to a tiny attention span.", "The result is learning that sticks, because it never felt like a lesson. For schools, that progress flows straight into the ERP, so teachers can see exactly where each child is thriving."] },
  { slug: "choosing-a-preschool-erp-2026", cat: "ERP", emoji: "🏫", grad: "linear-gradient(135deg,#14335E,#1651A3)",
    title: "How to choose a preschool ERP in 2026", read: "6 min",
    excerpt: "Admissions, fees, attendance, a parent app — the checklist every preschool should use before buying school-management software.",
    body: ["Choosing an ERP for a preschool is different from a large K-12 school. You need admissions and fees, yes — but also a parent app parents will actually open, gentle communication, and pricing that fits a smaller school.", "Start with the basics: does it cover admissions, fees with GST invoicing, attendance and staff in one place? Then look at the parent experience, because that's what families feel every day. Finally, check the pricing model — seat-based pricing means you only pay for who you use it for.", "KidoMatic's ERP was built preschool-first, then scaled to K-12 — so it stays simple where it should, and powerful where you need it."] },
  { slug: "screen-time-that-teaches", cat: "Parents", emoji: "📱", grad: "linear-gradient(135deg,#3FB6C9,#8FBF5B)",
    title: "Screen time that actually teaches", read: "4 min",
    excerpt: "Not all screen time is equal. What to look for in a kid-safe learning app — and the red flags to avoid.",
    body: ["Parents are right to be cautious about screens. But the difference between passive scrolling and active, guided learning is enormous. The question isn't 'how much screen time' — it's 'what kind'.", "Look for short, goal-based sessions; no ads; no open chat; and clear learning outcomes. Avoid anything that maximises time-on-app or sells data. KidoMatic is ad-free, has no stranger chat, and sessions are deliberately short — designed to teach, then stop."] },
  { slug: "fee-collection-without-chaos", cat: "ERP", emoji: "💳", grad: "linear-gradient(135deg,#E85410,#FFC24B)",
    title: "Fee collection without the month-end chaos", read: "5 min",
    excerpt: "Online payments, automatic receipts, clear dues — how modern schools collect fees without the follow-up headache.",
    body: ["Fee season shouldn't mean a stack of receipts and a hundred WhatsApp reminders. With online payments through Razorpay, parents pay from the app, receipts are automatic, and dues are always up to date.", "KidoMatic tracks every payment, generates GST invoices, and shows admins exactly what's collected and what's outstanding — with gentle, automated reminders so staff don't have to chase."] },
  { slug: "white-label-edtech-partner-playbook", cat: "Partners", emoji: "🤝", grad: "linear-gradient(135deg,#1651A3,#E85410)",
    title: "White-label EdTech: a partner's playbook", read: "7 min",
    excerpt: "How resellers and edupreneurs build a recurring-revenue business bringing a ready-made platform to local schools.",
    body: ["You don't need to build software to sell software. With a white-label platform, partners bring a proven product to schools under their own brand — logo, colours, domain — and earn recurring commission on every seat.", "The KidoMatic Partners programme handles the product, hosting and updates. You handle the relationships you already have. It's the fastest way to build a recurring EdTech business without an engineering team."] },
  { slug: "attendance-parents-can-see", cat: "ERP", emoji: "✅", grad: "linear-gradient(135deg,#8FBF5B,#3FB6C9)",
    title: "Attendance parents can actually see", read: "4 min",
    excerpt: "Real-time attendance builds trust with families — and catches early-warning signs before they become problems.",
    body: ["When a parent can open an app and see their child checked in safely, trust goes up. Real-time attendance isn't just admin — it's reassurance.", "KidoMatic marks attendance in seconds, notifies parents, and feeds the data into AI insights that flag dips early — so schools can act before a pattern becomes a problem."] },
];

export function BlogPost() {
  const { slug } = useParams();
  const post = POSTS.find((p) => p.slug === slug) || POSTS[0];
  useSeo({ title: `${post.title} — KidoMatic Blog`, description: post.excerpt, path: `/blog/${post.slug}` });
  return (
    <article>
      <div className="h-56 sm:h-72 flex items-center justify-center text-6xl" style={{ background: post.grad }}>{post.emoji}</div>
      <Section className="bg-white">
        <div className="max-w-2xl mx-auto reveal">
          <Link to="/blog" className="text-royal text-sm font-semibold">← All articles</Link>
          <span className="chip bg-foam text-royal mt-4 ml-2">{post.cat} · {post.read}</span>
          <h1 className="font-display text-3xl sm:text-4xl text-ink mt-4 leading-tight">{post.title}</h1>
          <div className="mt-6 space-y-4">{post.body.map((p, i) => <p key={i} className="text-ink/75 leading-relaxed text-[17px]">{p}</p>)}</div>
          <div className="mt-10 rounded-2xl grad-foam p-6 text-center"><p className="font-display text-xl text-ink">See KidoMatic for your school</p><Link to="/get-started" className="mbtn btn-coral px-6 py-3 mt-3 inline-flex">Get Started</Link></div>
          <div className="mt-10"><p className="eyebrow text-coral mb-3">Keep reading</p><div className="grid sm:grid-cols-2 gap-4">{POSTS.filter((p) => p.slug !== post.slug).slice(0, 2).map((p) => <Link key={p.slug} to={`/blog/${p.slug}`} className="mcard p-4 hover:-translate-y-0.5 transition"><span className="text-2xl">{p.emoji}</span><p className="font-display text-ink mt-1 text-sm leading-snug">{p.title}</p></Link>)}</div></div>
        </div>
      </Section>
    </article>
  );
}

export default function Blog() {
  useSeo({ title: "KidoMatic Blog — Early Learning & School Management Ideas", description: "Practical ideas on play-based learning, choosing a preschool ERP, fee collection, kid-safe screen time and building a white-label EdTech business.", path: "/blog" });
  return (
    <Section className="grad-foam min-h-[70vh]">
      <div className="text-center reveal"><Eyebrow>Blog</Eyebrow><H2>Ideas for little learners & busy schools</H2><Lead>Practical, no-fluff articles on early learning and running a modern school.</Lead></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {POSTS.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="mcard overflow-hidden reveal hover:-translate-y-1 transition block">
            <div className="h-40 flex items-center justify-center text-5xl" style={{ background: p.grad }}>{p.emoji}</div>
            <div className="p-5"><span className="chip bg-foam text-royal mb-2">{p.cat} · {p.read}</span><h3 className="font-display text-lg text-ink leading-snug">{p.title}</h3><p className="mt-2 text-sm text-ink/60 line-clamp-2">{p.excerpt}</p><p className="mt-3 text-royal text-sm font-semibold">Read article →</p></div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
