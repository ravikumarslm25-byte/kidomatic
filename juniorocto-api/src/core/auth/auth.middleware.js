import { verify } from "./jwt.js";
import { AppError } from "../errors.js";
import { runWithContext } from "../tenancy/context.js";

// Verifies the JWT, then runs the rest of the request inside a tenant context
// so every Mongoose query is auto-scoped to this user's school.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new AppError("Not authenticated", 401));
  let payload;
  try { payload = verify(token); } catch { return next(new AppError("Invalid or expired token", 401)); }
  req.user = payload;
  const tenant = { schoolId: payload.schoolId, resellerId: payload.resellerId ?? null, branchId: payload.branchId ?? null };
  runWithContext({ user: payload, tenant }, () => next());
}

// Restrict a route to specific audiences (platform/reseller/school/…).
// Older tokens carry no audience: one tied to a school counts as a school account.
export const audienceOf = (user) => user?.audience ?? (user?.schoolId ? "school" : null);
export const requireAudience = (...allowed) => (req, res, next) =>
  allowed.includes(audienceOf(req.user)) ? next() : next(new AppError(`This area is for ${allowed.join(" / ")} accounts`, 403));

// Restrict a route to specific roles.
export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : next(new AppError(`Requires role: ${roles.join(" / ")}`, 403));
