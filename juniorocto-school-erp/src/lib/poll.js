// Poll options come in two shapes: plain text (polls made in the ERP; votes use the
// option's position "0", "1"…) or { id, label } (made by the parent-app side; votes use
// the id). These helpers read both, so every poll shows and counts the same everywhere.
export const optionId = (o, i) => (o && typeof o === "object" && o.id != null ? String(o.id) : String(i));
export const optionLabel = (o) => (typeof o === "string" ? o : o?.label ?? o?.text ?? "");
