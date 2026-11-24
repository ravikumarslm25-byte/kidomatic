# KidoMatic — School ERP (Frontend)

AI-powered white-label School ERP. This package is the **Single School ERP frontend** —
React + Vite + Tailwind, Clan-Owl glass design language re-skinned to KidoMatic, with a
clean MVC-layered architecture wired to plug straight into your Node/Express API.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

Login is in **demo mode** — any credentials work (mock data, in-memory CRUD).

## Wire your Express API

Everything already routes through a service layer. To go live, set:

```bash
# .env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:4000/api
```

The app then calls your Express endpoints with no code changes:

| Action            | Request                          |
|-------------------|----------------------------------|
| list              | `GET    /api/:resource?q=`        |
| create            | `POST   /api/:resource`           |
| update            | `PATCH  /api/:resource/:id`       |
| delete            | `DELETE /api/:resource/:id`       |
| login             | `POST   /api/auth/login`          |

Resources match the registry keys (`students`, `invoices`, `enquiries`, `staff`, …).
The JWT from login is auto-attached as `Authorization: Bearer …` and `_id` is normalised to `id`.

## Architecture (MVC-layered)

```
src/
  config/       app + module registry (schema source) + nav
  models/       normalisers (Model)
  services/     axios client, mock DB, resource + auth services
  controllers/  useResource hook (view-model / Controller)
  store/        auth · branding (white-label) · toast  (React Context)
  routes/       router + ProtectedRoute
  layouts/      AppLayout (shell) · AuthLayout
  components/   ui · layout (sidebar/topbar) · brand · charts
  views/        every screen (View), grouped by module
  lib/          format · cn · id
```

Add a module = one config block in `config/modules.js` + one line in `config/nav.js`.
The generic `ResourceView` renders the table, search, and create/edit/delete for it.

## White-label

`store/branding.jsx` injects CSS variables and is the single override point.
Drop a tenant's `{ colors, name, school }` into `localStorage.jo_branding` (or serve it
from your API on login) and the whole app — including the login screen — re-themes.

Powered by HackGeniX.
