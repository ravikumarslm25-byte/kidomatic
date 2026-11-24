import { Router } from "express";
import { requireAudience } from "../../core/auth/auth.middleware.js";
import * as app from "./app.controller.js";

// Parent-App BFF. Mounted under /api/portal/app (already behind requireAuth).
const r = Router();
r.use(requireAudience("parent", "student"));

r.get("/children", app.children);
r.get("/attendance", app.attendance);
r.get("/timetable", app.timetable);
r.get("/materials", app.materials);
r.get("/fees", app.fees);
r.get("/receipts", app.receipts);
r.get("/report", app.report);
r.get("/timeline", app.timeline);
r.post("/pay", app.pay);                 // manual record (dev/fallback)
r.post("/pay/order", app.payOrder);      // create Razorpay order
r.post("/pay/verify", app.payVerify);    // verify + record payment

export default r;
