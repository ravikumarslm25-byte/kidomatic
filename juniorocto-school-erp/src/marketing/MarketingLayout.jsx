import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import "./marketing.css";

export default function MarketingLayout() {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => {
    const nav = document.getElementById("nav");
    const onScroll = () => nav && nav.classList.toggle("mkt-nav-shrink", window.scrollY > 20);
    onScroll(); addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".mkt .reveal").forEach((el) => io.observe(el));
    return () => { removeEventListener("scroll", onScroll); io.disconnect(); };
  }, [loc.pathname]);
  return (
    <div className="mkt bg-white">
      <Nav />
      <main className="pt-[70px] lg:pt-[84px]"><Outlet /></main>
      <Footer />
    </div>
  );
}
