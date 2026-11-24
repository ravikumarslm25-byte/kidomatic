export const STAGES = ["Applied", "Screened", "Demo", "Interview", "Offered", "Hired", "Rejected"];
export const STAGE_COLOR = { Applied: "#94a3b8", Screened: "#0ea5e9", Demo: "#7c3aed", Interview: "#d97706", Offered: "#1651A3", Hired: "#16a34a", Rejected: "#dc2626" };
export const DEMO_CRITERIA = ["Subject knowledge", "Classroom control", "Communication", "Board / TLM use", "Student engagement"];
export const SOURCES = ["Referral", "Job Portal", "Walk-in", "Careers Page", "Advertisement", "Agency"];
export const truthy = (v) => v === true || v === "true" || v === 1;

export function meetsEligibility(candidate, templates) {
  const t = (templates || []).find((x) => x.designation === candidate.appliedFor);
  if (!t) return { ok: null, reasons: ["No eligibility template — check manually"] };
  const reasons = []; let ok = true;
  if (truthy(t.requiresBEd) && !truthy(candidate.hasBEd)) { ok = false; reasons.push("B.Ed / D.El.Ed required"); }
  if (truthy(t.requiresTET) && candidate.tetStatus !== "Qualified") { ok = false; reasons.push("TET / CTET required"); }
  if ((+t.minExperience || 0) > 0 && (+candidate.experience || 0) < +t.minExperience) { ok = false; reasons.push(`Min ${t.minExperience}y experience`); }
  if (ok) reasons.push("Meets template requirements");
  return { ok, reasons };
}
export const demoTotal = (scores) => DEMO_CRITERIA.reduce((s, c) => s + (+((scores || {})[c]) || 0), 0);
export const demoMax = DEMO_CRITERIA.length * 5;
