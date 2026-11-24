import { User } from "../../models/user.model.js";
import { School } from "../../models/school.model.js";
import { sign } from "./jwt.js";
import { AppError, asyncHandler } from "../errors.js";

export const AUDIENCES = ["platform", "reseller", "school", "parent", "student"];

// Audience-scoped login. Each app hits /api/auth/:audience/login, so a reseller
// can't authenticate at the school URL (and vice-versa).
export const login = asyncHandler(async (req, res) => {
  const audience = req.params.audience || "school";
  if (!AUDIENCES.includes(audience)) throw new AppError("Unknown login type", 404);

  const { email, password } = req.body || {};
  if (!email || !password) throw new AppError("Email and password are required", 400);

  const user = await User.findOne({ email: String(email).toLowerCase(), audience });
  if (!user || !(await user.checkPassword(password))) throw new AppError("Invalid credentials", 401);

  // Resolve plan + guard suspended tenants for school-scoped audiences.
  let planKey = null;
  if (user.schoolId) {
    const school = await School.findById(user.schoolId);
    if (school && school.status !== "active") throw new AppError("This school account is suspended", 403);
    planKey = school?.planKey || "starter";
  }

  const token = sign({
    id: user.id, audience, role: user.role,
    resellerId: user.resellerId, schoolId: user.schoolId, branchId: user.branchId,
    planKey, name: user.name,
  });
  res.json({ data: { token, user: user.toJSON() } });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ data: user });
});

// Change password for the logged-in user (any audience).
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) throw new AppError("Both current and new password are required", 400);
  if (String(newPassword).length < 8) throw new AppError("New password must be at least 8 characters", 400);
  const user = await User.findById(req.user.id);
  if (!user || !(await user.checkPassword(currentPassword))) throw new AppError("Current password is incorrect", 401);
  user.passwordHash = await User.hash(newPassword);
  await user.save();
  res.json({ data: { ok: true } });
});

// Forgot password — always returns ok (no account enumeration). A real impl
// issues a signed, time-limited reset token and emails it.
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  if (!email) throw new AppError("Email is required", 400);
  res.json({ data: { ok: true } });
});
