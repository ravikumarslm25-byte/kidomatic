import { Link } from "react-router-dom";
export const Eyebrow = ({ children }) => <p className="eyebrow text-coral mb-3">{children}</p>;
export const H2 = ({ children, dark }) => <h2 className={`font-display text-3xl sm:text-4xl leading-tight ${dark ? "text-white" : "text-ink"}`}>{children}</h2>;
export const Lead = ({ children, dark }) => <p className={`mt-4 text-lg ${dark ? "text-white/70" : "text-ink/65"}`}>{children}</p>;
export const CTA = ({ to = "/get-started", children = "Get Started", variant = "btn-coral" }) => <Link to={to} className={`mbtn ${variant} px-6 py-3`}>{children}</Link>;
export function BrowserFrame({ src, alt }) {
  return (
    <div className="mcard overflow-hidden">
      <div className="h-9 bg-ink/5 flex items-center gap-1.5 px-4 border-b border-ink/8"><span className="h-2.5 w-2.5 rounded-full bg-coral/60" /><span className="h-2.5 w-2.5 rounded-full bg-sun/70" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" /></div>
      <img src={src} alt={alt} loading="lazy" className="w-full block" />
    </div>
  );
}
export const Section = ({ id, className = "", children }) => <section id={id} className={`py-20 ${className}`}><div className="max-w-7xl mx-auto px-5">{children}</div></section>;
