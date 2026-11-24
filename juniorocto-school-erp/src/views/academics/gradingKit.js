export const DEFAULT_BANDS = [
  { grade: "A+", minPct: 90, maxPct: 100, point: 10, remark: "Outstanding" },
  { grade: "A", minPct: 80, maxPct: 89, point: 9, remark: "Excellent" },
  { grade: "B+", minPct: 70, maxPct: 79, point: 8, remark: "Very Good" },
  { grade: "B", minPct: 60, maxPct: 69, point: 7, remark: "Good" },
  { grade: "C", minPct: 50, maxPct: 59, point: 6, remark: "Fair" },
  { grade: "D", minPct: 40, maxPct: 49, point: 5, remark: "Scope to improve" },
  { grade: "E", minPct: 0, maxPct: 39, point: 0, remark: "Needs support" },
];
export const DEFAULT_SETTINGS = { passPct: 35, system: "Grade + CGPA", showGrade: true, showCGPA: true, showRank: true, showPercentage: true };

export const gradeFor = (pct, bands) => bands.find((b) => pct >= b.minPct && pct <= b.maxPct) || bands[bands.length - 1] || { grade: "-", point: 0, remark: "" };

export function computeStudent(marks, bands, settings) {
  const rows = (marks || []).map((m) => {
    const max = +m.max || 0, obt = +m.obtained || 0, pct = max ? (obt / max) * 100 : 0;
    const g = gradeFor(pct, bands);
    return { subject: m.subject, obtained: obt, max, pct: Math.round(pct * 10) / 10, grade: g.grade, point: g.point, pass: pct >= settings.passPct };
  });
  const totalObt = rows.reduce((a, r) => a + r.obtained, 0);
  const totalMax = rows.reduce((a, r) => a + r.max, 0);
  const pct = totalMax ? (totalObt / totalMax) * 100 : 0;
  const cgpa = rows.length ? rows.reduce((a, r) => a + r.point, 0) / rows.length : 0;
  const overall = gradeFor(pct, bands);
  const result = rows.length && rows.every((r) => r.pass) && pct >= settings.passPct ? "Pass" : "Fail";
  return { rows, totalObt, totalMax, pct: Math.round(pct * 10) / 10, cgpa: Math.round(cgpa * 100) / 100, grade: overall.grade, result };
}
// assign competition rank (ties share rank) by total obtained
export function withRanks(reports) {
  const sorted = [...reports].sort((a, b) => b.report.totalObt - a.report.totalObt);
  let rank = 0, prev = null, seen = 0;
  sorted.forEach((r) => { seen++; if (prev === null || r.report.totalObt < prev) { rank = seen; prev = r.report.totalObt; } r.rank = r.report.result === "Fail" ? "—" : rank; });
  return sorted;
}
