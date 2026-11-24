import { useEffect } from "react";
// Lightweight per-page SEO: title + meta description + OG tags.
export function useSeo({ title, description, path = "" }) {
  useEffect(() => {
    if (title) document.title = title;
    const set = (sel, attr, val) => { let el = document.head.querySelector(sel); if (!el) { el = document.createElement("meta"); const [k, v] = sel.replace(/meta\[|\]/g, "").split("="); el.setAttribute(k, v.replace(/["']/g, "")); document.head.appendChild(el); } el.setAttribute(attr, val); };
    if (description) set('meta[name="description"]', "content", description);
    set('meta[property="og:title"]', "content", title || "KidoMatic");
    set('meta[property="og:description"]', "content", description || "");
    set('meta[property="og:type"]', "content", "website");
    let link = document.head.querySelector('link[rel="canonical"]'); if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = "https://juniorocto.com" + path;
  }, [title, description, path]);
}
