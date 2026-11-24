import { School } from "../../models/school.model.js";
import { Reseller } from "../../models/reseller.model.js";
import { asyncHandler } from "../../core/errors.js";
import { resolveBranding } from "./branding.logic.js";

// Resolved branding for the logged-in school (post-auth refresh).
export const myBranding = asyncHandler(async (req, res) => {
  const school = req.user.schoolId ? await School.findById(req.user.schoolId) : null;
  let reseller = null;
  if (school?.resellerId) reseller = await Reseller.findById(school.resellerId);
  res.json({ data: resolveBranding(school?.toObject?.() || {}, reseller?.toObject?.() || {}) });
});
