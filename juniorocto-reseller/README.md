# KidoMatic — Reseller (Partner) Portal

The white-label workspace a distributor logs into to run its schools. Separate React app
with its **own login URL** (`/api/auth/reseller/login`), reusing the KidoMatic glass
design system, talking to the Phase A reseller provisioning API.

## Run

```bash
npm install
npm run dev        # http://localhost:5174  (mock mode — runs standalone)
```

Demo login: any credentials (mock). For the live API:

```bash
# .env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:4000/api
```

Then it authenticates at `POST /api/auth/reseller/login` and every call is scoped to the
reseller — a reseller only ever sees its own schools.

## What it does

- **Dashboard** — roll-up across the network (schools, active, students) + school list.
- **Schools** — onboard a school (name, board, session, plan) and manage each one.
- **School detail**
  - *Overview* — change plan, suspend/reactivate (blocks the school's logins).
  - *Branding* — white-label editor (name + primary/accent colours) with a **live preview**
    of the school's login; saving cascades the theme to that school's app.
  - *Branches* — add branches, **gated by the plan's `maxBranches`** (Starter = 1 → 402).
  - *Team* — invite a principal/admin/teacher; returns a temporary password to share.
- **Settings** — partner profile, revenue share, plan catalogue.

## Talks to (Phase A API)

```
POST /api/auth/reseller/login
GET  /api/reseller/summary
GET/POST /api/reseller/schools          PATCH /api/reseller/schools/:id
GET/POST /api/reseller/schools/:id/branches
POST /api/reseller/schools/:id/invite
```

## Structure

```
src/
  config/     app · plans (display + limits)
  lib/        http (axios) · cn · format
  services/   auth.service · reseller.service  (mock + live, one flag)
  store/      auth · toast
  components/ ui (shared kit) · brand · layout (sidebar/topbar)
  views/      auth/Login · Dashboard · Schools · SchoolDetail · Settings
  layouts/    AppLayout · AuthLayout      routes/  router · ProtectedRoute
```

Powered by HackGeniX.

## Business portal (v2)

The reseller is a revenue-earning affiliate partner:
- **Dashboard** — MRR, earnings this month, pending payout, lifetime earnings + recent transactions.
- **Referrals** — a unique referral link; schools that sign up through it are attributed to the
  reseller (visible under "Schools from your link"). Backed by `POST /api/public/register?ref=`.
- **Billing** — Subscriptions · Transactions · Payouts tabs.
- **Offers** — create/share promo codes.
- **Reports** — monthly earnings trend + MRR by plan.

Endpoints: `/api/reseller/{revenue,subscriptions,transactions,payouts,referral,offers}`.
Master admin filters customers by reseller via `GET /api/platform/schools?resellerId=`.
