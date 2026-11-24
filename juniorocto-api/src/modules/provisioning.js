import { User } from "../models/user.model.js";

// Auto-create linked login accounts when a person record enables login.
export async function provisionLogin(resource, record, body = {}) {
  const schoolId = record.schoolId;
  const out = {};
  if (resource === "students" && body.allowParentLogin && body.parentEmail) {
    out.parent = await ensureUser({ email: body.parentEmail, name: body.parentName || "Parent", audience: "parent", role: "Parent", schoolId, studentId: String(record._id) });
  }
  if (resource === "staff" && body.allowLogin && body.email) {
    out.staff = await ensureUser({ email: body.email, name: record.name || body.name || "Staff", audience: "school", role: body.loginRole || "Class Teacher", schoolId, staffId: String(record._id) });
  }
  return out;
}
async function ensureUser({ email, name, audience, role, schoolId, studentId, staffId }) {
  const lower = String(email).toLowerCase();
  const existing = await User.findOne({ email: lower, audience, schoolId });
  if (existing) return { created: false, email: lower };
  const tempPassword = Math.random().toString(36).slice(2, 10);
  await User.create({ email: lower, name, audience, role, schoolId, studentId: studentId || null, staffId: staffId || null, passwordHash: await User.hash(tempPassword) });
  return { created: true, email: lower, tempPassword };
}
