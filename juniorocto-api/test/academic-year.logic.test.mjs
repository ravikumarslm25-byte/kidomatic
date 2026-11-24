import { nextClass, canSwitchYear, resolveViewYear, planPromotion } from "../src/modules/academic-year/academic-year.logic.js";
let pass = 0, fail = 0;
const ck = (n, c, e = "") => { c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, e)); };

ck("Nursery → LKG", nextClass("Nursery") === "LKG");
ck("Grade 5 → Grade 6", nextClass("Grade 5") === "Grade 6");
ck("Grade 12 → Graduated", nextClass("Grade 12") === "Graduated");
ck("unknown class stays", nextClass("Playgroup") === "Playgroup");

ck("staff can switch year", canSwitchYear("school") === true);
ck("platform can switch year", canSwitchYear("platform") === true);
ck("parent CANNOT switch", canSwitchYear("parent") === false);
ck("student CANNOT switch", canSwitchYear("student") === false);

ck("parent locked to current", resolveViewYear({ requestedYearId: "y2023", currentYearId: "y2026", audience: "parent" }) === "y2026");
ck("admin sees requested year", resolveViewYear({ requestedYearId: "y2023", currentYearId: "y2026", audience: "school" }) === "y2023");
ck("admin defaults to current", resolveViewYear({ currentYearId: "y2026", audience: "school" }) === "y2026");

const enr = [
  { id: "e1", studentId: "s1", klass: "Grade 1", section: "A", routeId: "r1" },
  { id: "e2", studentId: "s2", klass: "Grade 12", section: "B" },
  { id: "e3", studentId: "s3", klass: "Grade 3", section: "A" },
];
const { carried, closed } = planPromotion(enr, "y2027", { s3: "retain" });
ck("promote count = 2 (g12 graduates, g3 retained still enrolls)", carried.length === 2, String(carried.length));
ck("s1 promoted to Grade 2 in new year", carried.find(c => c.studentId === "s1")?.klass === "Grade 2");
ck("s1 keeps route (bus carried)", carried.find(c => c.studentId === "s1")?.routeId === "r1");
ck("s3 retained in Grade 3", carried.find(c => c.studentId === "s3")?.klass === "Grade 3");
ck("s2 graduated (no new enrollment)", !carried.find(c => c.studentId === "s2"));
ck("all old enrollments closed with status", closed.length === 3 && closed.find(c => c.id === "e2").status === "graduated");
ck("new enrollments tagged target year", carried.every(c => c.academicYearId === "y2027"));

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
