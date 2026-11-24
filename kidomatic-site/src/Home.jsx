import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // inject octo mascot into slots
    const tmpl = document.getElementById("octo");
    if (tmpl) document.querySelectorAll(".octo-slot").forEach((s) => (s.innerHTML = tmpl.innerHTML));
    const yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();

    const nav = document.getElementById("nav");
    const onScroll = () => nav && nav.classList.toggle("nav-shrink", window.scrollY > 20);
    onScroll(); addEventListener("scroll", onScroll, { passive: true });

    const burger = document.getElementById("burger");
    const mm = document.getElementById("mobileMenu");
    if (burger && mm) { burger.onclick = () => mm.classList.toggle("hidden"); document.querySelectorAll("#mobileMenu a").forEach((a) => (a.onclick = () => mm.classList.add("hidden"))); }

    const lb = document.getElementById("loginBtn"), lmenu = document.getElementById("loginMenu");
    if (lb && lmenu) { lb.onclick = (e) => { e.stopPropagation(); lmenu.classList.toggle("hidden"); }; }
    const closeLogin = () => lmenu && lmenu.classList.add("hidden");
    document.addEventListener("click", closeLogin);

    const mBtn = document.getElementById("mBtn"), yBtn = document.getElementById("yBtn");
    const setPlan = (yearly) => {
      document.querySelectorAll(".price").forEach((p) => (p.textContent = yearly ? p.dataset.y : p.dataset.m));
      mBtn && mBtn.classList.toggle("bg-white", !yearly); mBtn && mBtn.classList.toggle("shadow-soft", !yearly);
      yBtn && yBtn.classList.toggle("bg-white", yearly); yBtn && yBtn.classList.toggle("shadow-soft", yearly);
    };
    if (mBtn && yBtn) { mBtn.onclick = () => setPlan(false); yBtn.onclick = () => setPlan(true); }

    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    return () => { removeEventListener("scroll", onScroll); document.removeEventListener("click", closeLogin); io.disconnect(); };
  }, []);

  return (
    <>



<template id="octo">
  <svg viewBox="0 0 200 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="ob" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A6ACF"/><stop offset="1" stopColor="#14335E"/></linearGradient>
    </defs>
    <g>
      
      <path d="M40 150c-18 6-26 26-14 40 8-16 20-18 30-14z" fill="#1651A3"/>
      <path d="M160 150c18 6 26 26 14 40-8-16-20-18-30-14z" fill="#1651A3"/>
      <path d="M64 165c-10 16-6 30 6 40 2-16 10-22 20-24z" fill="#2A6ACF"/>
      <path d="M136 165c10 16 6 30-6 40-2-16-10-22-20-24z" fill="#2A6ACF"/>
      <path d="M92 172c-4 18 0 28 8 34 8-6 12-16 8-34z" fill="#1651A3"/>
      
      <ellipse cx="100" cy="108" rx="66" ry="62" fill="url(#ob)"/>
      
      <circle cx="78" cy="104" r="17" fill="#fff"/><circle cx="122" cy="104" r="17" fill="#fff"/>
      <circle cx="82" cy="107" r="8.5" fill="#14335E"/><circle cx="118" cy="107" r="8.5" fill="#14335E"/>
      <circle cx="85" cy="104" r="2.6" fill="#fff"/><circle cx="121" cy="104" r="2.6" fill="#fff"/>
      
      <circle cx="62" cy="126" r="7" fill="#FF9E7A" opacity=".7"/><circle cx="138" cy="126" r="7" fill="#FF9E7A" opacity=".7"/>
      <path d="M86 134c8 8 20 8 28 0" stroke="#0D2545" strokeWidth="4" strokeLinecap="round"/>
      
      <path d="M100 44 46 66l54 22 54-22z" fill="#14335E"/>
      <rect x="86" y="80" width="28" height="14" rx="4" fill="#1651A3"/>
      <path d="M150 66v22" stroke="#FFC24B" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="150" cy="92" r="5" fill="#FFC24B"/>
    </g>
  </svg>
</template>


<header id="nav" className="fixed top-0 inset-x-0 z-50 transition-all">
  <nav className="max-w-7xl mx-auto px-5 h-[70px] flex items-center justify-between">
    <a href="#top" className="flex items-center gap-2.5">
      <img src="/kidomatic-logo.png" alt="KidoMatic" className="h-10 w-auto" />
    </a>
    <div className="hidden lg:flex items-center gap-8 text-[15px] font-semibold">
      <a href="#worlds" className="link-dim">Worlds</a>
      <a href="#erp" className="link-dim">ERP</a>
      <a href="#partners" className="link-dim">Partners</a>
      <a href="#pricing" className="link-dim">Pricing</a>
      <a href="#blog" className="link-dim">Blog</a>
      <a href="#about" className="link-dim">Company</a>
    </div>
    <div className="flex items-center gap-2.5">
      <div className="relative hidden sm:block" id="loginWrap">
        <button id="loginBtn" className="btn btn-ghost px-4 py-2 text-sm">Login
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div id="loginMenu" className="hidden absolute right-0 mt-2 w-60 card rounded-blob p-2 text-sm">
          <a href="https://school.kidomatic.app" className="block px-3 py-2 rounded-xl hover:bg-foam font-semibold">School Login</a>
          <a href="https://parent.kidomatic.app" className="block px-3 py-2 rounded-xl hover:bg-foam font-semibold">Parent / Student Login</a>
          <a href="https://app.kidomatic.app" className="block px-3 py-2 rounded-xl hover:bg-foam font-semibold">Admin &amp; Partner Login</a>
        </div>
      </div>
      <a href="#demo" className="btn btn-coral px-5 py-2.5 text-sm">Book a Demo</a>
      <button id="burger" className="lg:hidden w-10 h-10 grid place-items-center rounded-xl border border-ink/15" aria-label="Menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="#14335E" strokeWidth="2.2" strokeLinecap="round"/></svg>
      </button>
    </div>
  </nav>
  <div id="mobileMenu" className="hidden lg:hidden bg-white border-t border-ink/10 px-5 py-4 space-y-1 font-semibold">
    <a href="#worlds" className="block py-2 link-dim">Worlds</a>
    <a href="#erp" className="block py-2 link-dim">ERP</a>
    <a href="#partners" className="block py-2 link-dim">Partners</a>
    <a href="#pricing" className="block py-2 link-dim">Pricing</a>
    <a href="#blog" className="block py-2 link-dim">Blog</a>
    <a href="#about" className="block py-2 link-dim">Company</a>
    <div className="pt-2 grid grid-cols-2 gap-2 text-sm">
      <a href="https://school.kidomatic.app" className="btn btn-ghost justify-center py-2">School Login</a>
      <a href="https://parent.kidomatic.app" className="btn btn-ghost justify-center py-2">Parent Login</a>
    </div>
  </div>
</header>

<main id="top">


<section className="relative overflow-hidden grad-foam pt-32 pb-28">
  <div className="absolute inset-0 pointer-events-none">
    <div className="bubble w-4 h-4" style={{left: '12%', bottom: '10%', animationDuration: '9s'}}></div>
    <div className="bubble w-2.5 h-2.5" style={{left: '22%', bottom: '24%', animationDuration: '7s', animationDelay: '1s'}}></div>
    <div className="bubble w-6 h-6" style={{left: '82%', bottom: '8%', animationDuration: '11s', animationDelay: '.5s'}}></div>
    <div className="bubble w-3 h-3" style={{left: '70%', bottom: '30%', animationDuration: '8s', animationDelay: '2s'}}></div>
  </div>
  <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-14 items-center relative">
    <div className="reveal">
      <span className="chip bg-sun/25 text-ink"><span className="w-2 h-2 rounded-full bg-coral"></span> Learning + school management, in one universe</span>
      <h1 className="font-display text-[2.7rem] leading-[1.05] sm:text-6xl text-ink mt-5">Where little explorers <span className="text-royal">learn</span> — and schools <span className="text-coral">run</span> — better.</h1>
      <p className="mt-5 text-lg text-ink/70 max-w-xl">KidoMatic brings immersive 3D learning worlds for ages 3–6, a complete school ERP to run everything, and a partner programme to grow with us.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#demo" className="btn btn-coral px-7 py-3.5 text-base">Book a Demo</a>
        <a href="#worlds" className="btn btn-ghost px-7 py-3.5 text-base">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7z" fill="#E85410"/></svg> Explore the Worlds</a>
      </div>
      <p className="mt-5 text-sm font-semibold text-ink/55">No ads · Kid-safe · Works on any device · Made in India 🇮🇳</p>
    </div>

    
    <div className="relative reveal">
      <div className="floaty rounded-xl3 overflow-hidden shadow-lift border-4 border-white bg-ink">
        <svg viewBox="0 0 520 400" className="w-full block">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#BFE9F5"/><stop offset="1" stopColor="#E9F8FB"/></linearGradient>
            <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7CC96A"/><stop offset="1" stopColor="#5BB255"/></linearGradient>
          </defs>
          <rect width="520" height="400" fill="url(#sky)"/>
          <circle cx="430" cy="80" r="42" fill="#FFC24B"/>
          <circle cx="120" cy="70" r="26" fill="#fff" opacity=".9"/><circle cx="150" cy="70" r="32" fill="#fff" opacity=".9"/><circle cx="180" cy="72" r="24" fill="#fff" opacity=".9"/>
          <path d="M0 300 Q130 250 260 300 T520 300 V400 H0Z" fill="url(#hill)"/>
          <path d="M0 340 Q160 300 320 340 T520 340 V400 H0Z" fill="#4CA64C"/>
          
          <rect x="86" y="250" width="12" height="46" rx="4" fill="#8A5A34"/><circle cx="92" cy="242" r="26" fill="#4E9C46"/>
          
          <g><rect x="360" y="250" width="70" height="46" fill="#E4674A"/><path d="M360 250l35-24 35 24z" fill="#B94A32"/><rect x="386" y="268" width="18" height="28" fill="#F3D9B0"/></g>
          
          <g transform="translate(210 250) scale(.62)"><use href="#octoInner"/></g>
        </svg>
      </div>
      
      <div className="absolute -left-4 top-8 bg-white rounded-blob shadow-soft px-4 py-3 flex items-center gap-3 floaty" style={{animationDelay: '.8s'}}>
        <span className="w-10 h-10 grid place-items-center rounded-xl bg-sun/30 text-xl">⭐</span>
        <div><p className="font-display text-ink text-sm leading-tight">Lesson complete!</p><p className="text-xs text-ink/60">Farm Animals · 10/10</p></div>
      </div>
      
      <div className="absolute -right-3 bottom-6 bg-white rounded-blob shadow-soft px-4 py-3 floaty" style={{animationDelay: '.3s'}}>
        <p className="text-xs font-semibold text-ink/60">Attendance today</p>
        <p className="font-display text-2xl text-ink leading-none">96%<span className="text-coral text-sm align-top ml-1">▲</span></p>
        <div className="mt-2 h-1.5 w-28 rounded-full bg-foam overflow-hidden"><div className="h-full w-[96%] bg-aqua rounded-full"></div></div>
      </div>
    </div>
  </div>
  <svg className="wave -mb-1" viewBox="0 0 1440 90" preserveAspectRatio="none"><path d="M0 60 Q360 0 720 40 T1440 30 V90 H0Z" fill="#fff"/></svg>
</section>


<svg width="0" height="0" style={{position: 'absolute'}} aria-hidden="true"><defs><g id="octoInner">
  <ellipse cx="100" cy="108" rx="62" ry="58" fill="#1651A3"/>
  <circle cx="78" cy="104" r="16" fill="#fff"/><circle cx="122" cy="104" r="16" fill="#fff"/>
  <circle cx="82" cy="107" r="8" fill="#14335E"/><circle cx="118" cy="107" r="8" fill="#14335E"/>
  <path d="M86 132c8 8 20 8 28 0" stroke="#0D2545" strokeWidth="4" strokeLinecap="round" fill="none"/>
  <path d="M100 46 50 66l50 20 50-20z" fill="#14335E"/><rect x="88" y="80" width="24" height="12" rx="3" fill="#2A6ACF"/>
  <path d="M55 150c-12 8-14 24-4 34 4-14 12-18 22-16z" fill="#1651A3"/><path d="M145 150c12 8 14 24 4 34-4-14-12-18-22-16z" fill="#1651A3"/>
</g></defs></svg>


<section className="bg-white pb-6">
  <div className="max-w-6xl mx-auto px-5">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center reveal">
      <div className="p-4"><p className="font-display text-3xl text-ink">30,000+</p><p className="text-sm text-ink/60 font-semibold">little learners</p></div>
      <div className="p-4"><p className="font-display text-3xl text-ink">50+</p><p className="text-sm text-ink/60 font-semibold">schools &amp; preschools</p></div>
      <div className="p-4"><p className="font-display text-3xl text-ink">6</p><p className="text-sm text-ink/60 font-semibold">immersive worlds</p></div>
      <div className="p-4"><p className="font-display text-3xl text-ink">100+</p><p className="text-sm text-ink/60 font-semibold">bite-size lessons</p></div>
    </div>
  </div>
</section>


<section className="bg-white py-16">
  <div className="max-w-7xl mx-auto px-5">
    <div className="text-center max-w-2xl mx-auto reveal">
      <span className="eyebrow text-coral">One octopus, three ways to grow</span>
      <h2 className="font-display text-4xl sm:text-5xl text-ink mt-3">Everything your school needs to <span className="text-royal">learn &amp; grow</span></h2>
    </div>
    <div className="grid md:grid-cols-3 gap-6 mt-12">
      <a href="#worlds" className="card p-7 hover:shadow-lift transition group reveal">
        <span className="w-14 h-14 grid place-items-center rounded-2xl bg-aqua/15 text-3xl">🐙</span>
        <h3 className="font-display text-2xl text-ink mt-5">KidoMatic World</h3>
        <p className="text-ink/70 mt-2">Immersive 3D worlds where kids explore and learn by doing.</p>
        <span className="inline-flex items-center gap-1 mt-5 font-display text-coral group-hover:gap-2 transition-all">Explore Worlds →</span>
      </a>
      <a href="#erp" className="card p-7 hover:shadow-lift transition group reveal">
        <span className="w-14 h-14 grid place-items-center rounded-2xl bg-royal/12 text-3xl">🏫</span>
        <h3 className="font-display text-2xl text-ink mt-5">KidoMatic ERP</h3>
        <p className="text-ink/70 mt-2">Run your whole school on web &amp; mobile — admissions to report cards.</p>
        <span className="inline-flex items-center gap-1 mt-5 font-display text-coral group-hover:gap-2 transition-all">See the ERP →</span>
      </a>
      <a href="#partners" className="card p-7 hover:shadow-lift transition group reveal">
        <span className="w-14 h-14 grid place-items-center rounded-2xl bg-sun/25 text-3xl">🤝</span>
        <h3 className="font-display text-2xl text-ink mt-5">KidoMatic Partners</h3>
        <p className="text-ink/70 mt-2">Resell KidoMatic in your region and earn recurring revenue.</p>
        <span className="inline-flex items-center gap-1 mt-5 font-display text-coral group-hover:gap-2 transition-all">Partner with us →</span>
      </a>
    </div>
  </div>
</section>


<section id="worlds" className="grad-foam py-20">
  <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-14 items-center">
    <div className="reveal order-2 lg:order-1">
      <span className="eyebrow text-royal">KidoMatic World</span>
      <h2 className="font-display text-4xl sm:text-5xl text-ink mt-3">Screen time, finally worth it.</h2>
      <p className="mt-4 text-lg text-ink/70">Children don't just watch — they walk through farms, jungles, oceans and more as Octo, meeting characters, hearing fun facts, then playing a gentle quiz. Learning sticks because they <em>did</em> it.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="chip bg-white shadow-soft">🐄 Farm</span><span className="chip bg-white shadow-soft">🏙️ Town</span>
        <span className="chip bg-white shadow-soft">🐯 Jungle</span><span className="chip bg-white shadow-soft">🦜 Garden</span>
        <span className="chip bg-white shadow-soft">🐠 Reef</span><span className="chip bg-white shadow-soft">⛰️ Land</span>
      </div>
      <div className="mt-8 flex flex-wrap gap-3 items-center">
        <a href="#download" className="btn btn-ink px-6 py-3">Download the app</a>
        <a href="#demo" className="btn btn-ghost px-6 py-3">Book a school demo</a>
      </div>
    </div>
    <div className="reveal order-1 lg:order-2 grid grid-cols-2 gap-4">
      <div className="card p-5"><div className="text-4xl">🌊</div><h4 className="font-display text-lg text-ink mt-3">Bigger to explore</h4><p className="text-sm text-ink/65 mt-1">Real, roam-anywhere 3D worlds.</p></div>
      <div className="card p-5 mt-6"><div className="text-4xl">🗣️</div><h4 className="font-display text-lg text-ink mt-3">Made for pre-readers</h4><p className="text-sm text-ink/65 mt-1">Every fact is read aloud.</p></div>
      <div className="card p-5"><div className="text-4xl">🇮🇳</div><h4 className="font-display text-lg text-ink mt-3">Rooted in their world</h4><p className="text-sm text-ink/65 mt-1">Indian &amp; Asian animals and places.</p></div>
      <div className="card p-5 mt-6"><div className="text-4xl">🛡️</div><h4 className="font-display text-lg text-ink mt-3">Truly safe</h4><p className="text-sm text-ink/65 mt-1">No ads, no chat, no purchases.</p></div>
    </div>
  </div>
</section>


<section id="erp" className="grad-reef text-white py-20 relative overflow-hidden">
  <div className="absolute inset-0 pointer-events-none">
    <div className="bubble w-4 h-4" style={{left: '8%', bottom: '12%', animationDuration: '10s'}}></div>
    <div className="bubble w-2 h-2" style={{left: '90%', bottom: '20%', animationDuration: '8s', animationDelay: '1s'}}></div>
  </div>
  <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-14 items-center relative">
    <div className="reveal">
      <span className="eyebrow text-sun">KidoMatic ERP · Web + Mobile</span>
      <h2 className="font-display text-4xl sm:text-5xl mt-3">One platform to run your whole school.</h2>
      <p className="mt-4 text-lg text-white/75">Admissions, attendance, fees, classes, staff, report cards and parent communication — on the web and in your pocket.</p>
      <div className="grid sm:grid-cols-2 gap-3 mt-7">
        <div className="flex items-center gap-3 bg-white/8 rounded-blob px-4 py-3"><span className="text-xl">📝</span><span className="font-semibold">Admissions &amp; Fees</span></div>
        <div className="flex items-center gap-3 bg-white/8 rounded-blob px-4 py-3"><span className="text-xl">✅</span><span className="font-semibold">Attendance</span></div>
        <div className="flex items-center gap-3 bg-white/8 rounded-blob px-4 py-3"><span className="text-xl">📊</span><span className="font-semibold">Report Cards</span></div>
        <div className="flex items-center gap-3 bg-white/8 rounded-blob px-4 py-3"><span className="text-xl">📱</span><span className="font-semibold">Parent App</span></div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#demo" className="btn btn-coral px-6 py-3">Book a Demo</a>
        <a href="#download" className="btn btn-ghost px-6 py-3 bg-white/10 border-white/25 text-white hover:border-white">Get the app</a>
      </div>
    </div>
    
    <div className="reveal">
      <div className="floaty bg-white rounded-xl3 shadow-lift overflow-hidden text-ink">
        <div className="flex">
          <aside className="w-16 sm:w-20 bg-ink text-white/80 py-4 flex flex-col items-center gap-4 text-xs">
            <span className="octo-slot w-8 h-8 inline-block"></span>
            <span className="w-9 h-9 grid place-items-center rounded-xl bg-white/15">▦</span>
            <span className="w-9 h-9 grid place-items-center">👥</span><span className="w-9 h-9 grid place-items-center">₹</span><span className="w-9 h-9 grid place-items-center">✓</span><span className="w-9 h-9 grid place-items-center">📈</span>
          </aside>
          <div className="flex-1 p-5">
            <div className="flex items-center justify-between"><div><p className="font-display text-lg">Sunrise Preschool</p><p className="text-xs text-ink/50">Dashboard · Term 1</p></div><span className="chip bg-foam text-ink text-xs">Today</span></div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-foam rounded-2xl p-3"><p className="text-[11px] text-ink/55 font-semibold">Students</p><p className="font-display text-2xl">248</p></div>
              <div className="bg-aqua/15 rounded-2xl p-3"><p className="text-[11px] text-ink/55 font-semibold">Attendance</p><p className="font-display text-2xl">96%</p></div>
              <div className="bg-sun/20 rounded-2xl p-3"><p className="text-[11px] text-ink/55 font-semibold">Fees due</p><p className="font-display text-2xl">₹1.2L</p></div>
            </div>
            <div className="mt-4 bg-foam/60 rounded-2xl p-3">
              <p className="text-xs font-semibold text-ink/60 mb-2">Weekly attendance</p>
              <div className="flex items-end gap-2 h-20">
                <div className="flex-1 bg-royal/30 rounded-t-lg" style={{height: '60%'}}></div><div className="flex-1 bg-royal/40 rounded-t-lg" style={{height: '75%'}}></div>
                <div className="flex-1 bg-royal/50 rounded-t-lg" style={{height: '55%'}}></div><div className="flex-1 bg-coral rounded-t-lg" style={{height: '90%'}}></div>
                <div className="flex-1 bg-royal/40 rounded-t-lg" style={{height: '70%'}}></div><div className="flex-1 bg-royal/30 rounded-t-lg" style={{height: '80%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<section id="partners" className="bg-white py-20">
  <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-14 items-center">
    <div className="reveal">
      <span className="eyebrow text-coral">KidoMatic Partners</span>
      <h2 className="font-display text-4xl sm:text-5xl text-ink mt-3">Grow your business with KidoMatic.</h2>
      <p className="mt-4 text-lg text-ink/70">Join our partner network to bring KidoMatic to schools near you — with training, marketing kits and recurring commissions.</p>
      <ul className="mt-6 space-y-3">
        <li className="flex items-center gap-3"><span className="w-7 h-7 grid place-items-center rounded-full bg-aqua/20 text-aqua font-bold">✓</span> Recurring commissions on every school</li>
        <li className="flex items-center gap-3"><span className="w-7 h-7 grid place-items-center rounded-full bg-aqua/20 text-aqua font-bold">✓</span> Partner portal to track leads &amp; payouts</li>
        <li className="flex items-center gap-3"><span className="w-7 h-7 grid place-items-center rounded-full bg-aqua/20 text-aqua font-bold">✓</span> Training, demo kits &amp; dedicated support</li>
      </ul>
      <a href="#demo" className="btn btn-coral px-6 py-3 mt-8">Become a partner</a>
    </div>
    <div className="reveal grid grid-cols-2 gap-4">
      <div className="card p-6 text-center"><p className="font-display text-4xl text-ink">Apply</p><p className="text-sm text-ink/60 mt-1">Tell us your region</p></div>
      <div className="card p-6 text-center mt-6 bg-ink text-white"><p className="font-display text-4xl">Train</p><p className="text-sm text-white/70 mt-1">Get certified &amp; kitted</p></div>
      <div className="card p-6 text-center"><p className="font-display text-4xl text-ink">Sell</p><p className="text-sm text-ink/60 mt-1">Onboard local schools</p></div>
      <div className="card p-6 text-center mt-6 bg-sun/25"><p className="font-display text-4xl text-ink">Earn</p><p className="text-sm text-ink/70 mt-1">Recurring revenue</p></div>
    </div>
  </div>
</section>


<section className="grad-foam py-20">
  <div className="max-w-6xl mx-auto px-5">
    <div className="text-center max-w-2xl mx-auto reveal">
      <span className="eyebrow text-royal">How a lesson works</span>
      <h2 className="font-display text-4xl sm:text-5xl text-ink mt-3">Three simple steps to “aha!”</h2>
    </div>
    <div className="grid md:grid-cols-3 gap-6 mt-12">
      <div className="card p-7 reveal"><span className="chip bg-coral/10 text-coral font-display">Step 1</span><h3 className="font-display text-2xl text-ink mt-4">Explore</h3><p className="text-ink/70 mt-2">Pick a grade and step into a living 3D world. Walk anywhere as Octo.</p></div>
      <div className="card p-7 reveal"><span className="chip bg-royal/10 text-royal font-display">Step 2</span><h3 className="font-display text-2xl text-ink mt-4">Meet &amp; learn</h3><p className="text-ink/70 mt-2">Find friendly characters, tap them, hear them speak, and learn a fun fact.</p></div>
      <div className="card p-7 reveal"><span className="chip bg-aqua/15 text-aqua font-display">Step 3</span><h3 className="font-display text-2xl text-ink mt-4">Play the quiz</h3><p className="text-ink/70 mt-2">A gentle, tappable quiz turns the visit into a memory — with stickers &amp; cheers.</p></div>
    </div>
  </div>
</section>


<section id="pricing" className="bg-white py-20">
  <div className="max-w-6xl mx-auto px-5">
    <div className="text-center max-w-2xl mx-auto reveal">
      <span className="eyebrow text-coral">Pricing</span>
      <h2 className="font-display text-4xl sm:text-5xl text-ink mt-3">Simple pricing for everyone</h2>
      <div className="inline-flex items-center gap-1 bg-foam rounded-full p-1 mt-6">
        <button id="mBtn" className="px-5 py-2 rounded-full text-sm font-display bg-white shadow-soft text-ink">Monthly</button>
        <button id="yBtn" className="px-5 py-2 rounded-full text-sm font-display text-ink/60">Yearly <span className="text-coral">-20%</span></button>
      </div>
    </div>
    <div className="grid md:grid-cols-3 gap-6 mt-12 items-stretch">
      <div className="card p-7 reveal flex flex-col">
        <p className="font-display text-xl text-ink">Family</p><p className="text-sm text-ink/60 mt-1">For parents at home</p>
        <p className="mt-5"><span className="font-display text-4xl text-ink price" data-m="₹199" data-y="₹1,910">₹199</span><span className="text-ink/50 text-sm">/mo</span></p>
        <ul className="mt-5 space-y-2 text-sm text-ink/75 flex-1">
          <li>✓ All 6 worlds</li><li>✓ Up to 3 kid profiles</li><li>✓ Offline play</li><li>✓ Ad-free forever</li>
        </ul>
        <a href="#download" className="btn btn-ghost justify-center py-3 mt-6">Start free trial</a>
      </div>
      <div className="card p-7 reveal flex flex-col ring-2 ring-coral relative">
        <span className="chip bg-coral text-white absolute -top-3 left-1/2 -translate-x-1/2">Most popular</span>
        <p className="font-display text-xl text-ink">School</p><p className="text-sm text-ink/60 mt-1">World + full ERP</p>
        <p className="mt-5"><span className="font-display text-4xl text-ink price" data-m="₹50" data-y="₹40">₹50</span><span className="text-ink/50 text-sm">/student/mo + GST</span></p>
        <ul className="mt-5 space-y-2 text-sm text-ink/75 flex-1">
          <li>✓ Everything in Family</li><li>✓ Complete school ERP</li><li>✓ Parent &amp; teacher apps</li><li>✓ Onboarding &amp; support</li>
        </ul>
        <a href="#demo" className="btn btn-coral justify-center py-3 mt-6">Get a quote</a>
      </div>
      <div className="card p-7 reveal flex flex-col">
        <p className="font-display text-xl text-ink">Partner</p><p className="text-sm text-ink/60 mt-1">Resell &amp; earn</p>
        <p className="mt-5"><span className="font-display text-4xl text-ink">Earn</span><span className="text-ink/50 text-sm"> with us</span></p>
        <ul className="mt-5 space-y-2 text-sm text-ink/75 flex-1">
          <li>✓ Recurring commissions</li><li>✓ Partner portal</li><li>✓ Training &amp; kits</li><li>✓ Protected territory</li>
        </ul>
        <a href="#demo" className="btn btn-ghost justify-center py-3 mt-6">Become a partner</a>
      </div>
    </div>
    <p className="text-center text-sm text-ink/55 mt-6">GST invoice provided · Cancel anytime · Secure payments (UPI / Razorpay)</p>
  </div>
</section>


<section className="grad-foam py-20">
  <div className="max-w-6xl mx-auto px-5">
    <div className="text-center max-w-2xl mx-auto reveal"><span className="eyebrow text-royal">Loved by families &amp; schools</span><h2 className="font-display text-4xl sm:text-5xl text-ink mt-3">Real feedback</h2></div>
    <div className="grid md:grid-cols-3 gap-6 mt-12">
      <figure className="card p-7 reveal"><div className="text-sun text-lg">★★★★★</div><blockquote className="text-ink/80 mt-3">“My daughter now ‘goes to the jungle’ every evening and tells us facts at dinner.”</blockquote><figcaption className="mt-4 text-sm font-semibold text-ink/60">— Parent, [City]</figcaption></figure>
      <figure className="card p-7 reveal"><div className="text-sun text-lg">★★★★★</div><blockquote className="text-ink/80 mt-3">“The ERP replaced three registers. Attendance and fees now take minutes.”</blockquote><figcaption className="mt-4 text-sm font-semibold text-ink/60">— Teacher, [School]</figcaption></figure>
      <figure className="card p-7 reveal"><div className="text-sun text-lg">★★★★★</div><blockquote className="text-ink/80 mt-3">“Great margins and easy to demo. Schools say yes fast.”</blockquote><figcaption className="mt-4 text-sm font-semibold text-ink/60">— Partner, [Region]</figcaption></figure>
    </div>
  </div>
</section>


<section id="blog" className="bg-white py-20">
  <div className="max-w-6xl mx-auto px-5">
    <div className="flex items-end justify-between reveal"><div><span className="eyebrow text-coral">From the blog</span><h2 className="font-display text-4xl text-ink mt-2">Ideas for parents &amp; schools</h2></div><a href="#" className="btn btn-ghost px-5 py-2.5 text-sm hidden sm:inline-flex">Read the blog →</a></div>
    <div className="grid md:grid-cols-3 gap-6 mt-10">
      <a href="#" className="card overflow-hidden hover:shadow-lift transition reveal">
        <div className="h-40 bg-gradient-to-br from-aqua/30 to-royal/20 grid place-items-center text-5xl">🧠</div>
        <div className="p-5"><span className="chip bg-foam text-ink text-xs">Early Learning</span><h3 className="font-display text-lg text-ink mt-2">Why ‘learning by doing’ beats screen-time</h3></div>
      </a>
      <a href="#" className="card overflow-hidden hover:shadow-lift transition reveal">
        <div className="h-40 bg-gradient-to-br from-sun/40 to-coral/20 grid place-items-center text-5xl">🏫</div>
        <div className="p-5"><span className="chip bg-foam text-ink text-xs">For Schools</span><h3 className="font-display text-lg text-ink mt-2">Go digital without buying new devices</h3></div>
      </a>
      <a href="#" className="card overflow-hidden hover:shadow-lift transition reveal">
        <div className="h-40 bg-gradient-to-br from-royal/25 to-aqua/25 grid place-items-center text-5xl">🐯</div>
        <div className="p-5"><span className="chip bg-foam text-ink text-xs">Parenting</span><h3 className="font-display text-lg text-ink mt-2">Indian animals every child should know</h3></div>
      </a>
    </div>
  </div>
</section>


<section id="demo" className="py-20 bg-white">
  <div className="max-w-6xl mx-auto px-5">
    <div className="grad-reef rounded-xl3 text-white text-center px-6 py-16 relative overflow-hidden reveal">
      <div className="absolute inset-0 pointer-events-none"><div className="bubble w-5 h-5" style={{left: '15%', bottom: '10%', animationDuration: '9s'}}></div><div className="bubble w-3 h-3" style={{left: '80%', bottom: '16%', animationDuration: '7s', animationDelay: '1s'}}></div></div>
      <div className="w-20 h-20 mx-auto octo-slot bob"></div>
      <h2 className="font-display text-4xl sm:text-5xl mt-4">Ready to explore?</h2>
      <p className="text-white/75 mt-3 max-w-xl mx-auto">Give your little one a world worth tapping into — and give your school a platform that runs itself.</p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <a href="#" className="btn btn-coral px-7 py-3.5">Book a Demo</a>
        <a href="#download" className="btn btn-ghost bg-white/10 border-white/25 text-white hover:border-white px-7 py-3.5">Start free</a>
      </div>
      <p className="text-white/55 text-sm mt-5">Free to start · No card needed · Safe for kids</p>
    </div>
  </div>
</section>


<section id="download" className="grad-foam py-16">
  <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center gap-8 justify-between">
    <div className="reveal text-center md:text-left">
      <h2 className="font-display text-3xl text-ink">Get the KidoMatic app</h2>
      <p className="text-ink/70 mt-2">For parents &amp; students — on phone and tablet.</p>
    </div>
    <div className="flex gap-3 reveal">
      <a href="#" className="btn btn-ink px-5 py-3 text-left leading-tight">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 3l14 9-14 9V3z" fill="#FFC24B"/></svg>
        <span><span className="block text-[10px] font-normal opacity-70">GET IT ON</span><span className="font-display">Google Play</span></span>
      </a>
      <a href="#" className="btn btn-ink px-5 py-3 text-left leading-tight">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M16.5 12c0-2 1.5-3 1.6-3.1-0.9-1.3-2.3-1.5-2.8-1.5-1.2-.1-2.3.7-2.9.7-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.8-3.1 2-1.3 2.3-.3 5.7 1 7.6.6.9 1.3 1.9 2.3 1.9.9 0 1.3-.6 2.4-.6s1.4.6 2.4.6c1 0 1.6-.9 2.2-1.8.7-1 1-2 1-2.1-.1 0-2.1-.8-2.1-3zM14.6 6.3c.5-.6.9-1.5.8-2.3-.8 0-1.7.5-2.2 1.1-.5.5-.9 1.4-.8 2.2.9.1 1.7-.4 2.2-1z"/></svg>
        <span><span className="block text-[10px] font-normal opacity-70">Download on the</span><span className="font-display">App Store</span></span>
      </a>
    </div>
  </div>
</section>

</main>


<footer id="about" className="bg-reef text-white/80 pt-16 pb-8">
  <div className="max-w-7xl mx-auto px-5">
    <div className="grid md:grid-cols-5 gap-10">
      <div className="md:col-span-1">
        <div className="flex items-center gap-2"><span className="octo-slot w-9 h-9 inline-block"></span><span className="font-display text-xl text-white">Junior<span className="text-sun">Octo</span></span></div>
        <p className="text-sm mt-4 text-white/60">A whole learning universe for little kids — and the platform that runs it.</p>
        <div className="flex gap-3 mt-5">
          <a href="#" className="w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20">f</a>
          <a href="#" className="w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20">in</a>
          <a href="#" className="w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20">◎</a>
          <a href="#" className="w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20">▶</a>
        </div>
      </div>
      <div><h4 className="font-display text-white mb-4">Product</h4><ul className="space-y-2.5 text-sm">
        <li><a href="#worlds" className="text-white/60 hover:text-white">KidoMatic World</a></li>
        <li><a href="#erp" className="text-white/60 hover:text-white">ERP</a></li>
        <li><a href="#partners" className="text-white/60 hover:text-white">Partners</a></li>
        <li><a href="#pricing" className="text-white/60 hover:text-white">Pricing</a></li>
        <li><a href="#download" className="text-white/60 hover:text-white">Download the app</a></li>
      </ul></div>
      <div><h4 className="font-display text-white mb-4">Company</h4><ul className="space-y-2.5 text-sm">
        <li><a href="#" className="text-white/60 hover:text-white">About</a></li>
        <li><a href="#blog" className="text-white/60 hover:text-white">Blog</a></li>
        <li><a href="#demo" className="text-white/60 hover:text-white">Contact</a></li>
        <li><a href="#" className="text-white/60 hover:text-white">Careers</a></li>
      </ul></div>
      <div><h4 className="font-display text-white mb-4">Legal</h4><ul className="space-y-2.5 text-sm">
        <li><a href="#" className="text-white/60 hover:text-white">Terms &amp; Conditions</a></li>
        <li><a href="#" className="text-white/60 hover:text-white">Privacy Policy</a></li>
        <li><a href="#" className="text-white/60 hover:text-white">Cancellation &amp; Refund</a></li>
        <li><a href="#" className="text-white/60 hover:text-white">Shipping Policy</a></li>
      </ul></div>
      <div><h4 className="font-display text-white mb-4">Login</h4><ul className="space-y-2.5 text-sm">
        <li><a href="#" className="text-white/60 hover:text-white">SaaS Admin &amp; Partner Login</a></li>
        <li><a href="#" className="text-white/60 hover:text-white">School Login</a></li>
        <li><a href="#" className="text-white/60 hover:text-white">Parent / Student Login</a></li>
      </ul>
      <div className="flex gap-2 mt-5">
        <a href="#" className="text-xs bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 font-semibold">▶ Google Play</a>
        <a href="#" className="text-xs bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 font-semibold"> App Store</a>
      </div></div>
    </div>
    <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/45">
      <p>© <span id="yr"></span> HackGeniX Tech Private Limited · CIN U62013TZ2025PTC035022 · GSTIN 33AAICH0065K1ZO</p>
      <p>Made with 🐙 in India</p>
    </div>
  </div>
</footer>


    </>
  );
}
