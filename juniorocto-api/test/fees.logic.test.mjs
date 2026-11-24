import { feeHeadsForClass, computeInvoice, paymentStatus, applyPayment, invoiceNo, receiptNo } from "../src/modules/fees/fees.logic.js";
let pass = 0, fail = 0;
const check = (n, c, e = "") => { c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, e)); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const structure = [
  { name: "Tuition K-12", klass: "Grade 1–5", term: "Term 1", amount: 24000 },
  { name: "Tuition EY", klass: "Nursery–UKG", term: "Term 1", amount: 18000 },
  { name: "Transport", klass: "All", term: "Term 1", amount: 6000 },
  { name: "Lab", klass: "Grade 1–5", term: "Annual", amount: 4500 },
];

let heads = feeHeadsForClass(structure, "Grade 3", "Term 1");
check("Grade 3 gets K-12 tuition + transport + annual lab (3)", heads.length === 3, heads.map(h=>h.name).join());
heads = feeHeadsForClass(structure, "LKG", "Term 1");
check("LKG gets EY tuition + transport + (annual lab excluded by class)", heads.length === 2, heads.map(h=>h.name).join());

let inv = computeInvoice(feeHeadsForClass(structure, "Grade 3", "Term 1"), []);
check("Grade 3 subtotal = 34500", inv.subtotal === 34500, String(inv.subtotal));
check("Grade 3 total = 34500 (no discount)", inv.total === 34500);

inv = computeInvoice(feeHeadsForClass(structure, "Grade 3", "Term 1"), [{ type: "Percent", value: 10 }]);
check("10% discount → total 31050", inv.total === 31050, String(inv.total));
inv = computeInvoice([{ name: "X", amount: 1000 }], [{ type: "Flat", value: 1500 }]);
check("discount capped at subtotal (total 0, not negative)", inv.total === 0 && inv.discount === 1000);

check("status Due when paid 0", paymentStatus(1000, 0) === "Due");
check("status Partial when 0<paid<total", paymentStatus(1000, 400) === "Partial");
check("status Paid when paid>=total", paymentStatus(1000, 1000) === "Paid");

let a = applyPayment({ total: 24000, paid: 0 }, 10000);
check("partial payment → paid 10000, balance 14000, Partial", a.paid === 10000 && a.balance === 14000 && a.status === "Partial");
a = applyPayment({ total: 24000, paid: 10000 }, 20000);
check("overpay clamps to total → paid 24000, balance 0, Paid, applied 14000", a.paid === 24000 && a.balance === 0 && a.status === "Paid" && a.applied === 14000);

check("invoiceNo format", invoiceNo(412, "26") === "INV-26-0412");
check("receiptNo format", receiptNo(7, "26") === "RCPT-26-0007");

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
