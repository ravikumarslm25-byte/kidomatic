import { modelFor } from "./resource.model.js";
import { AppError } from "../core/errors.js";
import { User } from "../models/user.model.js";

// What a parent / student may read, and how it's scoped. Portal is read-only.
const PORTAL_ACCESS = {
  students:           { scope: "student", field: "_id" },
  attendance:         { scope: "student", field: "studentId", nameFields: ["studentName"] },
  invoices:           { scope: "student", field: "studentId", nameFields: ["studentName", "student"] },
  payments:           { scope: "student", field: "studentId", nameFields: ["studentName", "student"] },
  studentConcessions: { scope: "student", field: "studentId", nameFields: ["studentName", "student"] },
  homework:           { scope: "class",   field: "klass" },
  timetable:          { scope: "class",   field: "klass" },
  subjects:           { scope: "class",   field: "klass" },
  exams:              { scope: "class",   field: "klass" },
  lessons:            { scope: "class",   field: "klass" },
  lmsLessons:         { scope: "class",   field: "klass" },
  reportCards:        { scope: "student", field: "studentId", nameFields: ["student", "studentName"] },
  communications:     { scope: "open" },
  events:             { scope: "open" },
  holidays:           { scope: "open" },
  posts:              { scope: "open" },
  postComments:       { scope: "open", writable: true },
  postLikes:          { scope: "open", writable: true },
  pollVotes:          { scope: "open", writable: true },
  routes:             { scope: "open" },
  vehicles:           { scope: "open" },
  drivers:            { scope: "open" },
  appSettings:        { scope: "open" },
  leaveTypes:         { scope: "open" },
  timingProfiles:     { scope: "open" },
  grading:            { scope: "open" },
  exams:              { scope: "class", field: "klass" },
  periods:            { scope: "open" },
  examMarks:          { scope: "student", field: "studentId", nameFields: ["studentName"] },
  supportTickets:     { scope: "self-tickets" },
  guardianLinks:      { scope: "self" },
};

async function linkedStudents(req) {
  if (req.user.audience === "student") {
    const S = modelFor("students");
    const me = req.user.studentId ? await S.findById(req.user.studentId).lean().catch(() => null) : null;
    return me ? [{ id: String(me._id), klass: me.klass, name: me.name }] : [];
  }
  const GL = modelFor("guardianLinks");
  const links = await GL.find({ parentUserId: req.user.id }).lean();
  if (links.length) return links.map((l) => ({ id: String(l.studentId), klass: l.klass, name: l.studentName }));
  // fallback: student-form login stored studentId on the user, no guardian link row
  const u = await User.findById(req.user.id).lean().catch(() => null);
  if (u?.studentId) {
    const S = modelFor("students");
    const st = await S.findById(u.studentId).lean().catch(() => null);
    if (st) return [{ id: String(st._id), klass: st.klass, name: st.name }];
  }
  return [];
}

export async function portalGuard(req, mode) {
  const aud = req.user?.audience;
  if (aud !== "parent" && aud !== "student") return {};
  const cfg = PORTAL_ACCESS[req.params.resource];
  if (!cfg) throw new AppError("This section isn't available in the portal", 403);
  if (mode === "write" && !cfg.writable) throw new AppError("The portal is read-only", 403);
  if (cfg.scope === "self") return { parentUserId: req.user.id };
  if (cfg.scope === "self-tickets") return { createdById: req.user.id };
  if (cfg.scope === "open") return {};

  const kids = await linkedStudents(req);
  const active = req.query.studentId ? String(req.query.studentId) : null;
  const chosen = active && kids.some((k) => k.id === active) ? kids.filter((k) => k.id === active) : kids;

  if (cfg.scope === "class") {
    const classes = [...new Set(chosen.map((k) => k.klass).filter(Boolean))];
    return { [cfg.field]: classes.length ? { $in: classes } : "__none__" };
  }
  // student scope — match by id OR by name (older invoices key on the student's name)
  const ids = chosen.map((k) => k.id).filter(Boolean);
  const names = chosen.map((k) => k.name).filter(Boolean);
  const ors = [];
  if (ids.length) ors.push({ [cfg.field]: { $in: ids } });
  (cfg.nameFields || []).forEach((nf) => { if (names.length) ors.push({ [nf]: { $in: names } }); });
  if (!ors.length) return { [cfg.field]: "__none__" };
  return ors.length === 1 ? ors[0] : { $or: ors };
}

// Ownership check used by the portal pay endpoint.
export async function assertOwnsStudent(req, studentId, studentName) {
  const kids = await linkedStudents(req);
  const link = kids.find((k) => k.id === String(studentId) || (studentName && k.name === studentName));
  return link || null;
}
