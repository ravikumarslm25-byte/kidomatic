import { PlatformInvoice } from "../../models/platform-invoice.model.js";
import { License } from "../../models/license.model.js";
import { asyncHandler, AppError } from "../../core/errors.js";
import { PAYMENTS, paymentsMode } from "../../config/payments.js";
import { verifyWebhookSignature, canActivateFromPaid } from "./helpers.js";

// Create a Razorpay order for an amount (paise). Mock when keys are absent.
export async function createOrder({ amountPaise, receipt, notes }) {
  if (paymentsMode() === "mock") {
    return { id: "order_mock_" + Math.random().toString(36).slice(2, 10), amount: amountPaise, currency: PAYMENTS.currency, mock: true };
  }
  const auth = Buffer.from(`${PAYMENTS.keyId}:${PAYMENTS.keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: PAYMENTS.currency, receipt, notes }),
  });
  if (!res.ok) throw new AppError("Gateway order failed", 502);
  return res.json();
}

// Apply a successful payment: mark invoice paid, activate licence per model.
async function applyPaid(invoice) {
  invoice.status = "paid"; await invoice.save();
  let license = null;
  if (invoice.licenseId) {
    license = await License.findById(invoice.licenseId);
    if (license && canActivateFromPaid(invoice.model)) {
      license.status = "active"; license.activatedAt = new Date();
      license.activationSource = invoice.model === "wholesale_reseller" ? "reseller_payment" : "gateway";
      await license.save();
    }
  }
  return license;
}

// Razorpay server-to-server webhook (raw body verified).
export const webhook = asyncHandler(async (req, res) => {
  const signature = req.get("x-razorpay-signature");
  const raw = req.rawBody || JSON.stringify(req.body || {});
  if (!verifyWebhookSignature(raw, signature, PAYMENTS.webhookSecret)) throw new AppError("Invalid webhook signature", 400);
  const event = req.body?.event;
  if (event === "payment.captured") {
    const invoiceId = req.body?.payload?.payment?.entity?.notes?.invoiceId;
    if (invoiceId) { const inv = await PlatformInvoice.findById(invoiceId); if (inv && inv.status !== "paid") await applyPaid(inv); }
  }
  res.json({ received: true });
});

export { applyPaid };
