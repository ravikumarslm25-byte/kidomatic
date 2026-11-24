import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { School } from "../models/school.model.js";
import { AcademicYear } from "../models/academic-year.model.js";
import { User } from "../models/user.model.js";
import { modelFor } from "../modules/resource.model.js";
import { runWithContext } from "../core/tenancy/context.js";

// Additive seed: gives the parent mobile app something to log into.
// Creates a parent user + guardian link for a seeded student, plus that
// student's attendance / timetable / materials / fees / feed — all in the
// real ERP shapes, inside the school's tenant context.
// Run AFTER `npm run seed`.  ->  npm run seed:parent

const PARENT = { name: "Rahul Sharma", email: "parent@bluelagoon.edu", phone: "98450 11223", pass: "demo1234" };

const iso = (d) => new Date(d).toISOString();
const daysAgo = (h) => iso(Date.now() - h * 3.6e6);

(async () => {
  await connectDb();

  const school = (await School.findOne({ resellerId: null })) || (await School.findOne({}));
  if (!school) { console.log("No school found — run `npm run seed` first."); await mongoose.disconnect(); process.exit(0); }
  const schoolId = school.id;
  const ay = await AcademicYear.findOne({ schoolId, isCurrent: true });
  const ayId = ay?.id || null;

  // Parent user (idempotent on the unique {email,audience,schoolId} index)
  let parent = await User.findOne({ email: PARENT.email, audience: "parent", schoolId });
  if (!parent) {
    parent = await User.create({
      name: PARENT.name, email: PARENT.email, audience: "parent", role: "Parent",
      schoolId, passwordHash: await User.hash(PARENT.pass),
    });
  }

  await runWithContext({ user: { role: "Seed" }, tenant: { schoolId, resellerId: null, branchId: null } }, async () => {
    const Students = modelFor("students");
    const child = (await Students.findOne({ name: "Aarav Sharma" })) || (await Students.findOne({}));
    if (!child) { console.log("No students seeded — run `npm run seed` first."); return; }
    const sid = child.id;
    const klass = child.klass, section = child.section || "";

    // clean prior demo artifacts for this child (safe: demo data only)
    for (const r of ["guardianLinks", "attendance", "invoices", "payments"]) {
      await modelFor(r).deleteMany(r === "guardianLinks" ? { studentId: sid } : { studentId: sid });
    }
    await modelFor("timetable").deleteMany({ klass, section });
    await modelFor("posts").deleteMany({ createdBy: "seed-parent" });

    // link parent -> child
    await modelFor("guardianLinks").create({
      parentUserId: parent.id, parentName: PARENT.name, parentEmail: PARENT.email, phone: PARENT.phone,
      studentId: sid, studentName: child.name, klass, section, relationship: "Father",
      isPrimary: true, canPay: true, createdAt: iso(Date.now()),
    });

    // attendance — weekdays of the current month up to today (codes P/A/L)
    const now = new Date(), y = now.getFullYear(), mo = now.getMonth();
    const rows = [];
    for (let d = 1; d <= now.getDate(); d++) {
      const dt = new Date(y, mo, d), wd = dt.getDay();
      if (wd === 0 || wd === 6) continue; // skip weekends
      let code = "P";
      if (d % 11 === 0) code = "A";
      else if (d % 7 === 0) code = "L";
      rows.push({ studentId: sid, studentName: child.name, klass, section, academicYearId: ayId,
        date: dt.toISOString().slice(0, 10), morning: code, afternoon: code,
        markedBy: "Meera Krishnan", markedAt: iso(dt) });
    }
    if (rows.length) await modelFor("attendance").create(rows);

    // timetable — grid keyed "{dayIdx}-{slotIdx}" over Mon-Fri, default slots
    // period slot indices in the default day are 0,1,3,4,6,7 (2=Break,5=Lunch)
    const subj = [
      ["Mathematics", "Ms. Priya"], ["English", "Mr. Anand"], ["Science", "Ms. Divya"],
      ["Social", "Mr. Rao"], ["Computer", "Ms. Kavya"], ["Art", "Ms. Leela"],
    ];
    const periodSlots = [0, 1, 3, 4, 6, 7];
    const grid = {};
    for (let di = 0; di < 5; di++) {
      periodSlots.forEach((si, k) => {
        const [s, t] = subj[(di + k) % subj.length];
        grid[`${di}-${si}`] = { subject: s, teacher: t };
      });
    }
    await modelFor("timetable").create({ klass, section, academicYearId: ayId, grid });

    // materials — lmsLessons for the class
    await modelFor("lmsLessons").deleteMany({ klass, createdBy: "seed-parent" });
    await modelFor("lmsLessons").create([
      { title: "Fractions — Basics", klass, subject: "Mathematics", type: "video", videoUrl: "https://example.com/1", duration: 8, status: "Published", order: 0, createdBy: "seed-parent" },
      { title: "Adding Fractions", klass, subject: "Mathematics", type: "video", videoUrl: "https://example.com/2", duration: 12, status: "Published", order: 1, createdBy: "seed-parent" },
      { title: "Revision Notes", klass, subject: "Mathematics", type: "pdf", attachment: { name: "ch4.pdf" }, duration: 0, status: "Published", order: 2, createdBy: "seed-parent" },
    ]);

    // fees — one partial invoice + a receipt for the paid part
    const inv = await modelFor("invoices").create({
      invoiceNo: "INV-2601", studentId: sid, studentName: child.name, admissionNo: child.admissionNo,
      klass, section, academicYear: ay?.name || "2026–27",
      items: [{ label: "Term 2 Tuition", amount: 27500 }],
      subtotal: 27500, discount: 0, concession: 0, total: 27500, paid: 15000, balance: 12500,
      dueDate: new Date(y, mo, 28), status: "Partial", createdAt: iso(Date.now()),
    });
    await modelFor("payments").create({
      receiptNo: "RCPT-2601", invoiceId: inv.id, invoiceNo: "INV-2601", studentId: sid, studentName: child.name,
      amount: 15000, mode: "UPI", reference: "UPI-DEMO", note: "Term 2 first instalment",
      date: iso(new Date(y, mo, 5)), receivedBy: "Ravi Prakash",
    });

    // feed — one pinned school post with media + one class poll
    const p1 = await modelFor("posts").create({
      authorName: school.name, authorRole: "Admin", kind: "post",
      text: "Highlights from our Independence Day celebration 🇮🇳",
      media: [{ url: "https://example.com/a.jpg" }, { url: "https://example.com/b.jpg" }, { url: "https://example.com/c.jpg" }, { url: "https://example.com/d.jpg" }],
      audience: "all", pinned: true, allowComments: true, status: "Published",
      shareCount: 3, createdBy: "seed-parent", createdAt: daysAgo(2), publishedAt: daysAgo(2),
    });
    const p2 = await modelFor("posts").create({
      authorName: "Meera Krishnan", authorRole: "Class Teacher", kind: "poll",
      text: "Which day works best for the PTM?",
      pollOptions: [{ id: "o1", label: "Saturday" }, { id: "o2", label: "Friday" }],
      pollMultiple: false, audience: "parents", pinned: false, allowComments: true,
      status: "Published", createdBy: "seed-parent", createdAt: daysAgo(5), publishedAt: daysAgo(5),
    });
    // a few likes/comments/poll votes for realism — by real seeded accounts (the parent
    // + school staff), so every reaction links to a user that exists
    const teacher = await User.findOne({ email: "teacher@bluelagoon.edu", schoolId });
    const accountant = await User.findOne({ email: "accountant@bluelagoon.edu", schoolId });
    const who = (u, fallbackName) => ({ userId: u ? u.id : parent.id, userName: u?.name || fallbackName });
    await modelFor("postLikes").create([
      { postId: p1.id, userId: parent.id, userName: PARENT.name },
      { postId: p1.id, ...who(teacher, "Class Teacher") },
    ]);
    await modelFor("postComments").create([
      { postId: p1.id, ...who(teacher, "Class Teacher"), userRole: teacher?.role || "Class Teacher", text: "Lovely!", createdAt: daysAgo(1) },
    ]);
    await modelFor("pollVotes").create([
      { postId: p2.id, optionId: "o1", userId: parent.id },
      ...(teacher ? [{ postId: p2.id, optionId: "o1", userId: teacher.id }] : []),
      ...(accountant ? [{ postId: p2.id, optionId: "o2", userId: accountant.id }] : []),
    ]);

    console.log(`• linked ${PARENT.name} -> ${child.name} (${klass}${section ? "-" + section : ""})`);
    console.log(`• seeded attendance(${rows.length}) · timetable · materials(3) · 1 invoice + 1 receipt · 2 posts`);
  });

  console.log("\n\u2713 Parent seed complete.");
  console.log(`  Parent login: ${PARENT.email} / ${PARENT.pass}`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
