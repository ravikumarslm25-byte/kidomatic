import { Lock } from "lucide-react";
import { useAuth } from "@/store/auth";
import { canManageSetup } from "@/lib/roles";

export default function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (canManageSetup(user)) return children;
  return (
    <div className="grid place-items-center py-24">
      <div className="glass rounded-xl2 shadow-glass p-8 max-w-md text-center">
        <span className="h-12 w-12 rounded-2xl bg-coral-50 text-coral-500 grid place-items-center mx-auto mb-3"><Lock size={22} /></span>
        <h2 className="font-display text-lg text-navy mb-1">Restricted area</h2>
        <p className="text-sm text-navy/55">Setup & master configuration is limited to administrators. Ask your school admin if you need access.</p>
      </div>
    </div>
  );
}
