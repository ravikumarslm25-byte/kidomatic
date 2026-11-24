export const rupee = (n) => "₹" + Math.round(+n || 0).toLocaleString("en-IN");
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MODES = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Online"];
export const CUR_YEAR = String(new Date().getFullYear());

// Fees collected -> income entries (linked, read-only)
export const feeIncome = (payments) => (payments || []).map((p) => ({ id: "fee-" + p.id, date: p.date, type: "Income", head: "Student Fees", amount: +p.amount || 0, mode: p.mode, party: p.studentName, reference: p.invoiceNo, source: "fees" }));
// Payroll -> expense entries (linked, read-only)
export const payrollExpense = (payslips) => (payslips || []).map((s) => ({ id: "pay-" + s.id, date: s.generatedAt ? s.generatedAt.slice(0, 10) : "", type: "Expense", head: "Salaries & Wages", department: "Administration", amount: +s.net || 0, party: s.staffName, reference: `${s.monthName || ""} ${s.year || ""}`.trim(), source: "payroll" }));

export function ledgerAll(transactions, payments, payslips) {
  return [...(transactions || []).map((t) => ({ ...t, source: t.source || "manual" })), ...feeIncome(payments), ...payrollExpense(payslips)]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}
export function monthAgg(entries, year) {
  const inc = new Array(12).fill(0), exp = new Array(12).fill(0);
  entries.forEach((e) => { if (!e.date) return; const d = new Date(e.date); if (String(d.getFullYear()) !== String(year)) return; const m = d.getMonth(); if (e.type === "Income") inc[m] += +e.amount || 0; else exp[m] += +e.amount || 0; });
  return { inc, exp };
}
export const inYear = (entries, year) => entries.filter((e) => e.date && String(new Date(e.date).getFullYear()) === String(year));
export function byHead(entries, type) {
  const map = {}; entries.filter((e) => e.type === type).forEach((e) => { const k = e.head || "Other"; map[k] = (map[k] || 0) + (+e.amount || 0); });
  return Object.entries(map).map(([head, amount]) => ({ head, amount })).sort((a, b) => b.amount - a.amount);
}
export function byDept(entries, type) {
  const map = {}; entries.filter((e) => e.type === type).forEach((e) => { const k = e.department || "Unassigned"; map[k] = (map[k] || 0) + (+e.amount || 0); });
  return map;
}

// Map a ledger entry to a cash/bank account name (heuristic when unassigned)
export function accountFor(entry, accounts) {
  if (entry.account) return entry.account;
  const cash = (accounts || []).find((a) => a.type === "Cash");
  const bank = (accounts || []).find((a) => a.type === "Bank");
  if (entry.source === "payroll") return bank?.name || cash?.name || "";
  if ((entry.mode || "") === "Cash") return cash?.name || "";
  return bank?.name || cash?.name || "";
}

export function agingBucket(dueDate) {
  if (!dueDate) return "No due date";
  const days = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
  if (days <= 0) return "Not due";
  if (days <= 30) return "1-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
}
export const AGING_BUCKETS = ["Not due", "1-30", "31-60", "61-90", "90+", "No due date"];
