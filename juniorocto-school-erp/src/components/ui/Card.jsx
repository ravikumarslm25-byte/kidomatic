import { cn } from "@/lib/cn";
export default function Card({ className, children, pad = true, ...p }) {
  return <div className={cn("glass rounded-xl2 shadow-glass", pad && "p-5", className)} {...p}>{children}</div>;
}
