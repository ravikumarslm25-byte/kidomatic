import { School } from "../../models/school.model.js";
import { Branch } from "../../models/branch.model.js";
import { User } from "../../models/user.model.js";
import { modelFor } from "../resource.model.js";
import { isPlan, maxBranches } from "../../config/plans.js";
import { asyncHandler, AppError } from "../../core/errors.js";
import slugify from "../platform/slugify.js";
import { Reseller } from "../../models/reseller.model.js";
import { Subscription } from "../../models/subscription.model.js";
import { Transaction } from "../../models/transaction.model.js";
import { Payout } from "../../models/payout.model.js";
import { Offer } from "../../models/offer.model.js";
import { PLANS } from "../../config/plans.js";
import { mrr, summarizeRevenue, buildPayout, currentPeriod } from "../billing/billing.logic.js";

// Every query is filtered by the reseller's own id — hard tenant boundary.
const owned = async (req, id) => {
  const school = await School.findOne({ _id: id, resellerId: req.user.resellerId });
  if (!school) throw new AppError("School not found", 404);
  return school;
};

export const listSchools = asyncHandler(async (req, res) => {
  res.json({ data: await School.find({ resellerId: req.user.resellerId }).sort({ createdAt: -1 }).lean() });
});

export const createSchool = asyncHandler(async (req, res) => {
  const { name, board, session, planKey = "starter" } = req.body || {};
  if (!name) throw new AppError("School name is required", 400);
  if (!isPlan(planKey)) throw new AppError("Unknown plan", 400);
  const school = await School.create({
    name, board, session, planKey, slug: slugify(name), resellerId: req.user.resellerId,
  });
  res.status(201).json({ data: school });
});

export const updateSchool = asyncHandler(async (req, res) => {
  await owned(req, req.params.id);
  const patch = (({ name, board, session, planKey, status, branding }) =>
    ({ name, board, session, planKey, status, branding }))(req.body || {});
  if (patch.planKey && !isPlan(patch.planKey)) throw new AppError("Unknown plan", 400);
  const school = await School.findByIdAndUpdate(req.params.id, patch, { new: true });
  res.json({ data: school });
});

export const listBranches = asyncHandler(async (req, res) => {
  await owned(req, req.params.id);
  res.json({ data: await Branch.find({ schoolId: req.params.id }).lean() });
});

export const createBranch = asyncHandler(async (req, res) => {
  const school = await owned(req, req.params.id);
  const count = await Branch.countDocuments({ schoolId: school.id });
  if (count >= maxBranches(school.planKey))
    throw new AppError(`The ${school.planKey} plan allows ${maxBranches(school.planKey)} branch(es). Upgrade for more.`, 402);
  const branch = await Branch.create({ schoolId: school.id, resellerId: req.user.resellerId, name: req.body?.name, address: req.body?.address });
  res.status(201).json({ data: branch });
});

// Invite a school-side user (principal/admin/teacher) for one of the reseller's schools.
export const inviteSchoolUser = asyncHandler(async (req, res) => {
  const school = await owned(req, req.params.id);
  const { name, email, role = "Principal" } = req.body || {};
  if (!email) throw new AppError("Email is required", 400);
  const tempPassword = Math.random().toString(36).slice(2, 10);
  const user = await User.create({
    name, email: String(email).toLowerCase(), audience: "school", role,
    schoolId: school.id, resellerId: req.user.resellerId,
    passwordHash: await User.hash(tempPassword),
  });
  res.status(201).json({ data: { user: user.toJSON(), tempPassword } });
});

// Roll-up across the reseller's schools.
export const summary = asyncHandler(async (req, res) => {
  const schools = await School.find({ resellerId: req.user.resellerId }).select("_id status").lean();
  const ids = schools.map((s) => String(s._id));
  const students = ids.length ? await modelFor("students").countDocuments({ schoolId: { $in: ids } }) : 0;
  res.json({ data: { schools: schools.length, activeSchools: schools.filter((s) => s.status === "active").length, students } });
});

// ── Business portal: subscriptions, transactions, payouts, revenue ──
export const listSubscriptions = asyncHandler(async (req, res) => {
  res.json({ data: await Subscription.find({ resellerId: req.user.resellerId }).sort({ createdAt: -1 }).lean() });
});
export const listTransactions = asyncHandler(async (req, res) => {
  res.json({ data: await Transaction.find({ resellerId: req.user.resellerId }).sort({ date: -1 }).limit(200).lean() });
});
export const listPayouts = asyncHandler(async (req, res) => {
  res.json({ data: await Payout.find({ resellerId: req.user.resellerId }).sort({ period: -1 }).lean() });
});
export const revenue = asyncHandler(async (req, res) => {
  const rid = req.user.resellerId;
  const [subs, txns, payouts, reseller] = await Promise.all([
    Subscription.find({ resellerId: rid }).lean(),
    Transaction.find({ resellerId: rid }).lean(),
    Payout.find({ resellerId: rid }).lean(),
    Reseller.findById(rid),
  ]);
  const pct = reseller?.commissionPct ?? 25;
  const rev = summarizeRevenue(txns);
  const thisMonth = buildPayout(txns, currentPeriod(), pct);
  const pendingPayout = payouts.filter((p) => p.status !== "paid").reduce((a, p) => a + (p.amount || 0), 0);
  res.json({ data: {
    mrr: mrr(subs), commissionPct: pct,
    activeSubscriptions: subs.filter((s) => s.status === "active").length,
    lifetimeEarnings: rev.commission, thisMonthEarnings: thisMonth.amount, pendingPayout,
  }});
});

// ── Referral link ──
export const referral = asyncHandler(async (req, res) => {
  const reseller = await Reseller.findById(req.user.resellerId);
  const code = reseller?.referralCode || reseller?.slug;
  const base = process.env.SIGNUP_URL || "https://app.juniorocto.com/signup";
  const referredCount = await Subscription.countDocuments({ resellerId: req.user.resellerId, referred: true });
  res.json({ data: { code, link: `${base}?ref=${code}`, referredCount } });
});

// ── Offers ──
export const listOffers = asyncHandler(async (req, res) => {
  res.json({ data: await Offer.find({ resellerId: req.user.resellerId }).sort({ createdAt: -1 }).lean() });
});
export const createOffer = asyncHandler(async (req, res) => {
  const { title, code, discountType = "percent", value, maxUses = 0, expiresAt } = req.body || {};
  if (!title || !code) throw new AppError("Offer title and code are required", 400);
  const offer = await Offer.create({ resellerId: req.user.resellerId, title, code: code.toUpperCase(), discountType, value, maxUses, expiresAt });
  res.status(201).json({ data: offer });
});
export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findOneAndUpdate({ _id: req.params.id, resellerId: req.user.resellerId }, req.body || {}, { new: true });
  if (!offer) throw new AppError("Offer not found", 404);
  res.json({ data: offer });
});
