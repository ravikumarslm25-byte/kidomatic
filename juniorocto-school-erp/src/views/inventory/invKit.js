export const rupee = (n) => "₹" + Math.round(+n || 0).toLocaleString("en-IN");
export const UNITS = ["pcs", "box", "pack", "set", "pair", "kg", "gram", "litre", "ml", "ream", "roll", "bottle", "dozen", "metre", "packet"];
export const ISSUE_TYPES = ["Student", "Staff / Teacher", "Class / Advisor", "Department", "Cleaner", "PT Master", "Admin Team", "Security", "Other"];
export const daysUntil = (d) => (d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null);
export const isLow = (it) => (+it.availableCount || 0) <= (+it.reorderLevel || 0);
export const isExpiringSoon = (it) => { if (!it.expiryDate) return false; const dl = daysUntil(it.expiryDate); return dl !== null && dl <= 30; };
export const stockValue = (items) => items.reduce((a, it) => a + (+it.availableCount || 0) * (+it.unitCost || 0), 0);

// ---- consumption analytics (from invIssues) ----
const inRange = (d, from, to) => { if (!d) return false; const t = new Date(d).getTime(); return t >= from && t <= to; };
export function periodCost(issues, from, to) {
  return issues.filter((i) => inRange(i.date, from, to)).reduce((a, i) => a + (+i.cost || 0), 0);
}
export function periodQty(issues, itemId, from, to) {
  return issues.filter((i) => i.itemId === itemId && inRange(i.date, from, to)).reduce((a, i) => a + (+i.qty || 0), 0);
}
// average daily usage of an item over last N days
export function dailyUse(issues, itemId, days = 30) {
  const to = Date.now(); const from = to - days * 86400000;
  const q = periodQty(issues, itemId, from, to);
  return q / days;
}
export function startOf(kind) {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  if (kind === "day") return d.getTime();
  if (kind === "week") { const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return d.getTime(); }
  if (kind === "month") { d.setDate(1); return d.getTime(); }
  if (kind === "year") { d.setMonth(0, 1); return d.getTime(); }
  return d.getTime();
}
