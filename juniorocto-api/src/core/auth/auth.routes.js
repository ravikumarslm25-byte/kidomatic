import { Router } from "express";
import { login, me, changePassword, forgotPassword } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";
const r = Router();
r.post("/login", login);            // back-compat → school audience
r.post("/:audience/login", login);  // /platform /reseller /school /parent /student
r.get("/me", requireAuth, me);
r.post("/change-password", requireAuth, changePassword);
r.post("/forgot-password", forgotPassword);
export default r;
