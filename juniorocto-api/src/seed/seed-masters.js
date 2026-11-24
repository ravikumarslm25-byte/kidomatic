import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { School } from "../models/school.model.js";
import { RESOURCES } from "../config/resources.js";
import { modelFor } from "../modules/resource.model.js";
import { runWithContext } from "../core/tenancy/context.js";

// Master/reference resources that are safe to seed additively.
// Each is inserted ONLY when its collection is empty for the tenant — so
// re-running this never duplicates rows and never touches your real data.
const MASTERS = [
  "accountHeads", "cashAccounts", "vendors", "concessions",
  "invCategories", "invSubCategories",
  "commTemplates",
  "roles",
];

(async () => {
  await connectDb();
  console.log("• connected — additive master seed (no database drop)\n");

  // Main tenant schools (referred schools sit under a reseller and are skipped)
  let schools = await School.find({ resellerId: null });
  if (!schools.length) schools = await School.find({});
  if (!schools.length) { console.log("No schools found — run the full `npm run seed` first."); await mongoose.disconnect(); process.exit(0); }

  for (const school of schools) {
    await runWithContext({ user: { role: "Seed" }, tenant: { schoolId: school.id, resellerId: null, branchId: null } }, async () => {
      let added = 0;
      console.log(`▸ ${school.name}`);
      for (const name of MASTERS) {
        const def = RESOURCES[name];
        if (!def?.seed?.length) continue;
        const Model = modelFor(name);
        const existing = await Model.countDocuments();
        if (existing > 0) { console.log(`    ${name}: ${existing} already present — skipped`); continue; }
        await Model.create(def.seed);
        added += def.seed.length;
        console.log(`    ${name}: + ${def.seed.length} seeded`);
      }
      console.log(`  ✓ ${added} records added\n`);
    });
  }

  console.log("✓ Additive seed complete. Existing data untouched.");
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
