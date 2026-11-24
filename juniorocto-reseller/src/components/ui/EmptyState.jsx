import OctoMark from "@/components/brand/OctoMark";
import Button from "./Button";
export default function EmptyState({ title = "Nothing here yet", hint, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="opacity-40 animate-floaty"><OctoMark size={54} /></div>
      <h3 className="mt-4 font-display text-lg text-navy">{title}</h3>
      {hint && <p className="mt-1 text-sm text-navy/50 max-w-sm">{hint}</p>}
      {action && <Button className="mt-5" onClick={onAction}>{action}</Button>}
    </div>
  );
}
