// Platform CRM & ops modules for the SaaS Admin console: Leads, Quotations,
// Transactions, Users (platform team), Support tickets. Platform-tier (not
// tenant-scoped). Mounted under /api/platform, behind requireAudience("platform").
import { asyncHandler, AppError } from "../../core/errors.js";
import { Lead } from "../../models/lead.model.js";
import { Quotation } from "../../models/quotation.model.js";
import { SupportTicket } from "../../models/support-ticket.model.js";
import { Transaction } from "../../models/transaction.model.js";
import { User } from "../../models/user.model.js";

const today = () => new Date().toISOString().slice(0, 10);

// ---------- Leads ----------
export const listLeads = asyncHandler(async (_req, res) => {
  res.json({ data: await Lead.find().sort({ createdAt: -1 }).lean() });
});
export const createLead = asyncHandler(async (req, res) => {
  const lead = await Lead.create({ ...req.body, createdAt: req.body?.createdAt || today() });
  res.status(201).json({ data: lead });
});
export const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body || {}, { new: true });
  if (!lead) throw new AppError("Lead not found", 404);
  res.json({ data: lead });
});

// ---------- Quotations ----------
export const listQuotations = asyncHandler(async (_req, res) => {
  res.json({ data: await Quotation.find().sort({ createdAt: -1 }).lean() });
});
export const createQuotation = asyncHandler(async (req, res) => {
  const seq = (await Quotation.countDocuments()) + 1;
  const number = req.body?.number || `QUO-26-${String(100 + seq).padStart(4, "0")}`;
  const q = await Quotation.create({ status: "Draft", date: today(), ...req.body, number });
  res.status(201).json({ data: q });
});
export const updateQuotation = asyncHandler(async (req, res) => {
  const q = await Quotation.findByIdAndUpdate(req.params.id, req.body || {}, { new: true });
  if (!q) throw new AppError("Quotation not found", 404);
  res.json({ data: q });
});
export const sendQuotation = asyncHandler(async (req, res) => {
  const q = await Quotation.findByIdAndUpdate(req.params.id, { status: "Sent" }, { new: true });
  if (!q) throw new AppError("Quotation not found", 404);
  res.json({ data: q });
});
export const convertQuotation = asyncHandler(async (req, res) => {
  const q = await Quotation.findByIdAndUpdate(req.params.id, { status: "Accepted" }, { new: true });
  if (!q) throw new AppError("Quotation not found", 404);
  res.json({ data: q });
});

// ---------- Transactions (platform sees all) ----------
export const listTransactions = asyncHandler(async (_req, res) => {
  const rows = await Transaction.find().sort({ date: -1 }).limit(200).lean();
  const data = rows.map((t) => ({
    id: t._id, ref: t.txnRef, customer: t.schoolName, amount: t.amount,
    method: t.method || "Online", type: t.type, status: t.status, date: t.date,
  }));
  res.json({ data });
});

// ---------- Users (platform team) ----------
export const listUsers = asyncHandler(async (_req, res) => {
  const rows = await User.find({ audience: "platform" }).sort({ createdAt: -1 });
  res.json({ data: rows.map((u) => u.toJSON()) });
});
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body || {};
  if (!email) throw new AppError("Email is required", 400);
  const exists = await User.findOne({ email: String(email).toLowerCase(), audience: "platform" });
  if (exists) throw new AppError("A platform user with that email already exists", 409);
  const tempPassword = Math.random().toString(36).slice(2, 10);
  const user = await User.create({
    name, email, role: role || "Platform Support", audience: "platform",
    status: "invited", passwordHash: await User.hash(tempPassword),
  });
  res.status(201).json({ data: { user: user.toJSON(), tempPassword } });
});
export const updateUser = asyncHandler(async (req, res) => {
  const patch = {};
  for (const k of ["name", "role", "status", "lastActive"]) if (k in (req.body || {})) patch[k] = req.body[k];
  const user = await User.findOneAndUpdate({ _id: req.params.id, audience: "platform" }, patch, { new: true });
  if (!user) throw new AppError("User not found", 404);
  res.json({ data: user.toJSON() });
});

// ---------- Support tickets ----------
export const listTickets = asyncHandler(async (_req, res) => {
  res.json({ data: await SupportTicket.find().sort({ updatedAt: -1, createdAt: -1 }).lean() });
});
export const updateTicket = asyncHandler(async (req, res) => {
  const patch = {};
  for (const k of ["status", "assignee", "priority"]) if (k in (req.body || {})) patch[k] = req.body[k];
  patch.updatedAt = today();
  const t = await SupportTicket.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!t) throw new AppError("Ticket not found", 404);
  res.json({ data: t });
});
export const replyTicket = asyncHandler(async (req, res) => {
  const t = await SupportTicket.findById(req.params.id);
  if (!t) throw new AppError("Ticket not found", 404);
  t.messages.push({ by: req.user?.name || "Support", text: req.body?.message || "", at: new Date().toISOString() });
  t.status = "Pending";
  t.updatedAt = today();
  await t.save();
  res.json({ data: t });
});
