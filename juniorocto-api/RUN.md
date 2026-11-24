# KidoMatic — Local bring-up (against Atlas + Razorpay)

> This must run on a machine that can reach Atlas & Razorpay (your Mac or a server).
> The build sandbox cannot — its network only allows package registries.

## 1. API
```bash
cd juniorocto-api
cp .env.example .env         # then edit .env with your real values
npm install
npm run preflight            # checks Mongo connection + keys, prints a checklist
npm run seed                 # loads demo tenants/users/plans (one time)
npm run dev                  # API on http://localhost:4000
```

**Atlas:** in the Atlas console → Network Access, add your machine's IP (or `0.0.0.0/0` for dev).
Append a database name to the URI: `...mongodb.net/juniorocto?retryWrites=true&w=majority`.

## 2. Front-ends (each in its own folder)
Set `VITE_USE_MOCK=false` and `VITE_API_URL=http://localhost:4000/api` in each `.env`, then:
```bash
npm install && npm run dev
```
| App | Port | Login |
|---|---|---|
| School ERP (`juniorocto-erp`) | 5173 | principal@bluelagoon.edu / demo1234 |
| Reseller portal (`juniorocto-reseller`) | 5174 | reseller@acme.edu / demo1234 |
| Public checkout (`juniorocto-web`) | 5175 | — (self-serve) |
| Platform admin (`juniorocto-platform`) | 5183 | superadmin@juniorocto.com / demo1234 |

## 3. Payments (Razorpay)
- With `RAZORPAY_KEY_ID/SECRET` set, `paymentsMode()` returns `test` and real orders are created.
- Webhook: in the Razorpay dashboard add `https://<your-public-url>/api/payments/webhook`,
  copy its signing secret into `RAZORPAY_WEBHOOK_SECRET`. Locally, expose it with
  `ngrok http 4000` and use the ngrok URL.

## Verify everything
```bash
npm test        # fees, plans, billing, licence, razorpay, branding, wiring
npm run test:e2e   # full end-to-end (needs the DB reachable)
```
