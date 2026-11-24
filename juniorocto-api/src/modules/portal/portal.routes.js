import { Router } from "express";
import { provisionGuardian, myChildren, payInvoice, createTicket, replyTicket, resetGuardianPassword, linkChild } from "./portal.controller.js";
import { requireAudience } from "../../core/auth/auth.middleware.js";
import appRoutes from "./app.routes.js";
const r = Router();
r.use("/app", appRoutes);              // Parent mobile app BFF (app-shaped DTOs)
r.post("/guardians", requireAudience("school"), provisionGuardian);   // admin creates parent login + link
r.post("/guardians/reset", requireAudience("school"), resetGuardianPassword); // admin resets a parent password
r.get("/children", requireAudience("parent", "student"), myChildren); // portal resolves children
r.post("/link-child", requireAudience("parent"), linkChild);        // parent self-links another child
r.post("/pay", requireAudience("parent"), payInvoice);              // parent pays a due invoice
r.post("/tickets", requireAudience("parent", "student"), createTicket);     // raise support ticket
r.post("/tickets/:id/reply", requireAudience("parent", "student"), replyTicket);
export default r;
