import { AlertTriangle } from "lucide-react";
export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-coral-100 border border-coral/25 px-4 py-3 text-coral-600">
      <AlertTriangle size={18} />
      <span className="text-sm font-medium flex-1">{message}</span>
      {onRetry && <button onClick={onRetry} className="text-sm font-semibold underline underline-offset-2">Retry</button>}
    </div>
  );
}
