// Full end-to-end test against a REAL MongoDB.
//   1) docker compose up -d mongo   (or run local mongod)
//   2) MONGO_URI=mongodb://127.0.0.1:27017/juniorocto_test node test/e2e.mjs
import mongoose from "mongoose";
import { connectDb } from "../src/config/db.js";
import { School } from "../src/models/school.model.js";
import { User } from "../src/models/user.model.js";
import { Reseller } from "../src/models/reseller.model.js";
import { RESOURCES } from "../src/config/resources.js";
import { modelFor } from "../src/modules/resource.model.js";
import { runWithContext } from "../src/core/tenancy/context.js";
import { createApp } from "../src/app.js";

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/juniorocto_test";
let pass = 0, fail = 0;
const check = (n, c, e = "") => { c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, e)); };

await connectDb(uri);
await mongoose.connection.dropDatabase();

const school = await School.create({ name: "Blue Lagoon", board: "CBSE", session: "2026-27", resellerId: null, planKey: "pro" });
const school2 = await School.create({ name: "Other School", resellerId: null });
await User.create({ name: "Priya", email: "principal@bluelagoon.edu", role: "Principal", schoolId: school.id, passwordHash: await User.hash("demo1234") });
await User.create({ name: "Acc", email: "acc@bluelagoon.edu", role: "Accountant", schoolId: school.id, passwordHash: await User.hash("demo1234") });
await User.create({ name: "Root", email: "superadmin@juniorocto.com", audience: "platform", role: "Super Admin", passwordHash: await User.hash("demo1234") });
const reseller = await Reseller.create({ name: "Acme EdTech", slug: "acme-" + Date.now(), revenueSharePct: 20 });
await User.create({ name: "Acme Admin", email: "reseller@acme.edu", audience: "reseller", role: "Reseller Admin", resellerId: reseller.id, passwordHash: await User.hash("demo1234") });
await runWithContext({ tenant: { schoolId: school.id, resellerId: null, branchId: null } }, async () => {
  for (const [n, d] of Object.entries(RESOURCES)) if (d.seed?.length) await modelFor(n).create(d.seed);
});
await runWithContext({ tenant: { schoolId: school2.id, resellerId: null, branchId: null } }, async () => {
  await modelFor("students").create([{ admissionNo: "X1", name: "Other Kid", klass: "Grade 1", section: "A", parent: "P", phone: "0", status: "Active" }]);
});

const app = createApp(); const server = app.listen(4097); const base = "http://127.0.0.1:4097";
const j = async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) });

let r = await j(await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "principal@bluelagoon.edu", password: "demo1234" }) }));
check("login → 200 + token", r.status === 200 && !!r.body.data?.token);
const auth = { Authorization: "Bearer " + r.body.data.token };

r = await j(await fetch(base + "/api/students", { headers: auth }));
check("GET /students scoped (8, not school2's)", r.body.data?.length === 8);

r = await j(await fetch(base + "/api/students?q=aarav", { headers: auth }));
check("search ?q=aarav", r.body.data?.length === 1 && r.body.data[0].name === "Aarav Sharma");

r = await j(await fetch(base + "/api/students", { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ admissionNo: "ADM9999", name: "Test Child", klass: "UKG", section: "A", parent: "P", phone: "1", status: "Active" }) }));
check("POST /students → 201 + schoolId stamped", r.status === 201 && !!r.body.data?.schoolId);
const id = r.body.data.id;

r = await j(await fetch(base + "/api/students/" + id, { method: "PATCH", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ status: "Inactive" }) }));
check("PATCH /students/:id", r.body.data?.status === "Inactive");

let ar = await j(await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "acc@bluelagoon.edu", password: "demo1234" }) }));
r = await j(await fetch(base + "/api/students", { method: "POST", headers: { Authorization: "Bearer " + ar.body.data.token, "Content-Type": "application/json" }, body: "{}" }));
check("RBAC accountant POST /students → 403", r.status === 403);

r = await j(await fetch(base + "/api/worlds/launch/count-sea-friends?studentId=stu1&studentName=Vihaan%20Reddy&worldTitle=Count%20the%20Sea%20Friends", { headers: auth }));
check("GET /worlds/launch → token", r.status === 200 && !!r.body.data?.token);
const launch = r.body.data.token;

r = await j(await fetch(base + "/api/worlds/results", { method: "POST", headers: { Authorization: "Bearer " + launch, "Content-Type": "application/json" }, body: JSON.stringify({ score: 100, timeOnTask: 42, skillSignals: [{ domain: "Cognitive", skill: "Counts 1-5", level: "Achieved" }, { domain: "Fine Motor", skill: "Taps targets", level: "Achieved" }] }) }));
check("POST /worlds/results → wrote milestones+portfolio", r.status === 201 && r.body.data?.wrote?.milestones === 2 && r.body.data?.wrote?.portfolio === 1);

r = await j(await fetch(base + "/api/milestones?q=Vihaan", { headers: auth }));
check("write-back landed in /milestones", r.body.data?.length >= 2);
r = await j(await fetch(base + "/api/portfolio?q=Vihaan", { headers: auth }));
check("write-back landed in /portfolio", r.body.data?.some((p) => p.type === "World"));

// ── Phase A: multi-audience auth + provisioning ──
let pl = await j(await fetch(base + "/api/auth/platform/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "superadmin@juniorocto.com", password: "demo1234" }) }));
check("platform login → token + audience", pl.status === 200 && pl.body.data?.user?.audience === "platform");
const platAuth = { Authorization: "Bearer " + pl.body.data.token };

r = await j(await fetch(base + "/api/platform/resellers", { headers: auth }));
check("audience: school token → platform route 403", r.status === 403);

r = await j(await fetch(base + "/api/platform/summary", { headers: platAuth }));
check("platform summary sees all schools + students", r.body.data?.schools >= 2 && r.body.data?.students > 0, JSON.stringify(r.body.data));

r = await j(await fetch(base + "/api/platform/schools", { method: "POST", headers: { ...platAuth, "Content-Type": "application/json" }, body: JSON.stringify({ name: "Acme Public School", resellerId: reseller.id, planKey: "growth" }) }));
check("platform creates school under reseller", r.status === 201 && r.body.data?.resellerId === reseller.id);

let rl = await j(await fetch(base + "/api/auth/reseller/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "reseller@acme.edu", password: "demo1234" }) }));
check("reseller login → token", rl.status === 200 && !!rl.body.data?.token);
const resAuth = { Authorization: "Bearer " + rl.body.data.token };

r = await j(await fetch(base + "/api/reseller/schools", { headers: resAuth }));
check("reseller sees ONLY its schools (not Blue Lagoon)", r.body.data?.every((x) => x.resellerId === reseller.id) && !r.body.data?.some((x) => x.name === "Blue Lagoon"));

r = await j(await fetch(base + "/api/reseller/schools", { method: "POST", headers: { ...resAuth, "Content-Type": "application/json" }, body: JSON.stringify({ name: "Acme Two", planKey: "starter" }) }));
check("reseller creates a school", r.status === 201);
const sid = r.body.data.id;

r = await j(await fetch(base + "/api/reseller/schools/" + sid + "/branches", { method: "POST", headers: { ...resAuth, "Content-Type": "application/json" }, body: JSON.stringify({ name: "Main Campus" }) }));
check("branch #1 on starter → 201", r.status === 201);
r = await j(await fetch(base + "/api/reseller/schools/" + sid + "/branches", { method: "POST", headers: { ...resAuth, "Content-Type": "application/json" }, body: JSON.stringify({ name: "Annex" }) }));
check("branch #2 on starter → 402 (plan limit)", r.status === 402);

r = await j(await fetch(base + "/api/reseller/schools/" + school.id, { method: "PATCH", headers: { ...resAuth, "Content-Type": "application/json" }, body: JSON.stringify({ name: "hacked" }) }));
check("reseller cannot touch a platform-direct school → 404", r.status === 404);

// ── Fees domain: generate → dues → part-pay → full-pay → dashboard ──
r = await j(await fetch(base + "/api/fees/invoices/generate", { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ term: "Term 1" }) }));
check("fees/generate creates invoices", r.status === 201 && r.body.data?.created >= 1, JSON.stringify(r.body.data));
r = await j(await fetch(base + "/api/fees/dues?student=" + encodeURIComponent("Kabir Khan"), { headers: auth }));
check("dues returns unpaid invoice", !!r.body.data?.id && r.body.data.status !== "Paid");
const invId = r.body.data.id, total = r.body.data.total;
r = await j(await fetch(base + "/api/fees/invoices/" + invId + "/pay", { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ amount: Math.floor(total / 2), mode: "UPI" }) }));
check("part payment → Partial + receipt", r.status === 201 && r.body.data?.invoice?.status === "Partial" && !!r.body.data?.receipt?.receiptNo);
r = await j(await fetch(base + "/api/fees/invoices/" + invId + "/pay", { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ amount: total, mode: "Card" }) }));
check("remainder clamps → Paid, balance 0", r.body.data?.invoice?.status === "Paid" && r.body.data?.invoice?.balance === 0);
r = await j(await fetch(base + "/api/dashboard/summary", { headers: auth }));
check("dashboard summary aggregates", r.body.data?.totalStudents === 8 && r.body.data?.feesCollectedMTD > 0 && r.body.data?.outstanding > 0, JSON.stringify(r.body.data));

r = await j(await fetch(base + "/api/students"));
check("no token → 401", r.status === 401);

server.close(); await mongoose.disconnect();
console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
