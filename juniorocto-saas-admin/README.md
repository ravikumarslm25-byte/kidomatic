# KidoMatic — Platform (Master Admin) Console

The HackGeniX control plane. Separate React app with its **own login URL**
(`/api/auth/platform/login`), reusing the KidoMatic glass design system, talking to the
Phase A platform provisioning API.

## Run

```bash
npm install
npm run dev        # http://localhost:5173  (mock mode — runs standalone)
```

Demo login (mock): any credentials. Live API:

```bash
# .env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:4000/api
```

Then it authenticates at `POST /api/auth/platform/login` (Super Admin) and sees the whole
platform (no tenant scoping).

## What it does

- **Dashboard** — platform KPIs (resellers, schools, active schools, students).
- **Resellers** — onboard partners, suspend/reactivate, see commission & platform share.
- **Customers** — every school on the platform, **filterable by reseller** (All / Direct /
  each reseller), showing which partner brought each school. Provision a school directly or
  attribute it to a reseller.
- **Plans** — the Starter / Growth / Pro catalogue.

## Talks to (Phase A API)

```
POST /api/auth/platform/login
GET  /api/platform/summary
GET/POST /api/platform/resellers     PATCH /api/platform/resellers/:id
GET/POST /api/platform/schools?resellerId=   ← the customer-by-reseller filter
GET  /api/platform/plans
```

Powered by HackGeniX.

## SaaS admin (v2)

The master admin runs the whole business:
- **Modules**: Dashboard, Reports, Leads, Quotations, Invoices, Transactions, Resellers,
  Customers, Support, Users, Plans, Settings, Profile.
- **Every list page** has search, dropdown filters, pagination and CSV export (shared
  `DataGrid` component).
- **Reports** — revenue trend, MRR by plan, lead funnel, customer mix, schools growth + KPIs.
- **Auth everywhere** — login, **forgot password**, and an attractive **Profile** page with a
  **change-password / security** section (backed by `POST /api/auth/change-password` &
  `/api/auth/forgot-password`).

Grouped nav (Sales · Network · Operations). Runs standalone in mock mode; business data
modules ship mock-functional with service methods ready to point at `/api/platform/*`.
