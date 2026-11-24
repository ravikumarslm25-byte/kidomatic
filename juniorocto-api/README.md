# KidoMatic — School ERP API

Multi-tenant **Express + MongoDB** backend for the KidoMatic ERP (Phase 0 foundation).
Serves the ERP frontend and the KidoMatic Worlds write-back — flip `VITE_USE_MOCK=false`
on either frontend and it just works.

## Run

```bash
# with Docker (Mongo + API)
docker compose up --build

# or locally (needs MongoDB running)
npm install
cp .env.example .env
npm run seed      # creates a school + users + demo data
npm run dev       # http://localhost:4000
```

Demo login: **principal@bluelagoon.edu / demo1234** (also `accountant@…`, `teacher@…`).

## Tests

```bash
npm run test:wiring   # no DB — boot, auth, RBAC, tenancy, routing (12 checks)
MONGO_URI=mongodb://127.0.0.1:27017/juniorocto_test npm run test:e2e   # full CRUD + Worlds write-back
```

## API contract (what the frontends call)

```
POST   /api/auth/login            { email, password } → { data: { token, user } }
GET    /api/auth/me               (Bearer) → { data: user }

GET    /api/:resource?q=          (Bearer) → { data: [...] }     # tenant-scoped
POST   /api/:resource             (Bearer) → { data: row }
PATCH  /api/:resource/:id         (Bearer) → { data: row }
DELETE /api/:resource/:id         (Bearer) → { data: { id } }

GET    /api/worlds/launch/:worldId?studentId=&studentName=&worldTitle=   (Bearer, staff)
                                  → { data: { token, path } }    # per-student launch token
POST   /api/worlds/results        (Bearer <launch-token>)        # Worlds → ERP write-back
                                  { score, timeOnTask, skillSignals:[{domain,skill,level}] }
```

`:resource` is any key in `src/config/resources.js` (students, invoices, enquiries, staff,
milestones, portfolio, …). Records return `id` (not `_id`).

## Architecture

```
src/
  config/      env · db · resources (registry: fields + seed)
  core/
    tenancy/   context (AsyncLocalStorage) · plugin (auto-scope) · —
    auth/      jwt · user login/me · requireAuth middleware
    rbac/      scoped role→permission matrix + guard
    errors.js  AppError + asyncHandler + errorHandler
  models/      user · school (tenants)
  modules/     resource.model (factory) · controller (generic CRUD) · routes
  worlds/      launch-token issue + results write-back
  seed/        seed.js
  app.js       route assembly     server.js  boot
```

**Multi-tenancy is enforced structurally.** `core/tenancy/plugin.js` is applied to every
resource model: on write it stamps `resellerId / schoolId / branchId`; on every
read/update/delete it injects a `schoolId` filter read from the per-request
`AsyncLocalStorage` context (set from the JWT). A developer cannot write an unscoped query
for tenant data. The E2E test proves School A never sees School B's students.

**Worlds write-back.** A staff member issues a per-student launch token; KidoMatic Worlds
carries it, and on completion posts `skillSignals` back. The endpoint upserts **Development
milestones** and adds a **Portfolio** entry (and can flip a linked homework), all scoped to
the school — feeding the AI early-flag engine with real interaction data.

## Add a resource

Add a block to `src/config/resources.js` (`fields` + optional `seed`/`search`). The model,
CRUD routes, search, and tenant scoping are generated automatically.

Powered by HackGeniX.

## Phase 1 — Fees & Dashboard (domain logic)

Beyond generic CRUD, the fees domain and dashboard aggregates are real:

```
POST /api/fees/invoices/generate  { term }        → creates Due invoices for active
                                                     students from the fee structure
GET  /api/fees/dues?student=NAME                  → latest unpaid/partial invoice
GET  /api/fees/invoices/:id                        → invoice + its payments
POST /api/fees/invoices/:id/pay   { amount, mode } → records payment, updates
                                                     paid/balance/status, issues receipt
GET  /api/dashboard/summary                        → students, fees collected (MTD),
                                                     outstanding, enquiry funnel
```

Money math lives in `src/modules/fees/fees.logic.js` (pure, unit-tested — `npm run test:fees`,
13/13). Invoice status transitions Due → Partial → Paid; overpayment clamps to the balance.
Fees writes require the `write:invoices` permission (Principal, School Admin, Accountant).
Dashboard aggregates use `find` + reduce so tenant scoping still applies.

## Phase A — SaaS / Reseller foundation

**Multi-audience auth** — every user has an `audience`; login is per-audience so the tiers never cross:

```
POST /api/auth/platform/login    # Master Admin (HackGeniX)
POST /api/auth/reseller/login    # white-label distributor
POST /api/auth/school/login      # principal / admin / teacher (the ERP)
POST /api/auth/parent/login      # parent app
POST /api/auth/student/login     # student app
POST /api/auth/login             # back-compat → school
```

The JWT carries `{ audience, role, resellerId, schoolId, branchId, planKey }`. `requireAudience()`
and `requireRole()` guard each tier; plan/scope in the token means feature-gating is a hash
lookup (no DB hit).

**Provisioning**

```
# Platform (Super Admin)
GET/POST /api/platform/resellers            PATCH /api/platform/resellers/:id
GET/POST /api/platform/schools              GET /api/platform/summary   GET /api/platform/plans
# Reseller (scoped to its own resellerId)
GET /api/reseller/summary
GET/POST /api/reseller/schools              PATCH /api/reseller/schools/:id
GET/POST /api/reseller/schools/:id/branches (branch count gated by plan.maxBranches)
POST /api/reseller/schools/:id/invite       (creates a school user + temp password)
```

**Plans & gating** — `src/config/plans.js` (Starter / Growth / Pro → features + `maxBranches`),
pure + unit-tested (`npm run test:plans`, 10/10). `requireFeature("worlds")` gates the Worlds
launch by plan. A reseller can only ever see/modify its own schools (cross-tenant → 404).

**Scale** — compound index `{ schoolId, createdAt }` on every resource; list endpoints are
`.lean()` + paginated (`?page=&limit=`) and return `{ data, meta:{ total, page, limit, pages } }`.

Seeded logins (all `demo1234`): `superadmin@juniorocto.com` (platform), `reseller@acme.edu`
(reseller), `principal@bluelagoon.edu` (school).
