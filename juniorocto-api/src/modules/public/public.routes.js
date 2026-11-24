import { Router } from "express";
import { register, resolveRef, checkout, checkoutVerify, getBranding } from "./public.controller.js";
const r = Router();
r.post("/register", register);       // referral self-serve signup
r.get("/ref/:ref", resolveRef);      // validate a referral link
r.get("/branding/:tenant", getBranding);     // white-label theme by tenant slug
r.post("/checkout", checkout);        // self-serve: create licence+invoice+order
r.post("/checkout/verify", checkoutVerify);  // confirm payment → activate
export default r;
