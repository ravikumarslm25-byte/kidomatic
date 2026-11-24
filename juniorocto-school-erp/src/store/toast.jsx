import { createContext, useContext, useCallback, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const Ctx = createContext(null);
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((type, msg) => {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s, { id, type, msg }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 2800);
  }, []);
  const api = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    dismiss: (id) => setItems((s) => s.filter((t) => t.id !== id)),
  };
  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="fixed z-[100] bottom-5 right-5 flex flex-col gap-2">
        {items.map((t) => (
          <div key={t.id}
            className="glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-glass animate-pop min-w-[220px]">
            {t.type === "success"
              ? <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
              : <AlertCircle className="text-coral shrink-0" size={18} />}
            <span className="text-sm font-medium text-navy flex-1">{t.msg}</span>
            <button onClick={() => api.dismiss(t.id)} className="text-navy/40 hover:text-navy"><X size={15} /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
