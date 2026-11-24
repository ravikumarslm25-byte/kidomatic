import { Router } from "express";
import { requireAudience } from "../../core/auth/auth.middleware.js";
import * as c from "./academic-year.controller.js";
const r = Router();
r.use(requireAudience("school", "platform"));   // staff/admin only — not parents/students
r.get("/", c.listYears);
r.get("/current", c.currentYear);
r.post("/", c.createYear);
r.post("/:id/set-current", c.setCurrent);
r.post("/rollover", c.rollover);
export default r;
