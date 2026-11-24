export default function PageHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        {Icon && <div className="grid place-items-center h-11 w-11 rounded-2xl bg-white/70 shadow-soft text-royal"><Icon size={20} /></div>}
        <div>
          <h1 className="font-display text-[22px] leading-tight text-navy">{title}</h1>
          {subtitle && <p className="text-sm text-navy/50">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
