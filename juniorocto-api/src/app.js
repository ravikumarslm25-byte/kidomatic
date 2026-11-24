import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./core/errors.js";
import authRoutes from "./core/auth/auth.routes.js";
import worldsRoutes from "./worlds/worlds.routes.js";
import resourceRoutes from "./modules/resource.routes.js";
import portalRoutes from "./modules/portal/portal.routes.js";
import feesRoutes from "./modules/fees/fees.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import platformRoutes from "./modules/platform/platform.routes.js";
import resellerRoutes from "./modules/reseller/reseller.routes.js";
import publicRoutes from "./modules/public/public.routes.js";
import paymentsRoutes from "./modules/payments/payments.routes.js";
import brandingRoutes from "./modules/branding/branding.routes.js";
import academicYearRoutes from "./modules/academic-year/academic-year.routes.js";
import uploadsRoutes from "./modules/uploads/uploads.routes.js";
import { requireAuth, requireAudience } from "./core/auth/auth.middleware.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf.toString(); } }));
  app.use(morgan("dev"));

  app.get("/api/health", (req, res) => res.json({ ok: true, service: "juniorocto-api" }));
  app.use("/api/auth", authRoutes);          // login public, /me protected
  app.use("/api/public", publicRoutes);      // referral self-serve signup (no auth)
  app.use("/api/payments", paymentsRoutes);  // gateway webhook (no auth, signed)
  app.use("/api/branding", brandingRoutes);  // white-label theme for logged-in school
  app.use("/api/years", requireAuth, academicYearRoutes);  // multi-year setup + promotion/rollover
  // School data is for school accounts (staff, parents, students) only. Platform and
  // reseller accounts have their own /api/platform and /api/reseller areas — and no
  // school of their own, so letting them through here exposed every school's records.
  const schoolPeople = requireAudience("school", "parent", "student");
  app.use("/api/uploads", requireAuth, schoolPeople, uploadsRoutes);  // S3 presigned upload/view
  app.use("/api/worlds", worldsRoutes);      // results = launch-token auth
  app.use("/api/fees", requireAuth, requireAudience("school"), feesRoutes);        // invoicing, payments, receipts (staff)
  app.use("/api/dashboard", requireAuth, requireAudience("school"), dashboardRoutes);
  app.use("/api/portal", requireAuth, portalRoutes); // parent/student portal: children + guardian provisioning // real aggregates
  app.use("/api/platform", requireAuth, platformRoutes);   // Super Admin provisioning
  app.use("/api/reseller", requireAuth, resellerRoutes);   // reseller provisioning
  app.use("/api", requireAuth, schoolPeople, resourceRoutes); // all /:resource CRUD, JWT + tenant scoped

  app.use((req, res) => res.status(404).json({ error: "Not found" }));
  app.use(errorHandler);
  return app;
}
