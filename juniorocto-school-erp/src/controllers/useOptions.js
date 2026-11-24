// Fetches live records from any resource and maps them to dropdown options.
// This is the heart of "smart" forms — no re-typing data that already exists.
import { useEffect, useState } from "react";
import { resourceService } from "@/services/resource";
import { normList } from "@/models/normalize";

export function useOptions(resource, { labelKey = "name", valueKey } = {}) {
  const vk = valueKey || labelKey;   // store the readable label by default
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let on = true; setLoading(true);
    resourceService(resource).list({})
      .then((data) => {
        const rows = normList(data);
        const opts = rows.map((r) => ({ value: r[vk] ?? r[labelKey] ?? r.name ?? r.id, label: r[labelKey] ?? r.name ?? r.title ?? r.id, raw: r }))
                         .filter((o) => o.value != null && o.label != null);
        if (on) { setOptions(opts); setLoading(false); }
      })
      .catch(() => on && setLoading(false));
    return () => { on = false; };
  }, [resource, labelKey, vk]);
  return { options, loading };
}
