import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { School } from "../models/school.model.js";
import { AcademicYear } from "../models/academic-year.model.js";
import { User } from "../models/user.model.js";
import { Reseller } from "../models/reseller.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Transaction } from "../models/transaction.model.js";
import { Payout } from "../models/payout.model.js";
import { Offer } from "../models/offer.model.js";
import { PLANS } from "../config/plans.js";
import { commissionFor } from "../modules/billing/billing.logic.js";
import { RESOURCES } from "../config/resources.js";
import { modelFor } from "../modules/resource.model.js";
import { runWithContext } from "../core/tenancy/context.js";

(async () => {
  await connectDb();
  await mongoose.connection.dropDatabase();
  console.log("• cleared database");

  const school = await School.create({
    name: "Blue Lagoon International School", branch: "Salem Campus",
    board: "CBSE", session: "2026–27", resellerId: null, planKey: "pro", academicModel: "k12_preschool",
  });
  const schoolId = school.id;
  await AcademicYear.create({ schoolId, name: "2026\u201327", startDate: new Date("2026-06-01"), endDate: new Date("2027-04-30"), status: "active", isCurrent: true });
  await AcademicYear.create({ schoolId, name: "2025\u201326", startDate: new Date("2025-06-01"), endDate: new Date("2026-04-30"), status: "archived", isCurrent: false });

  const users = [
    { name: "Priya Menon", email: "principal@bluelagoon.edu", role: "Principal" },
    { name: "Ravi Prakash", email: "accountant@bluelagoon.edu", role: "Accountant" },
    { name: "Meera Krishnan", email: "teacher@bluelagoon.edu", role: "Class Teacher" },
  ];
  for (const u of users) {
    await User.create({ ...u, schoolId, resellerId: null, passwordHash: await User.hash("demo1234") });
  }
  console.log(`• created school + ${users.length} users (password: demo1234)`);

  // Platform (Master Admin) + a demo reseller with its own admin
  await User.create({ name: "HackGeniX Admin", email: "superadmin@juniorocto.com", audience: "platform", role: "Super Admin", passwordHash: await User.hash("demo1234") });
  const reseller = await Reseller.create({ name: "Acme EdTech", slug: "acme-edtech", referralCode: "acme-edtech", contactEmail: "ops@acme.edu", revenueSharePct: 20, commissionPct: 25 });
  await User.create({ name: "Acme Admin", email: "reseller@acme.edu", audience: "reseller", role: "Reseller Admin", resellerId: reseller.id, passwordHash: await User.hash("demo1234") });
  console.log("• created platform admin + reseller (Acme EdTech) + reseller admin");

  // Referred schools + subscriptions + transactions + payouts + an offer
  const pct = reseller.commissionPct;
  const referred = [
    { name: "Sunrise Public School", board: "CBSE", planKey: "pro" },
    { name: "Little Steps Preschool", board: "State", planKey: "growth" },
  ];
  const months = ["2026-05-03", "2026-06-03", "2026-07-03"];
  for (const r of referred) {
    const sc = await School.create({ name: r.name, board: r.board, session: "2026–27", resellerId: reseller.id, planKey: r.planKey, slug: r.name.toLowerCase().replace(/\s+/g, "-"), status: "active" });
    const amount = PLANS[r.planKey].priceMonthly;
    await Subscription.create({ resellerId: reseller.id, schoolId: sc.id, schoolName: r.name, planKey: r.planKey, amount, status: "active", referred: true, nextBillingAt: new Date("2026-08-03") });
    for (const d of months) {
      await Transaction.create({ resellerId: reseller.id, schoolId: sc.id, schoolName: r.name, amount, commission: commissionFor(amount, pct), type: "subscription", status: "success", txnRef: "TXN" + Math.random().toString(36).slice(2, 8).toUpperCase(), date: new Date(d) });
    }
  }
  const grossM = referred.reduce((a, r) => a + PLANS[r.planKey].priceMonthly, 0);
  const amtM = referred.reduce((a, r) => a + commissionFor(PLANS[r.planKey].priceMonthly, pct), 0);
  await Payout.create({ resellerId: reseller.id, period: "2026-05", gross: grossM, commissionPct: pct, amount: amtM, status: "paid", paidAt: new Date("2026-06-05") });
  await Payout.create({ resellerId: reseller.id, period: "2026-06", gross: grossM, commissionPct: pct, amount: amtM, status: "paid", paidAt: new Date("2026-07-05") });
  await Payout.create({ resellerId: reseller.id, period: "2026-07", gross: grossM, commissionPct: pct, amount: amtM, status: "pending" });
  await Offer.create({ resellerId: reseller.id, title: "New Year Onboarding", code: "NEWYEAR25", discountType: "percent", value: 25, status: "active", maxUses: 50, uses: 12 });
  console.log("• seeded 2 referred schools, 6 transactions, 3 payouts, 1 offer");

  // Seed resources inside the school's tenant context so every row is scoped.
  await runWithContext({ user: { role: "Seed" }, tenant: { schoolId, resellerId: null, branchId: null } }, async () => {
    let total = 0;
    // Seed rows can carry a short id ("ic2") that other rows point at (categoryId: "ic2").
    // The database assigns real ids on insert, so map short → real and rewrite those links.
    const realId = new Map();
    for (const [name, def] of Object.entries(RESOURCES)) {
      if (!def.seed?.length) continue;
      const rows = def.seed.map(({ id, ...row }) => {
        for (const [k, v] of Object.entries(row)) if (/Id$/.test(k) && realId.has(v)) row[k] = realId.get(v);
        return row;
      });
      const created = await modelFor(name).create(rows);
      def.seed.forEach((row, i) => { if (row.id) realId.set(row.id, String(created[i]._id)); });
      total += def.seed.length;
    }
    console.log(`• seeded ${total} records across resources`);
  });

  console.log("\n✓ Seed complete.\n  Login: principal@bluelagoon.edu / demo1234");
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
