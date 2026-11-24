import { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";
export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const w = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" }[size];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-navy/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${w} glass rounded-xl3 shadow-glass animate-pop max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy/8">
          <h3 className="font-display text-lg text-navy">{title}</h3>
          <button onClick={onClose} className="text-navy/40 hover:text-navy rounded-lg p-1"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 py-4 border-t border-navy/8">{footer}</div>}
      </div>
    </div>
  );
}
export function ModalFooter({ onCancel, onSave, saving, saveLabel = "Save" }) {
  return (
    <>
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      <Button onClick={onSave} disabled={saving}>{saving ? "Saving…" : saveLabel}</Button>
    </>
  );
}
