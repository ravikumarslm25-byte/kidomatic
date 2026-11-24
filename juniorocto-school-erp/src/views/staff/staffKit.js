export const CATEGORIES = ["Teaching", "Non-Teaching / Admin", "Management", "Support / Class-IV"];
export const EMPLOYMENT_TYPES = ["Permanent", "Probation", "Contract", "Part-time / Visiting", "Substitute", "Intern", "Consultant"];
export const WINGS = ["Pre-Primary", "Primary", "Secondary", "Senior Secondary", "Whole School"];
export const DOC_TYPES = ["Aadhaar", "PAN", "Passport Photo", "Address Proof", "Bank Passbook / Cheque", "10th (SSLC)", "12th (HSC)", "UG Degree", "PG Degree", "B.Ed / D.El.Ed", "TET / CTET", "Experience Certificate", "Relieving Letter", "Police Verification", "Medical Fitness", "PF / UAN", "ESIC", "Driving Licence", "Other"];
export const TET_STATUS = ["Not Applicable", "Qualified", "Not Qualified", "Exempted"];
export const CAT_COLOR = { "Teaching": "#1651A3", "Non-Teaching / Admin": "#0ea5e9", "Management": "#7c3aed", "Support / Class-IV": "#E85410" };

export const daysUntil = (d) => (d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null);
export const isTeaching = (s) => (s.category || "").startsWith("Teaching");

// Flatten all documents that are expiring within `within` days (or already expired)
export function expiringDocs(staff, within = 90) {
  const out = [];
  staff.forEach((s) => {
    (s.documents || []).forEach((d) => {
      const dl = daysUntil(d.expiryDate);
      if (dl !== null && dl <= within) out.push({ staff: s.name, empId: s.empId, type: d.type, number: d.number, expiryDate: d.expiryDate, days: dl });
    });
    // treat TET expiry as a doc too
    const t = daysUntil(s.tetExpiry);
    if (t !== null && t <= within) out.push({ staff: s.name, empId: s.empId, type: "TET / CTET", number: "", expiryDate: s.tetExpiry, days: t });
  });
  return out.sort((a, b) => a.days - b.days);
}

export function compliance(staff, students) {
  const active = staff.filter((s) => (s.status || "Active") === "Active");
  const teaching = active.filter(isTeaching);
  const noPolice = active.filter((s) => !truthy(s.policeVerified));
  const noMedical = active.filter((s) => !truthy(s.medicalFitness));
  const tetGap = teaching.filter((s) => !["Qualified", "Exempted", "Not Applicable"].includes(s.tetStatus || ""));
  const bedGap = teaching.filter((s) => !truthy(s.hasBEd));
  const exp = expiringDocs(active, 90);
  const studentCount = (students || []).filter((s) => (s.status || "Active") === "Active").length;
  const ptr = teaching.length ? Math.round(studentCount / teaching.length) : 0;
  return { active, teaching, noPolice, noMedical, tetGap, bedGap, exp, studentCount, ptr };
}
export const truthy = (v) => v === true || v === "true" || v === 1;
export const rag = (bad, total) => (bad === 0 ? "green" : bad / Math.max(1, total) > 0.25 ? "red" : "amber");
export const RAG_COLOR = { green: "#16a34a", amber: "#d97706", red: "#dc2626" };
