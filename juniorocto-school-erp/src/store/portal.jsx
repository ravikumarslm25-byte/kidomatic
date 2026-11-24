import { createContext, useContext, useEffect, useState } from "react";
import { portalService } from "@/services/portal.service";

const Ctx = createContext(null);
export const usePortal = () => useContext(Ctx);

export function PortalProvider({ children }) {
  const [list, setList] = useState([]);
  const [childId, setChildId] = useState(() => localStorage.getItem("jo_child") || "");
  const [ready, setReady] = useState(false);

  const reload = (selectId) => portalService.children().then((kids) => {
    const arr = kids || [];
    setList(arr);
    const saved = selectId || localStorage.getItem("jo_child");
    const pick = arr.find((k) => k.studentId === saved) ? saved : (arr[0]?.studentId || "");
    setChildId(pick); if (pick) localStorage.setItem("jo_child", pick);
  }).catch(() => setList([])).finally(() => setReady(true));
  useEffect(() => { reload(); }, []);

  const setChild = (id) => { setChildId(id); localStorage.setItem("jo_child", id); };
  const child = list.find((k) => k.studentId === childId) || list[0] || null;

  return <Ctx.Provider value={{ list, child, childId: child?.studentId, setChild, ready, reload }}>{children}</Ctx.Provider>;
}
