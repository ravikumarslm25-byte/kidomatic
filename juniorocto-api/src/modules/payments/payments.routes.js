import { Router } from "express";
import { webhook } from "./payments.controller.js";
const r = Router();
r.post("/webhook", webhook);   // Razorpay server-to-server (raw body verified)
export default r;
