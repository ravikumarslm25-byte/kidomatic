import { modelFor } from "../resource.model.js";
import { asyncHandler, AppError } from "../../core/errors.js";
import { feeHeadsForClass, computeInvoice, applyPayment, invoiceNo, receiptNo } from "./fees.logic.js";

const dueInDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

// POST /api/fees/invoices/generate { term }
// Creates one Due invoice per active student from the fee structure.
export const generate = asyncHandler(async (req, res) => {
  const term = req.body?.term || "Term 1";
  const Invoice = modelFor("invoices");
  const feeStructure = await modelFor("feeStructure").find();
  const students = await modelFor("students").find({ status: "Active" });

  let seq = await Invoice.countDocuments();
  const skipped = [];
  const created = [];
  for (const stu of students) {
    const exists = await Invoice.findOne({ student: stu.name, term });
    if (exists) { skipped.push(stu.name); continue; }
    const heads = feeHeadsForClass(feeStructure, stu.klass, term);
    if (!heads.length) { skipped.push(stu.name); continue; }
    const { lineItems, subtotal, discount, total } = computeInvoice(heads, []);
    seq += 1;
    const inv = await Invoice.create({
      invoiceNo: invoiceNo(seq),
      student: stu.name, studentId: stu.id, studentName: stu.name,
      admissionNo: stu.admissionNo, klass: stu.klass, section: stu.section, term,
      lineItems, items: lineItems, subtotal, discount, amount: total, total,
      paid: 0, balance: total, dueDate: dueInDays(14), status: "Due",
    });
    created.push(inv);
  }
  res.status(201).json({ data: { term, created: created.length, skipped: skipped.length, invoices: created } });
});

// GET /api/fees/invoices/:id  → invoice + its payments
export const getInvoice = asyncHandler(async (req, res) => {
  const inv = await modelFor("invoices").findOne({ _id: req.params.id });
  if (!inv) throw new AppError("Invoice not found", 404);
  const payments = await modelFor("payments").find({ invoiceId: inv.id }).sort({ date: -1 });
  res.json({ data: { invoice: inv, payments } });
});

// GET /api/fees/dues?student=NAME → latest unpaid/partial invoice for a student
export const dues = asyncHandler(async (req, res) => {
  const { studentId, student } = req.query;
  if (!studentId && !student) throw new AppError("studentId or student is required", 400);
  const match = studentId ? { studentId } : { student };
  const inv = await modelFor("invoices").findOne({ ...match, status: { $ne: "Paid" } }).sort({ createdAt: -1 });
  res.json({ data: inv });
});

// POST /api/fees/invoices/:id/pay { amount, mode }
export const pay = asyncHandler(async (req, res) => {
  const Invoice = modelFor("invoices");
  const Payment = modelFor("payments");
  const inv = await Invoice.findOne({ _id: req.params.id });
  if (!inv) throw new AppError("Invoice not found", 404);
  if (inv.status === "Paid") throw new AppError("Invoice already paid", 400);

  const amount = Number(req.body?.amount);
  if (!amount || amount <= 0) throw new AppError("A positive amount is required", 400);
  const mode = req.body?.mode || "UPI";

  const next = applyPayment({ total: inv.total, paid: inv.paid }, amount);
  inv.paid = next.paid; inv.balance = next.balance; inv.status = next.status;
  await inv.save();

  const seq = (await Payment.countDocuments()) + 1;
  const receipt = await Payment.create({
    receiptNo: receiptNo(seq), invoiceNo: inv.invoiceNo, invoiceId: inv.id,
    student: inv.student, studentId: inv.studentId, studentName: inv.studentName || inv.student,
    amount: next.applied, mode, date: new Date(),
  });

  res.status(201).json({ data: { invoice: inv, receipt } });
});
