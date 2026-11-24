import { sign, verify } from "../core/auth/jwt.js";
import { asyncHandler, AppError } from "../core/errors.js";
import { runWithContext } from "../core/tenancy/context.js";
import { modelFor } from "../modules/resource.model.js";

// Worlds skill signals → the ERP Skills & Milestones vocabulary
const WORLD_DOMAIN = { Cognitive: "Academics", Language: "Academics", Numeracy: "Academics", Literacy: "Academics", Physical: "Sports", Motor: "Sports", Social: "Life Skills", Emotional: "Life Skills", Creative: "Arts & Craft" };
const WORLD_LEVEL = { Emerging: "Emerging", Developing: "Developing", Achieved: "Proficient", Mastered: "Advanced" };
const LEVEL_PROGRESS = { Emerging: 25, Developing: 45, Proficient: 70, Advanced: 85, Expert: 100 };

// ── ERP issues a per-student launch token that KidoMatic Worlds carries ──
// GET /api/worlds/launch/:worldId?studentId=&studentName=&worldTitle=
export const issueLaunch = asyncHandler(async (req, res) => {
  const { worldId } = req.params;
  const { studentId, studentName, worldTitle } = req.query;
  if (!studentId || !studentName) throw new AppError("studentId and studentName are required", 400);
  const token = sign(
    { kind: "world-launch", worldId, worldTitle: worldTitle || worldId,
      studentId, studentName, schoolId: req.user.schoolId, resellerId: req.user.resellerId ?? null },
    { expiresIn: "2h" }
  );
  res.json({ data: { token, path: `/play/${worldId}?token=${token}` } });
});

// ── Worlds posts a completed session back here ──
// POST /api/worlds/results   (Authorization: Bearer <launch-token>)
// Writes Development milestones + a Portfolio entry, scoped to the school.
export const submitResult = asyncHandler(async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new AppError("Missing launch token", 401);
  let claim;
  try { claim = verify(token); } catch { throw new AppError("Invalid launch token", 401); }
  if (claim.kind !== "world-launch") throw new AppError("Not a launch token", 401);

  const { score, timeOnTask, skillSignals = [], homeworkId } = req.body || {};
  const tenant = { schoolId: claim.schoolId, resellerId: claim.resellerId ?? null, branchId: null };

  const result = await runWithContext({ user: { role: "System" }, tenant }, async () => {
    const Milestone = modelFor("milestones");
    const Portfolio = modelFor("portfolio");
    const Homework = modelFor("homework");

    // Upsert one milestone per skill signal for this child.
    let written = 0;
    for (const sig of skillSignals) {
      await Milestone.findOneAndUpdate(
        { child: claim.studentName, domain: sig.domain, skill: sig.skill },
        { $set: { level: sig.level, updated: new Date(), schoolId: claim.schoolId } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      written++;
    }

    // …and the same skills on the ERP's Skills & Milestones page, which reads `skills`
    // (linked to the student by id, with class/section) — in the ERP's own domain/level terms.
    const Skill = modelFor("skills");
    const stu = claim.studentId ? await modelFor("students").findById(claim.studentId).lean().catch(() => null) : null;
    let skills = 0;
    for (const sig of skillSignals) {
      const level = WORLD_LEVEL[sig.level] || "Developing";
      await Skill.findOneAndUpdate(
        { studentId: claim.studentId, skill: sig.skill },
        { $set: {
          studentName: claim.studentName, klass: stu?.klass, section: stu?.section,
          domain: WORLD_DOMAIN[sig.domain] || "Academics", level, progress: LEVEL_PROGRESS[level] ?? 50,
          notes: `From KidoMatic Worlds · ${claim.worldTitle}`, updatedAt: new Date().toISOString(), schoolId: claim.schoolId,
        } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      skills++;
    }

    // Portfolio evidence entry — uses the portfolio's own student fields
    // (studentId/studentName; a `child` field would be dropped by the schema).
    const mins = Number.isFinite(timeOnTask) ? Math.max(1, Math.round(timeOnTask / 60)) : null;
    await Portfolio.create({
      studentId: claim.studentId, studentName: claim.studentName,
      title: claim.worldTitle, type: "World", date: new Date(),
      notes: [Number.isFinite(score) ? `Score ${score}%` : null, mins ? `${mins} min` : null].filter(Boolean).join(" · ") || undefined,
    });

    // Optionally flip a linked homework to reviewed.
    let homeworkUpdated = false;
    if (homeworkId) {
      const hw = await Homework.findOneAndUpdate({ _id: homeworkId }, { $set: { status: "Reviewed" } }, { new: true });
      homeworkUpdated = !!hw;
    }

    return { milestones: written, skills, portfolio: 1, homeworkUpdated };
  });

  res.status(201).json({
    data: {
      accepted: true,
      student: claim.studentName,
      world: claim.worldTitle,
      score, timeOnTask,
      wrote: result,
    },
  });
});
