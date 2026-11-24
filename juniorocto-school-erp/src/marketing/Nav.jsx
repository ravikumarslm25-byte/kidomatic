import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowRight, Menu, User, X } from "lucide-react";
import landscape from "./assets/logo-landscape.png";

const LINKS = [["/worlds", "Worlds"], ["/erp", "ERP"], ["/partners", "Partners"], ["/pricing", "Pricing"], ["/blog", "Blog"], ["/about", "Company"]];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header id="nav" className="fixed inset-x-0 top-0 z-50 bg-white transition-all">
      <nav className="jo-shell flex h-[70px] items-center justify-between gap-6 lg:h-[84px]" aria-label="Main">
        <Link to="/" className="jo-focus shrink-0 rounded-xl" aria-label="KidoMatic home">
          <img src={landscape} alt="KidoMatic" className="-my-2 h-[58px] w-auto lg:h-[68px]" />
        </Link>
        <div className="hidden items-center gap-6 lg:flex xl:gap-9 2xl:gap-12">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `jo-navlink ${isActive ? "is-active" : ""}`}>{label}</NavLink>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/app/login" className="jo-navbtn jo-navbtn-login">Login <User size={18} strokeWidth={2.4} /></Link>
          <Link to="/get-started" className="jo-navbtn jo-navbtn-start">Get Started <ArrowRight size={19} strokeWidth={2.6} /></Link>
        </div>
        <button
          className="jo-focus grid h-11 w-11 place-items-center rounded-xl text-ink transition hover:bg-foam lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="space-y-1 border-t border-ink/10 bg-white px-5 pb-5 pt-3 shadow-lg lg:hidden">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={close} className={({ isActive }) => `block rounded-xl px-3 py-2.5 font-semibold transition hover:bg-foam ${isActive ? "text-[#1A66D9]" : "text-[#0E2747]"}`}>{label}</NavLink>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <Link to="/app/login" onClick={close} className="jo-navbtn jo-navbtn-login justify-center">Login <User size={18} /></Link>
            <Link to="/get-started" onClick={close} className="jo-navbtn jo-navbtn-start justify-center">Get Started <ArrowRight size={18} /></Link>
          </div>
        </div>
      )}
    </header>
  );
}
