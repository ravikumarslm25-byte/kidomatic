import { User } from "../../models/user.model.js";
import { modelFor } from "../resource.model.js";
import { asyncHandler, AppError } from "../../core/errors.js";
import { assertOwnsStudent } from "../portal-access.js";
import { applyPayment, receiptNo } from "../fees/fees.logic.js";

// Admin (school audience) provisions a parent login and links them to a student.
export const provisionGuardian = asyncHandler(async (req, res) => {
  const schoolId = req.user.schoolId;
  const { studentId, studentName, klass, section, name, email, phone, relationship, password, isPrimary, canPay } = req.body || {};
  if (!studentId || !name || !email) throw new AppError("student, guardian name and email are required", 400);
  const lower = String(email).toLowerCase();

  let user = await User.findOne({ email: lower, audience: "parent", schoolId });
  let tempPassword = null;
  if (!user) {
    tempPassword = password || Math.random().toString(36).slice(2, 10);
    user = await User.create({ email: lower, name, audience: "parent", role: "Parent", schoolId, studentId: String(studentId), studentName: studentName || null, passwordHash: await User.hash(tempPassword) });
  } else if (password) {
    user.passwordHash = await User.hash(password); await user.save(); tempPassword = password;
  }

  const GL = modelFor("guardianLinks");
  const dup = await GL.findOne({ parentUserId: String(user._id), studentId: String(studentId) });
  const link = dup || await GL.create({
    parentUserId: String(user._id), parentName: name, parentEmail: lower, phone,
    studentId: String(studentId), studentName, klass, section,
    relationship: relationship || "Parent", isPrimary: !!isPrimary, canPay: canPay !== false,
    createdAt: new Date().toISOString(),
  });
  res.json({ data: { link, userId: String(user._id), email: lower, tempPassword } });
});

// Parent → their linked children; Student → self.
export const myChildren = asyncHandler(async (req, res) => {
  if (req.user.audience === "student") {
    const S = modelFor("students");
    const me = req.user.studentId ? await S.findById(req.user.studentId).catch(() => null) : null;
    return res.json({ data: me ? [{ studentId: String(me._id), studentName: me.name, klass: me.klass, section: me.section, self: true }] : [] });
  }
  const GL = modelFor("guardianLinks");
  let links = await GL.find({ parentUserId: req.user.id }).lean();
  if (!links.length) {
    // fallback: older student-form login stored studentId on the user, no link row
    const u = await User.findById(req.user.id).lean().catch(() => null);
    if (u?.studentId) {
      const S = modelFor("students");
      const st = await S.findById(u.studentId).lean().catch(() => null);
      if (st) links = [{ studentId: String(st._id), studentName: st.name, klass: st.klass, section: st.section, relationship: "Parent", canPay: true }];
    }
  }
  res.json({ data: links });
});

// Parent pays a due invoice for their linked child (server validates ownership + pay rights).
export const payInvoice = asyncHandler(async (req, res) => {
  const { invoiceId, amount, mode } = req.body || {};
  if (!invoiceId || !amount) throw new AppError("invoiceId and amount are required", 400);
  const Invoice = modelFor("invoices");
  const inv = await Invoice.findById(invoiceId);
  if (!inv) throw new AppError("Invoice not found", 404);

  const link = await assertOwnsStudent(req, inv.studentId, inv.studentName || inv.student);
  if (!link) throw new AppError("This invoice isn't for your child", 403);
  if (link.canPay === false) throw new AppError("This login isn't allowed to pay fees", 403);
  if (inv.status === "Paid") throw new AppError("Invoice already paid", 400);

  const amt = Number(amount);
  if (amt <= 0) throw new AppError("Enter a valid amount", 400);
  const next = applyPayment({ total: inv.total, paid: inv.paid || 0 }, amt);
  inv.paid = next.paid; inv.balance = next.balance; inv.status = next.status;
  await inv.save();

  const Payment = modelFor("payments");
  const seq = (await Payment.countDocuments()) + 1;
  const receipt = await Payment.create({
    receiptNo: receiptNo(seq), invoiceNo: inv.invoiceNo, invoiceId: String(inv._id),
    studentId: inv.studentId, studentName: inv.studentName || inv.student,
    amount: amt, mode: mode || "Online", reference: "PORTAL", note: "Paid via parent portal",
    date: new Date().toISOString(), receivedBy: req.user.name || "Parent",
  });
  res.status(201).json({ data: { invoice: inv, receipt } });
});

// Parent / student raises a support ticket.
export const createTicket = asyncHandler(async (req, res) => {
  const { subject, category, message, studentId, studentName, priority } = req.body || {};
  if (!subject || !message) throw new AppError("Subject and message are required", 400);
  const T = modelFor("supportTickets");
  const seq = (await T.countDocuments()) + 1;
  const now = new Date().toISOString();
  const ticket = await T.create({
    ticketNo: `TKT-${String(new Date().getFullYear()).slice(2)}-${String(seq).padStart(4, "0")}`,
    subject, category: category || "General", message, studentId, studentName,
    createdById: req.user.id, createdByName: req.user.name || "Parent", createdByEmail: req.user.email,
    audience: req.user.audience, status: "Open", priority: priority || "Normal",
    replies: [], createdAt: now, updatedAt: now,
  });
  res.status(201).json({ data: ticket });
});

// Parent / student replies on their own ticket.
export const replyTicket = asyncHandler(async (req, res) => {
  const { message } = req.body || {};
  if (!message) throw new AppError("Message is required", 400);
  const T = modelFor("supportTickets");
  const t = await T.findById(req.params.id);
  if (!t) throw new AppError("Ticket not found", 404);
  if (String(t.createdById) !== String(req.user.id)) throw new AppError("Not your ticket", 403);
  const replies = Array.isArray(t.replies) ? t.replies : [];
  replies.push({ by: req.user.name || "You", role: "guardian", message, at: new Date().toISOString() });
  t.replies = replies; t.status = t.status === "Resolved" ? "Reopened" : t.status; t.updatedAt = new Date().toISOString();
  t.markModified("replies"); await t.save();
  res.json({ data: t });
});

// Admin resets / generates a new password for a parent login.
export const resetGuardianPassword = asyncHandler(async (req, res) => {
  const { parentUserId, email, password } = req.body || {};
  const schoolId = req.user.schoolId;
  let user = null;
  if (parentUserId) user = await User.findById(parentUserId).catch(() => null);
  if (!user && email) user = await User.findOne({ email: String(email).toLowerCase(), audience: "parent", schoolId });
  if (!user) throw new AppError("Parent login not found", 404);
  const newPass = password || Math.random().toString(36).slice(2, 10);
  user.passwordHash = await User.hash(newPass);
  await user.save();
  res.json({ data: { email: user.email, tempPassword: newPass } });
});

// Parent self-links another child using admission number + date of birth (light verification).
export const linkChild = asyncHandler(async (req, res) => {
  const { admissionNo, dob } = req.body || {};
  if (!admissionNo || !dob) throw new AppError("Admission number and date of birth are required", 400);
  const S = modelFor("students");
  const stu = await S.findOne({ admissionNo: String(admissionNo).trim() });
  if (!stu) throw new AppError("No student found with that admission number", 404);
  const sameDob = stu.dob && String(new Date(stu.dob).toISOString().slice(0, 10)) === String(new Date(dob).toISOString().slice(0, 10));
  if (!sameDob) throw new AppError("Date of birth doesn't match our records", 400);
  const GL = modelFor("guardianLinks");
  const dup = await GL.findOne({ parentUserId: req.user.id, studentId: String(stu._id) });
  if (dup) throw new AppError("This child is already linked to your login", 400);
  const link = await GL.create({
    parentUserId: req.user.id, parentName: req.user.name, parentEmail: req.user.email,
    studentId: String(stu._id), studentName: stu.name, klass: stu.klass, section: stu.section,
    relationship: "Parent", isPrimary: false, canPay: true, createdAt: new Date().toISOString(),
  });
  res.status(201).json({ data: link });
});
