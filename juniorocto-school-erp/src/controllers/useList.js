// Read-only list hook that works in BOTH mock and live-API modes.
// Custom screens (dashboard, fees, attendance…) use this instead of touching
// the mock store directly, so flipping VITE_USE_MOCK=false makes them fetch
// from the Express API with no further changes.
import { useEffect, useState } from "react";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";

export function useList(resource) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    resourceService(resource).list()
      .then((d) => { if (alive) { setRows(normList(d)); setLoading(false); } })
      .catch(() => { if (alive) { setRows([]); setLoading(false); } });
    return () => { alive = false; };
  }, [resource]);
  return { rows, loading };
}
