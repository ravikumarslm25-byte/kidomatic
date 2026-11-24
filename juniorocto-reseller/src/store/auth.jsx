import { createContext, useContext, useState } from "react";
import { authService } from "@/services/auth.service";
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("jo_reseller_user") || "null"); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem("jo_reseller_token"));
  const login = async (creds) => {
    const { token, user } = await authService.login(creds);
    localStorage.setItem("jo_reseller_token", token); localStorage.setItem("jo_reseller_user", JSON.stringify(user));
    setToken(token); setUser(user); return user;
  };
  const logout = () => { localStorage.removeItem("jo_reseller_token"); localStorage.removeItem("jo_reseller_user"); setToken(null); setUser(null); };
  return <Ctx.Provider value={{ user, token, isAuthed: !!token, login, logout }}>{children}</Ctx.Provider>;
}
