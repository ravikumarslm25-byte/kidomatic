import { useMemo, useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import Spinner from "./Spinner";

// One table to power every list page: search + dropdown filters + pagination + CSV export.
export default function DataGrid({
  columns, rows = [], loading, searchKeys = [], filters = [],
  pageSize = 8, exportName = "export", rightSlot, onRowClick, emptyLabel = "Nothing here yet.",
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState({});   // { filterKey: value }
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let r = rows;
    const query = q.trim().toLowerCase();
    if (query) r = r.filter((row) => searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(query)));
    for (const f of filters) {
      const v = active[f.key];
      if (v && v !== "__all") r = r.filter((row) => String(row[f.key] ?? "") === v);
    }
    return r;
  }, [rows, q, active, searchKeys, filters]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, pages);
  const slice = filtered.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  const setFilter = (k, v) => { setActive((a) => ({ ...a, [k]: v })); setPage(1); };
  const onSearch = (v) => { setQ(v); setPage(1); };

  const exportCsv = () => {
    const head = columns.map((c) => `"${c.label}"`).join(",");
    const body = filtered.map((row) => columns.map((c) => `"${String((c.exportValue ? c.exportValue(row) : row[c.key]) ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([head + "\n" + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `${exportName}.csv`; a.click();
  };

  return (
    <div className="glass rounded-xl2 shadow-glass overflow-hidden">
      {/* toolbar */}
      <div className="p-3 sm:p-4 flex flex-wrap items-center gap-2 border-b border-navy/8">
        {searchKeys.length > 0 && (
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
            <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Search…"
              className="h-10 w-full rounded-xl bg-white/70 border border-navy/12 pl-9 pr-3 text-sm outline-none focus:border-royal/45 text-navy" />
          </div>
        )}
        {filters.map((f) => (
          <div key={f.key} className="relative">
            <select value={active[f.key] || "__all"} onChange={(e) => setFilter(f.key, e.target.value)}
              className="h-10 rounded-xl bg-white/70 border border-navy/12 pl-3 pr-8 text-sm text-navy/80 outline-none focus:border-royal/45 appearance-none cursor-pointer">
              <option value="__all">{f.label}: All</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <SlidersHorizontal size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy/40 pointer-events-none" />
          </div>
        ))}
        <div className="flex-1" />
        <button onClick={exportCsv} className="h-10 px-3 rounded-xl bg-white/70 border border-navy/12 text-sm text-navy/70 hover:bg-white flex items-center gap-1.5"><Download size={15} /> Export</button>
        {rightSlot}
      </div>

      {/* table */}
      {loading ? <div className="grid place-items-center py-16"><Spinner size={26} /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-navy/45 border-b border-navy/8">
              {columns.map((c) => <th key={c.key} className={`font-semibold uppercase text-[11px] tracking-wide px-5 py-3 ${c.align === "right" ? "text-right" : ""}`}>{c.label}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-navy/6">
              {slice.map((row, i) => (
                <tr key={row.id || i} onClick={() => onRowClick?.(row)} className={`hover:bg-white/50 ${onRowClick ? "cursor-pointer" : ""}`}>
                  {columns.map((c) => <td key={c.key} className={`px-5 py-3 text-navy/80 ${c.align === "right" ? "text-right" : ""} ${c.className || ""}`}>{c.render ? c.render(row) : row[c.key]}</td>)}
                </tr>
              ))}
              {slice.length === 0 && <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-navy/45">{emptyLabel}</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-navy/8 text-sm text-navy/55">
          <span>{(clampedPage - 1) * pageSize + 1}–{Math.min(clampedPage * pageSize, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button disabled={clampedPage <= 1} onClick={() => setPage((p) => p - 1)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/70 disabled:opacity-30"><ChevronLeft size={16} /></button>
            <span className="px-2 font-medium text-navy">{clampedPage} / {pages}</span>
            <button disabled={clampedPage >= pages} onClick={() => setPage((p) => p + 1)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/70 disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
