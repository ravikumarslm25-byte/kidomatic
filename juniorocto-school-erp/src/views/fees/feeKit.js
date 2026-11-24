export const CATEGORIES = ["Tuition / Term", "Book", "Uniform", "Kit / Stationery", "Transport", "Admission", "Activity", "Exam", "Other"];
export const HEAD_TYPES = ["Term-wise", "One-time (beginning)", "Monthly", "Activity (optional)"];
export const DEFAULT_TERMS = ["Term 1", "Term 2", "Term 3"];
export const CUR_YEAR = (() => { const y = new Date().getFullYear(); const m = new Date().getMonth(); const start = m >= 3 ? y : y - 1; return `${start}-${String(start + 1).slice(2)}`; })();
export const rupee = (n) => "₹" + Math.round(+n || 0).toLocaleString("en-IN");
export const uid = () => Math.random().toString(36).slice(2, 9);

// Flatten a structure's heads into billable items (stable keys) for invoicing
export function billableItems(structure) {
  const items = [];
  (structure?.heads || []).forEach((h) => {
    if (h.type === "Term-wise") {
      (structure.terms || DEFAULT_TERMS).forEach((t) => {
        const amt = +(h.termAmounts?.[t] ?? Math.round((+h.amount || 0) / (structure.terms || DEFAULT_TERMS).length));
        if (amt > 0) items.push({ key: `${h.id}:${t}`, headId: h.id, title: `${h.title} · ${t}`, term: t, category: h.category, amount: amt, kind: "term", optional: false });
      });
    } else {
      items.push({ key: `${h.id}`, headId: h.id, title: h.title, term: h.type === "Monthly" ? "Monthly" : "One-time", category: h.category, amount: +h.amount || 0, kind: h.type === "Activity (optional)" ? "activity" : "onetime", optional: h.type === "Activity (optional)" });
    }
  });
  return items;
}
// which item keys a student already has covered by existing invoices (any status)
export function coveredKeys(studentId, invoices) {
  const keys = new Set();
  invoices.filter((i) => i.studentId === studentId).forEach((i) => (i.items || []).forEach((it) => keys.add(it.key)));
  return keys;
}
// item keys fully paid by the student (invoice status Paid)
export function paidKeys(studentId, invoices) {
  const keys = new Set();
  invoices.filter((i) => i.studentId === studentId && i.status === "Paid").forEach((i) => (i.items || []).forEach((it) => keys.add(it.key)));
  return keys;
}
