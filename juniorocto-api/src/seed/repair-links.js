import mongoose from "mongoose";
import { connectDb } from "../config/db.js";

// Repairs broken links in an existing database WITHOUT dropping anything.
// Safe to run more than once — it only adds what is missing and fixes bad references.
//   npm run repair:links            (add --dry to only report)
//  • classes:   creates any class a student / homework / lesson / attendance / timetable uses but that doesn't exist
//  • parents:   creates a parent record for every student whose parent has none
//  • inventory: points sub-categories at their real category (they held seed ids like "ic2")
//  • feed:      re-points likes / comments / poll votes from made-up user ids to real users
const dry = process.argv.includes("--dry");
const now = new Date();
const log = (...a) => console.log(dry ? "  [dry]" : "  ", ...a);

(async () => {
  await connectDb();
  const db = mongoose.connection.db;
  const col = (n) => db.collection(n);
  const insert = async (n, docs) => { if (docs.length && !dry) await col(n).insertMany(docs.map((d) => ({ ...d, resellerId: d.resellerId ?? null, branchId: null, createdAt: now, updatedAt: now }))); };

  // 1) classes
  const classes = await col("classes").find({}).toArray();
  const have = new Set(classes.map((c) => `${c.schoolId}|${c.name}`));
  const need = new Map();
  for (const n of ["students", "homeworks", "lessons", "lmslessons", "attendances", "timetables"]) {
    for (const d of await col(n).find({ klass: { $exists: true, $ne: "" } }).toArray()) {
      const key = `${d.schoolId}|${d.klass}`;
      if (have.has(key)) continue;
      const e = need.get(key) || { schoolId: d.schoolId, name: d.klass, sections: new Set() };
      if (d.section) e.sections.add(d.section);
      need.set(key, e);
    }
  }
  const newClasses = [...need.values()].map((e) => ({ schoolId: e.schoolId, name: e.name, sections: [...(e.sections.size ? e.sections : new Set(["A"]))].sort().join(", "), model: /nursery|lkg|ukg/i.test(e.name) ? "Early Years" : "K-12" }));
  await insert("classes", newClasses);
  log(`classes: +${newClasses.length}`, newClasses.map((c) => `${c.name} (${c.sections})`).join(", "));

  // 2) parent records
  const parents = await col("parents").find({}).toArray();
  const parentNames = new Set(parents.map((p) => `${p.schoolId}|${p.name}`));
  const newParents = (await col("students").find({ parent: { $exists: true, $ne: "" } }).toArray())
    .filter((s) => !parentNames.has(`${s.schoolId}|${s.parent}`))
    .map((s) => ({ schoolId: s.schoolId, resellerId: s.resellerId ?? null, name: s.parent, relation: "Parent", children: s.name, phone: s.phone || "" }));
  await insert("parents", newParents);
  log(`parents: +${newParents.length}`, newParents.map((p) => `${p.name} → ${p.children}`).join(", "));

  // 3) inventory sub-categories → real category (matched by category name within the school)
  const cats = await col("invcategories").find({}).toArray();
  const catId = new Map(cats.map((c) => [`${c.schoolId}|${c.name}`, String(c._id)]));
  const catIds = new Set(cats.map((c) => String(c._id)));
  let fixedSubs = 0, unmatched = 0;
  for (const s of await col("invsubcategories").find({}).toArray()) {
    if (catIds.has(String(s.categoryId))) continue;
    const real = catId.get(`${s.schoolId}|${s.categoryName}`);
    if (!real) { unmatched++; continue; }
    if (!dry) await col("invsubcategories").updateOne({ _id: s._id }, { $set: { categoryId: real, updatedAt: now } });
    fixedSubs++;
  }
  log(`inventory sub-categories re-linked: ${fixedSubs}${unmatched ? ` (${unmatched} with no matching category name)` : ""}`);

  // 4) feed reactions by users that don't exist → real school users (parent first, then staff)
  const users = await col("users").find({}).toArray();
  const userIds = new Set(users.map((u) => String(u._id)));
  let fixedReactions = 0;
  for (const n of ["postlikes", "postcomments", "pollvotes"]) {
    for (const r of await col(n).find({}).toArray()) {
      if (userIds.has(String(r.userId))) continue;
      const taken = new Set((await col(n).find({ postId: r.postId }).toArray()).map((x) => String(x.userId)));
      const pool = users.filter((u) => String(u.schoolId) === String(r.schoolId) && ["parent", "school"].includes(u.audience || "school"))
        .sort((a, b) => (a.audience === "parent" ? -1 : 0) - (b.audience === "parent" ? -1 : 0));
      const u = pool.find((x) => !taken.has(String(x._id)));
      if (!u) continue;
      if (!dry) await col(n).updateOne({ _id: r._id }, { $set: { userId: String(u._id), ...(r.userName ? { userName: u.name } : {}), updatedAt: now } });
      fixedReactions++;
    }
  }
  log(`feed reactions re-linked to real users: ${fixedReactions}`);

  console.log(dry ? "\nDry run — nothing was changed." : "\n✓ Links repaired. No data was removed.");
  await mongoose.disconnect();
})().catch(async (e) => { console.error("✗", e.message); await mongoose.disconnect(); process.exit(1); });
