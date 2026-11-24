export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const truthy = (v) => v === true || v === "true" || v === 1 || v === undefined; // default applicable
export const rupee = (n) => "₹" + Math.round(+n || 0).toLocaleString("en-IN");

export const grossOf = (st) => (+st.basic || 0) + (+st.da || 0) + (+st.hra || 0) + (+st.conveyance || 0) + (+st.special || 0) + (+st.medical || 0);
export const pf = (basic, cap = 15000) => Math.round(Math.min(+basic || 0, cap) * 0.12);
export const esi = (gross) => (gross <= 21000 ? Math.round(gross * 0.0075) : 0);
export function ptTN(monthlyGross) {
  const hy = monthlyGross * 6; let amt = 0;
  if (hy <= 21000) amt = 0; else if (hy <= 30000) amt = 135; else if (hy <= 45000) amt = 315;
  else if (hy <= 60000) amt = 690; else if (hy <= 75000) amt = 1025; else amt = 1250;
  return Math.round(amt / 6);
}
// approved unpaid (LOP) leave days whose fromDate is in the given month/year
export function lopDays(staffId, month, year, leaveApps) {
  return leaveApps.filter((a) => a.staffId === staffId && a.status === "Approved" && !truthyPaid(a.paid) &&
    a.fromDate && new Date(a.fromDate).getMonth() === month && new Date(a.fromDate).getFullYear() === year)
    .reduce((s, a) => s + (+a.days || 0), 0);
}
const truthyPaid = (v) => v === true || v === "true" || v === 1;
// exam-duty: papers where this staff is invigilator, dated in the month
export function examDutyCount(staffName, month, year, exams) {
  let n = 0;
  (exams || []).forEach((e) => (e.schedule || []).forEach((p) => {
    if (p.invigilator === staffName && p.date && new Date(p.date).getMonth() === month && new Date(p.date).getFullYear() === year) n++;
  }));
  return n;
}
export function computePayslip({ st, staff, month, year, leaveApps, exams, loans, settings }) {
  const gross = grossOf(st);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const perDay = gross / daysInMonth;
  const lop = lopDays(st.staffId, month, year, leaveApps);
  const lopAmt = Math.round(perDay * lop);
  const duties = examDutyCount(st.staffName, month, year, exams);
  const dutyRate = +settings?.examDutyRate || 300;
  const examDuty = duties * dutyRate;
  const emi = (loans || []).filter((l) => l.staffId === st.staffId && (l.status || "Active") === "Active" && (+l.balance > 0)).reduce((s, l) => s + (+l.emi || 0), 0);

  const _pf = truthy(st.pfApplicable) ? pf(st.basic, +settings?.pfCap || 15000) : 0;
  const _esi = truthy(st.esiApplicable) ? esi(gross) : 0;
  const _pt = truthy(st.ptApplicable) ? ptTN(gross) : 0;
  const _tds = +st.tds || 0;

  const earnings = [
    { label: "Basic", amount: +st.basic || 0 }, { label: "DA", amount: +st.da || 0 }, { label: "HRA", amount: +st.hra || 0 },
    { label: "Conveyance", amount: +st.conveyance || 0 }, { label: "Special Allowance", amount: +st.special || 0 }, { label: "Medical", amount: +st.medical || 0 },
  ].filter((e) => e.amount);
  if (examDuty) earnings.push({ label: `Exam Duty (${duties})`, amount: examDuty });
  const deductions = [
    { label: "PF", amount: _pf }, { label: "ESI", amount: _esi }, { label: "Professional Tax", amount: _pt }, { label: "TDS", amount: _tds },
    { label: `LOP (${lop}d)`, amount: lopAmt }, { label: "Loan EMI", amount: emi },
  ].filter((d) => d.amount);
  const totalEarnings = earnings.reduce((s, e) => s + e.amount, 0);
  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
  return { staffId: st.staffId, staffName: st.staffName, earnings, deductions, lopDays: lop, examDuty, gross, totalEarnings, totalDeductions, net: totalEarnings - totalDeductions };
}
