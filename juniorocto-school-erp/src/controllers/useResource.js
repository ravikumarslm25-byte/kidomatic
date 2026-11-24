// Controller: the view-model behind every list screen.
// Owns fetch/search/CRUD state so views stay declarative.
import { useCallback, useEffect, useState } from "react";
import { resourceService } from "@/services/resource";
import { normList, norm } from "@/models/normalize";
import { useToast } from "@/store/toast";

export function useResource(resource) {
  const svc = resourceService(resource);
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");

  const load = useCallback(async (query = "") => {
    setLoading(true); setError(null);
    try {
      const data = await svc.list(query ? { q: query } : {});
      setRows(normList(data));
    } catch (e) {
      setError(e.message || "Could not load records");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  useEffect(() => { load(""); }, [load]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const create = async (payload) => {
    const row = norm(await svc.create(payload));
    setRows((r) => [row, ...r]);
    toast.success("Saved");
    return row;
  };
  const update = async (id, payload) => {
    const row = norm(await svc.update(id, payload));
    setRows((r) => r.map((x) => (x.id === id ? row : x)));
    toast.success("Updated");
    return row;
  };
  const remove = async (id) => {
    await svc.remove(id);
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  return { rows, loading, error, q, setQ, reload: () => load(q), create, update, remove };
}
