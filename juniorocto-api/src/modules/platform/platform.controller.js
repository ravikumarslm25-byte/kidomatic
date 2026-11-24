import { Reseller } from "../../models/reseller.model.js";
import { School } from "../../models/school.model.js";
import { User } from "../../models/user.model.js";
import { modelFor } from "../resource.model.js";
import { planList, isPlan } from "../../config/plans.js";
import { asyncHandler, AppError } from "../../core/errors.js";
import slugify from "./slugify.js";

// ── Resellers ──
export const listResellers = asyncHandler(async (_req, res) => {
  res.json({ data: await Reseller.find().sort({ createdAt: -1 }).lean() });
});
export const createReseller = asyncHandler(async (req, res) => {
  const { name, contactEmail, revenueSharePct } = req.body || {};
  if (!name) throw new AppError("Reseller name is required", 400);
  const reseller = await Reseller.create({ name, slug: slugify(name), contactEmail, revenueSharePct });
  res.status(201).json({ data: reseller });
});
export const updateReseller = asyncHandler(async (req, res) => {
  const patch = (({ status, revenueSharePct, plansAllowed, contactEmail, branding }) =>
    ({ status, revenueSharePct, plansAllowed, contactEmail, branding }))(req.body || {});
  const reseller = await Reseller.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!reseller) throw new AppError("Reseller not found", 404);
  res.json({ data: reseller });
});

// ── Schools (platform-wide) ──
export const listSchools = asyncHandler(async (req, res) => {
  const filter = req.query.resellerId ? { resellerId: req.query.resellerId } : {};
  res.json({ data: await School.find(filter).sort({ createdAt: -1 }).lean() });
});
export const createSchool = asyncHandler(async (req, res) => {
  const { name, board, session, resellerId = null, planKey = "starter", branch } = req.body || {};
  if (!name) throw new AppError("School name is required", 400);
  if (!isPlan(planKey)) throw new AppError("Unknown plan", 400);
  const school = await School.create({ name, board, session, resellerId, planKey, slug: slugify(name), branch });
  res.status(201).json({ data: school });
});

// ── Platform KPIs ──
export const summary = asyncHandler(async (_req, res) => {
  const [resellers, schools, students, activeSchools] = await Promise.all([
    Reseller.countDocuments(),
    School.countDocuments(),
    modelFor("students").countDocuments(),   // no tenant ctx → platform-wide
    School.countDocuments({ status: "active" }),
  ]);
  res.json({ data: { resellers, schools, activeSchools, students } });
});

export const plans = asyncHandler(async (_req, res) => res.json({ data: planList() }));
