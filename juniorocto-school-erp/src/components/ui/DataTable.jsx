import { MoreVertical, Pencil, Trash2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import Badge from "./Badge";
import Chip from "./Chip";
import Avatar from "./Avatar";
import { inr, dateFmt, num } from "@/lib/format";

function Cell({ col, row }) {
  const v = row[col.key];
  switch (col.type) {
    case "badge": return <Badge>{v}</Badge>;
    case "chip": return <Chip>{v}</Chip>;
    case "money": return <span className="font-mono text-navy font-semibold">{inr(v)}</span>;
    case "date": return <span className="text-navy/70">{dateFmt(v)}</span>;
    case "mono": return <span className="font-mono text-xs text-navy/70">{v}</span>;
    case "count": return <span className="font-mono font-semibold text-navy">{num(v)}</span>;
    case "avatar": return <div className="flex items-center gap-2.5"><Avatar name={v} size={30} /><span className="font-medium text-navy">{v}</span></div>;
    case "tags": return <span className="text-navy/80">{Array.isArray(v) ? v.join(", ") : v}</span>;
    default: return <span className="text-navy/80">{Array.isArray(v) ? (v.length ? v.join(", ") : "—") : (v ?? "—")}</span>;
  }
}
const PAGE_SIZES = [10, 25, 50, 100];
const distinct = (rows, key) => [...new Set(rows.map((r) => r[key]).filter((v) => v != null && v !== ""))];

export default function DataTable({ columns, rows, onEdit, onDelete, onRowClick, exportName = "export" }) {
  const [menu, setMenu] = useState(null);
  const [filters, setFilters] = useState({});
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  // Auto quick-filters from categorical columns (badge/chip)
  const filterCols = columns.filter((c) => c.type === "badge" || c.type === "chip");
  const filtered = useMemo(() => rows.filter((r) => Object.entries(filters).every(([k, v]) => !v || r[k] === v)), [rows, filters]);
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const cur = Math.min(page, pages);
  const start = (cur - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  const setFilter = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };

  const exportCsv = () => {
    const head = columns.map((c) => `"${c.label}"`).join(",");
    const body = filtered.map((r) => columns.map((c) => `"${String(r[c.key] ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([head + "\n" + body], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${exportName}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="glass rounded-xl2 shadow-glass overflow-hidden">
      {/* Toolbar: filters + export */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-navy/8">
        {filterCols.map((c) => (
          <select key={c.key} value={filters[c.key] || ""} onChange={(e) => setFilter(c.key, e.target.value)}
            className="h-9 rounded-xl bg-white/70 border border-navy/12 px-3 text-sm text-navy/80 outline-none focus:border-royal/45">
            <option value="">{c.label}: All</option>
            {distinct(rows, c.key).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        ))}
        <button onClick={exportCsv} className="ml-auto h-9 px-3 rounded-xl bg-white/70 border border-navy/12 text-sm text-navy/70 hover:text-navy flex items-center gap-1.5"><Download size={14} /> Export</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-navy/8">
              {columns.map((c) => <th key={c.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-navy/45 whitespace-nowrap">{c.label}</th>)}
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.id} onClick={() => onRowClick?.(row)} className="border-b border-navy/5 last:border-0 hover:bg-white/50 transition">
                {columns.map((c) => <td key={c.key} className="px-4 py-3 whitespace-nowrap"><Cell col={c} row={row} /></td>)}
                <td className="px-4 py-3 text-right relative">
                  <button onClick={(e) => { e.stopPropagation(); setMenu(menu === row.id ? null : row.id); }} className="text-navy/40 hover:text-navy rounded-lg p-1"><MoreVertical size={16} /></button>
                  {menu === row.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenu(null); }} />
                      <div className="absolute right-4 top-10 z-20 glass rounded-xl shadow-glass py-1 w-32 text-left animate-pop">
                        <button onClick={(e) => { e.stopPropagation(); setMenu(null); onEdit?.(row); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-navy/80 hover:bg-white/60"><Pencil size={14} /> Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); setMenu(null); onDelete?.(row); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-coral-600 hover:bg-coral-100"><Trash2 size={14} /> Delete</button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer: total + rows-per-page + pager */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-navy/8 text-sm text-navy/60">
        <span>Showing <b className="text-navy">{total === 0 ? 0 : start + 1}–{Math.min(start + pageSize, total)}</b> of <b className="text-navy">{total}</b></span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs">Rows:</span>
          <select value={pageSize} onChange={(e) => { setPageSize(+e.target.value); setPage(1); }} className="h-8 rounded-lg bg-white/70 border border-navy/12 px-2 text-sm outline-none">
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={cur <= 1} className="h-8 w-8 grid place-items-center rounded-lg border border-navy/12 disabled:opacity-40"><ChevronLeft size={15} /></button>
          <span className="text-xs">Page {cur} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={cur >= pages} className="h-8 w-8 grid place-items-center rounded-lg border border-navy/12 disabled:opacity-40"><ChevronRight size={15} /></button>
        </div>
      </div>
    </div>
  );
}
