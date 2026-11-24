// No-DB verification: app boot, auth guard, tenant context, RBAC, routing,
// model factory. (DB-backed CRUD is covered by test/e2e.mjs against real Mongo.)
import { createApp } from "../src/app.js";
import { sign } from "../src/core/auth/jwt.js";
import { can } from "../src/core/rbac/roles.js";
import { runWithContext, getTenant } from "../src/core/tenancy/context.js";
import { modelFor } from "../src/modules/resource.model.js";

const app = createApp();
const server = app.listen(4098);
const base = "http://127.0.0.1:4098";
const j = async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) });
let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, extra)); };

let r = await j(await fetch(base + "/api/health"));
check("health → 200 + ok", r.status === 200 && r.body.ok === true);

r = await j(await fetch(base + "/api/students"));
check("no token → 401", r.status === 401);

const principal = sign({ id: "u1", role: "Principal", schoolId: "sch1", resellerId: null });
r = await j(await fetch(base + "/api/nonsense", { headers: { Authorization: "Bearer " + principal } }));
check("unknown resource → 404", r.status === 404);

const acc = sign({ id: "u2", role: "Accountant", schoolId: "sch1" });
r = await j(await fetch(base + "/api/students", { method: "POST", headers: { Authorization: "Bearer " + acc, "Content-Type": "application/json" }, body: "{}" }));
check("RBAC: accountant POST /students → 403", r.status === 403, r.body.error);

check("can(): principal write students", can("Principal", "write", "students") === true);
check("can(): accountant write students = false", can("Accountant", "write", "students") === false);
check("can(): accountant write invoices = true", can("Accountant", "write", "invoices") === true);
check("can(): teacher write milestones = true", can("Class Teacher", "write", "milestones") === true);

runWithContext({ tenant: { schoolId: "S9" } }, () => check("tenant context propagates", getTenant().schoolId === "S9"));

r = await j(await fetch(base + "/api/dashboard/summary"));
check("dashboard/summary no token → 401", r.status === 401);
r = await j(await fetch(base + "/api/fees/invoices/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }));
check("fees/generate no token → 401", r.status === 401);
const teacher = sign({ id: "u3", role: "Class Teacher", schoolId: "sch1" });
r = await j(await fetch(base + "/api/fees/invoices/generate", { method: "POST", headers: { Authorization: "Bearer " + teacher, "Content-Type": "application/json" }, body: "{}" }));
check("RBAC: teacher fees/generate → 403", r.status === 403, r.body.error);

// ── Phase A: audience separation + plan gating ──
const schoolTok = sign({ id: "s1", audience: "school", role: "Principal", schoolId: "sch1", planKey: "starter" });
r = await j(await fetch(base + "/api/platform/resellers", { headers: { Authorization: "Bearer " + schoolTok } }));
check("audience: school token → platform route 403", r.status === 403);
r = await j(await fetch(base + "/api/reseller/schools", { headers: { Authorization: "Bearer " + schoolTok } }));
check("audience: school token → reseller route 403", r.status === 403);
const resTok = sign({ id: "r1", audience: "reseller", role: "Reseller Admin", resellerId: "res1" });
r = await j(await fetch(base + "/api/platform/resellers", { headers: { Authorization: "Bearer " + resTok } }));
check("audience: reseller token → platform route 403", r.status === 403);
// school data stays with school accounts (a reseller / platform token has no school of its own)
const adminTok = sign({ id: "p1", audience: "platform", role: "Super Admin" });
for (const [who, tok] of [["reseller", resTok], ["platform", adminTok]]) {
  for (const path of ["/api/students", "/api/invoices", "/api/fees/dues", "/api/dashboard/summary", "/api/uploads/sign-get", "/api/branding"]) {
    r = await j(await fetch(base + path, { headers: { Authorization: "Bearer " + tok } }));
    check(`audience: ${who} token → ${path} 403`, r.status === 403, r.status);
  }
}
r = await j(await fetch(base + "/api/worlds/launch/count-sea-friends?studentId=s&studentName=Kid", { headers: { Authorization: "Bearer " + schoolTok } }));
check("plan gate: starter → worlds launch 402", r.status === 402);
const proTok = sign({ id: "s2", audience: "school", role: "Principal", schoolId: "sch1", planKey: "pro" });
r = await j(await fetch(base + "/api/worlds/launch/count-sea-friends?studentId=s&studentName=Kid", { headers: { Authorization: "Bearer " + proTok } }));
check("plan gate: pro → worlds launch 200 + token", r.status === 200 && !!r.body.data?.token);

// ── Business portal: audience + public register validation ──
r = await j(await fetch(base + "/api/reseller/revenue", { headers: { Authorization: "Bearer " + schoolTok } }));
check("audience: school token → reseller/revenue 403", r.status === 403);
r = await j(await fetch(base + "/api/reseller/subscriptions", { headers: { Authorization: "Bearer " + schoolTok } }));
check("audience: school token → reseller/subscriptions 403", r.status === 403);
r = await j(await fetch(base + "/api/public/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }));
check("public register without ref → 400", r.status === 400);
r = await j(await fetch(base + "/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }));
check("change-password without token → 401", r.status === 401);
r = await j(await fetch(base + "/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "x@y.z" }) }));
check("forgot-password → 200 ok", r.status === 200 && r.body.data?.ok === true);

// ── Billing models / licences ──
r = await j(await fetch(base + "/api/platform/licenses", { headers: { Authorization: "Bearer " + schoolTok } }));
check("audience: school token → platform/licenses 403", r.status === 403);
const platTok = sign({ id: "p1", audience: "platform", role: "Super Admin" });
r = await j(await fetch(base + "/api/platform/sales", { method: "POST", headers: { Authorization: "Bearer " + platTok, "Content-Type": "application/json" }, body: JSON.stringify({ model: "bogus" }) }));
check("sales with unknown model → 400", r.status === 400);

// ── Payments / self-serve checkout ──
r = await j(await fetch(base + "/api/payments/webhook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "payment.captured" }) }));
check("webhook without signature → 400", r.status === 400);
r = await j(await fetch(base + "/api/public/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }));
check("checkout without fields → 400", r.status === 400);
r = await j(await fetch(base + "/api/public/checkout/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }));
check("checkout verify without invoice → 400", r.status === 400);

// ── White-label branding ──
r = await j(await fetch(base + "/api/branding"));
check("branding requires auth → 401", r.status === 401);

// ── Multi-year ──
const parentTok = sign({ id: "pa1", audience: "parent", role: "Parent", schoolId: "sch1" });
r = await j(await fetch(base + "/api/years", { headers: { Authorization: "Bearer " + parentTok } }));
check("years: parent BLOCKED (not staff) → 403", r.status === 403);
r = await j(await fetch(base + "/api/years/rollover", { method: "POST", headers: { Authorization: "Bearer " + parentTok, "Content-Type": "application/json" }, body: "{}" }));
check("years: parent BLOCKED from rollover → 403", r.status === 403);
r = await j(await fetch(base + "/api/years", { method: "POST", headers: { Authorization: "Bearer " + schoolTok, "Content-Type": "application/json" }, body: "{}" }));
check("create year without name → 400", r.status === 400);

// ── Uploads (S3 presign) ──
r = await j(await fetch(base + "/api/uploads/presign", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }));
check("uploads: presign requires auth → 401", r.status === 401);
r = await j(await fetch(base + "/api/uploads/presign", { method: "POST", headers: { Authorization: "Bearer " + schoolTok, "Content-Type": "application/json" }, body: JSON.stringify({ fileName: "a.png" }) }));
check("uploads: presign w/o S3 config → 503", r.status === 503);


const M = modelFor("students");
const paths = Object.keys(M.schema.paths);
check("model has tenant fields (schoolId/resellerId/branchId)", ["schoolId", "resellerId", "branchId"].every((f) => paths.includes(f)));
check("model has declared fields", ["admissionNo", "name", "klass", "status"].every((f) => paths.includes(f)));
const js = new M({ _id: "000000000000000000000001", name: "X" }).toJSON();
check("toJSON maps _id→id and strips __v", js.id != null && js._id === undefined && js.__v === undefined);

server.close();
console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
