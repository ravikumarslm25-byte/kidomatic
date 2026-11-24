// ─── Pure multi-year logic (no DB) ─────────────────────────────────────────
import { CLASS_LADDER, GRADUATED } from "../../config/class-ladder.js";

export function nextClass(current, ladder = CLASS_LADDER) {
  const i = ladder.indexOf(current);
  if (i === -1) return current;
  return i === ladder.length - 1 ? GRADUATED : ladder[i + 1];
}
export const canSwitchYear = (audience) => audience === "school" || audience === "platform";
export function resolveViewYear({ requestedYearId, currentYearId, audience }) {
  if (!canSwitchYear(audience)) return currentYearId;
  return requestedYearId || currentYearId;
}
export function planPromotion(enrollments, targetYearId, decisions = {}, ladder = CLASS_LADDER) {
  const carried = [], closed = [];
  for (const e of enrollments) {
    const decision = decisions[e.studentId] || "promote";
    let newClass = e.klass, status = "promoted";
    if (decision === "retain") { newClass = e.klass; status = "retained"; }
    else if (decision === "graduate") { newClass = GRADUATED; status = "graduated"; }
    else { newClass = nextClass(e.klass, ladder); if (newClass === GRADUATED) status = "graduated"; }
    closed.push({ id: e.id, status });
    if (newClass !== GRADUATED) carried.push({ studentId: e.studentId, academicYearId: targetYearId, klass: newClass, section: e.section, routeId: e.routeId || null, stopId: e.stopId || null, house: e.house || null, status: "enrolled" });
  }
  return { carried, closed };
}
