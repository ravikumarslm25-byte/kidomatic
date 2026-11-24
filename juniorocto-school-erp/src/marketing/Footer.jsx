import { Link } from "react-router-dom";
import Octo from "./Octo";
const COLS = [
  ["Products", [["KidoMatic Worlds", "/worlds"], ["School ERP", "/erp"], ["Partners", "/partners"], ["Pricing", "/pricing"]]],
  ["Company", [["About", "/about"], ["Blog", "/blog"], ["Contact", "/contact"], ["Get Started", "/get-started"]]],
  ["Legal", [["Terms", "/terms"], ["Privacy", "/privacy"], ["Refund", "/refund"], ["Shipping", "/shipping"]]],
  ["Login", [["School", "/app/login"], ["Admin & Partner", "/app/login"], ["Parent / Student", "/app/login"]]],
];
export default function Footer() {
  return (
    <footer className="grad-reef text-white/80 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3"><span className="inline-grid place-items-center bg-white rounded-xl p-1"><Octo size={30} /></span><span className="font-display text-lg text-white">Junior<span className="text-sun">Octo</span></span></div>
            <p className="text-sm text-white/60">Immersive 3D learning worlds + a complete school ERP. Ad-free, kid-safe, made in India 🇮🇳</p>
          </div>
          {COLS.map(([title, links]) => (
            <div key={title}><p className="font-display text-white mb-3">{title}</p><ul className="space-y-2 text-sm">{links.map(([l, to]) => <li key={l}><Link to={to} className="text-white/60 hover:text-white">{l}</Link></li>)}</ul></div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 text-xs text-white/50">
          <p>© <span id="yr">2026</span> HackGeniX Tech Private Limited · CIN U62013TZ2025PTC035022 · GSTIN 33AAICH0065K1ZO</p>
          <p>Salem · Chennai · Tamil Nadu</p>
        </div>
      </div>
    </footer>
  );
}
