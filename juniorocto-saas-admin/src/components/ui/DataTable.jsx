import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
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
    case "avatar":
      return <div className="flex items-center gap-2.5"><Avatar name={v} size={30} /><span className="font-medium text-navy">{v}</span></div>;
    default: return <span className="text-navy/80">{v ?? "—"}</span>;
  }
}

export default function DataTable({ columns, rows, onEdit, onDelete, onRowClick }) {
  const [menu, setMenu] = useState(null);
  return (
    <div className="glass rounded-xl2 shadow-glass overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-navy/8">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-navy/45 whitespace-nowrap">{c.label}</th>
              ))}
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} onClick={() => onRowClick?.(row)}
                className="border-b border-navy/5 last:border-0 hover:bg-white/50 transition cursor-default">
                {columns.map((c) => <td key={c.key} className="px-4 py-3 whitespace-nowrap"><Cell col={c} row={row} /></td>)}
                <td className="px-4 py-3 text-right relative">
                  <button onClick={(e) => { e.stopPropagation(); setMenu(menu === row.id ? null : row.id); }}
                    className="text-navy/40 hover:text-navy rounded-lg p-1"><MoreVertical size={16} /></button>
                  {menu === row.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenu(null); }} />
                      <div className="absolute right-4 top-10 z-20 glass rounded-xl shadow-glass py-1 w-32 text-left animate-pop">
                        <button onClick={(e) => { e.stopPropagation(); setMenu(null); onEdit?.(row); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-navy/80 hover:bg-white/60"><Pencil size={14} /> Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); setMenu(null); onDelete?.(row); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-coral-600 hover:bg-coral-100"><Trash2 size={14} /> Delete</button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
