import { Router } from "express";
import { generate, getInvoice, dues, pay } from "./fees.controller.js";
import { requirePermission } from "../../core/rbac/rbac.middleware.js";

const r = Router();
// Reuse the invoices/fees write permission (Principal, School Admin, Accountant).
const canWriteFees = (req, res, next) => { req.params.resource = "invoices"; requirePermission("write")(req, res, next); };

r.post("/invoices/generate", canWriteFees, generate);
r.get("/invoices/:id", getInvoice);
r.get("/dues", dues);
r.post("/invoices/:id/pay", canWriteFees, pay);
export default r;
