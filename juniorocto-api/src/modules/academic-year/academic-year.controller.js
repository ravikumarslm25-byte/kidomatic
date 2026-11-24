import { AcademicYear } from "../../models/academic-year.model.js";
import { Enrollment } from "../../models/enrollment.model.js";
import { asyncHandler, AppError } from "../../core/errors.js";
import { planPromotion } from "./academic-year.logic.js";

export const listYears = asyncHandler(async (req, res) => {
  res.json({ data: await AcademicYear.find({ schoolId: req.user.schoolId }).sort({ startDate: -1, createdAt: -1 }).lean() });
});
export const currentYear = asyncHandler(async (req, res) => {
  res.json({ data: await AcademicYear.findOne({ schoolId: req.user.schoolId, isCurrent: true }).lean() });
});
export const createYear = asyncHandler(async (req, res) => {
  const { name, startDate, endDate, makeCurrent } = req.body || {};
  if (!name) throw new AppError("Year name is required", 400);
  if (makeCurrent) await AcademicYear.updateMany({ schoolId: req.user.schoolId }, { isCurrent: false });
  const year = await AcademicYear.create({ schoolId: req.user.schoolId, name, startDate, endDate, isCurrent: !!makeCurrent });
  res.status(201).json({ data: year });
});
export const setCurrent = asyncHandler(async (req, res) => {
  await AcademicYear.updateMany({ schoolId: req.user.schoolId }, { isCurrent: false });
  const year = await AcademicYear.findOneAndUpdate({ _id: req.params.id, schoolId: req.user.schoolId }, { isCurrent: true, status: "active" }, { new: true });
  if (!year) throw new AppError("Year not found", 404);
  res.json({ data: year });
});

// Roll the school into a new year: create it, promote every enrolled student
// (promote/retain/graduate), preserve all prior-year records as history.
export const rollover = asyncHandler(async (req, res) => {
  const { fromYearId, name, startDate, endDate, decisions = {}, makeCurrent = true } = req.body || {};
  if (!fromYearId || !name) throw new AppError("fromYearId and new year name are required", 400);
  const from = await AcademicYear.findOne({ _id: fromYearId, schoolId: req.user.schoolId });
  if (!from) throw new AppError("Source year not found", 404);

  const target = await AcademicYear.create({ schoolId: req.user.schoolId, name, startDate, endDate, status: "active" });
  const enrollments = await Enrollment.find({ schoolId: req.user.schoolId, academicYearId: fromYearId, status: "enrolled" }).lean();
  const plan = planPromotion(enrollments.map((e) => ({ ...e, id: e._id.toString() })), target.id, decisions);

  // history preserved: old rows kept, only status updated
  await Promise.all(plan.closed.map((c) => Enrollment.updateOne({ _id: c.id }, { status: c.status })));
  if (plan.carried.length) await Enrollment.insertMany(plan.carried.map((c) => ({ ...c, schoolId: req.user.schoolId })));
  if (makeCurrent) { await AcademicYear.updateMany({ schoolId: req.user.schoolId }, { isCurrent: false }); target.isCurrent = true; await target.save(); await AcademicYear.updateOne({ _id: fromYearId }, { status: "archived" }); }

  res.status(201).json({ data: { year: target, promoted: plan.carried.length, graduated: plan.closed.filter((c) => c.status === "graduated").length } });
});
