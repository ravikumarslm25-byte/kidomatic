import { Router } from "express";
import { summary } from "./dashboard.controller.js";
const r = Router();
r.get("/summary", summary);
export default r;
