import { AcademicYear } from "../../models/academic-year.model.js";
import { resolveViewYear } from "../../modules/academic-year/academic-year.logic.js";
// Resolves which academic year this request may view. Admin/staff can pass
// ?year= or x-academic-year to time-travel; parents/students are locked to current.
export async function resolveYearContext(req, _res, next) {
  try {
    const current = await AcademicYear.findOne({ schoolId: req.user?.schoolId, isCurrent: true }).lean();
    const requested = req.get("x-academic-year") || req.query.year;
    req.currentYearId = current?._id?.toString() || null;
    req.viewYearId = resolveViewYear({ requestedYearId: requested, currentYearId: req.currentYearId, audience: req.user?.audience });
    next();
  } catch (e) { next(e); }
}
