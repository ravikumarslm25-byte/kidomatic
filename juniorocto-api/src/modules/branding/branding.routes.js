import { Router } from "express";
import { requireAuth, requireAudience } from "../../core/auth/auth.middleware.js";
import { myBranding } from "./branding.controller.js";
const r = Router();
r.get("/", requireAuth, requireAudience("school", "parent", "student"), myBranding); // a school's own theme
export default r;
