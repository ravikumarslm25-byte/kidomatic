import { Router } from "express";
import { issueLaunch, submitResult } from "./worlds.controller.js";
import { requireAuth } from "../core/auth/auth.middleware.js";
import { requireFeature } from "../core/plan/requireFeature.js";

const r = Router();
r.get("/launch/:worldId", requireAuth, requireFeature("worlds"), issueLaunch);  // ERP-side: staff issues a launch
r.post("/results", submitResult);                     // Worlds-side: token-authenticated
export default r;
