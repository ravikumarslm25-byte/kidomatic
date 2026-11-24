// ─── Pure licensing + invoice math (no DB) ─────────────────────────────────
import { BILLING_MODELS, RATE_PER_SEAT, GST_PCT } from "../../config/billing-models.js";

export const licenseAmount = (seats, rate = RATE_PER_SEAT, months = 1) =>
  Math.max(0, Math.round((Number(seats) || 0) * rate * months));

export const withGst = (amount, pct = GST_PCT) => {
  const subtotal = Number(amount) || 0;
  const tax = Math.round((subtotal * pct) / 100);
  return { subtotal, taxPct: pct, tax, total: subtotal + tax };
};

export const invoiceRecipient = (model) => BILLING_MODELS[model]?.billTo || "customer";
export const earnsCommission = (model) => !!BILLING_MODELS[model]?.commission;

// Can the school's licence be activated yet, given what's happened?
export function canActivate(model, { gatewayPaid = false, resellerPaid = false, adminApproved = false } = {}) {
  switch (model) {
    case "direct_web": return gatewayPaid;
    case "wholesale_reseller": return resellerPaid;
    case "referral": return adminApproved;
    case "direct_sales": return adminApproved;
    default: return false;
  }
}
