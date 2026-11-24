export const DEFAULT_TYPES = [
  { name: "Casual Leave", code: "CL", annualQuota: 12, paid: true, color: "#1651A3" },
  { name: "Sick Leave", code: "SL", annualQuota: 12, paid: true, color: "#0ea5e9" },
  { name: "Earned Leave", code: "EL", annualQuota: 15, paid: true, encashable: true, color: "#16a34a" },
  { name: "Maternity Leave", code: "ML", annualQuota: 180, paid: true, color: "#db2777" },
  { name: "Comp-off", code: "CO", annualQuota: 0, paid: true, color: "#7c3aed" },
  { name: "Loss of Pay", code: "LOP", annualQuota: 0, paid: false, color: "#dc2626" },
];
export const HOLIDAY_TYPES = ["Public", "Restricted", "School", "Exam"];
export const truthy = (v) => v === true || v === "true" || v === 1;
export const iso = (d) => new Date(d).toISOString().slice(0, 10);

// working days between two dates, excluding Sundays + holiday dates; half-day → 0.5 for single day
export function workingDays(from, to, holidays = [], halfDay = false) {
  if (!from || !to) return 0;
  const hset = new Set(holidays.map((h) => h.date));
  const end = new Date(to); let n = 0;
  for (let d = new Date(from); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0) continue;
    if (hset.has(d.toISOString().slice(0, 10))) continue;
    n++;
  }
  return n === 1 && halfDay ? 0.5 : n;
}
export const isTeaching = (s) => (s?.category || "").startsWith("Teaching");

// Substitution: for a teacher on leave across dates, find their periods and free teachers
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function findCover(staffName, from, to, timetable, staff) {
  const teachers = staff.filter(isTeaching).map((s) => s.name);
  const end = new Date(to); const out = [];
  for (let d = new Date(from); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay(); if (dow === 0 || dow === 6) continue;
    const di = dow - 1; // Mon=0..Fri=4
    const periods = [];
    (timetable || []).forEach((doc) => {
      Object.entries(doc.grid || {}).forEach(([key, cell]) => {
        const [kdi, kpi] = key.split("-").map(Number);
        if (kdi === di && cell?.teacher === staffName) {
          // who is free at di-pi?
          const busy = new Set();
          timetable.forEach((doc2) => { const c2 = (doc2.grid || {})[key]; if (c2?.teacher) busy.add(c2.teacher); });
          const free = teachers.filter((t) => t !== staffName && !busy.has(t));
          periods.push({ pi: kpi, klass: doc.klass + (doc.section ? " " + doc.section : ""), subject: cell.subject, free });
        }
      });
    });
    periods.sort((a, b) => a.pi - b.pi);
    if (periods.length) out.push({ date: d.toISOString().slice(0, 10), day: DAYS[dow], periods });
  }
  return out;
}
