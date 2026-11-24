import { cn } from "@/lib/cn";
export default function Button({ variant = "primary", size = "md", className, children, ...p }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-11 px-5" };
  const variants = {
    primary: "text-white btn-grad shadow-soft hover:brightness-[1.05]",
    ghost: "text-navy/70 hover:text-navy hover:bg-white/60",
    outline: "border border-navy/15 text-navy hover:bg-white/60 bg-white/40",
    soft: "bg-royal-100 text-royal hover:bg-royal-100/70",
    danger: "bg-coral/10 text-coral-600 hover:bg-coral/20",
  };
  return <button className={cn(base, sizes[size], variants[variant], className)} {...p}>{children}</button>;
}
