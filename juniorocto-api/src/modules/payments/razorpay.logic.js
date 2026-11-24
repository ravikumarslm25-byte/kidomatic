// ─── Pure payment math + signature verification (no network) ───────────────
import crypto from "crypto";
import { licenseAmount, withGst } from "../billing/license.logic.js";

export const toPaise = (rupees) => Math.round((Number(rupees) || 0) * 100);
export const hmac = (payload, secret) => crypto.createHmac("sha256", secret).update(payload).digest("hex");

export const verifySignature = (payload, signature, secret) => {
  if (!signature || !secret) return false;
  const expected = hmac(payload, secret);
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature))); } catch { return false; }
};
// Razorpay webhook: HMAC of the raw body with the webhook secret.
export const verifyWebhookSignature = (rawBody, signature, secret) => verifySignature(rawBody, signature, secret);
// Checkout callback: HMAC of `${order_id}|${payment_id}` with the key secret.
export const verifyCheckoutSignature = ({ orderId, paymentId, signature }, secret) => verifySignature(`${orderId}|${paymentId}`, signature, secret);

// Order total (paise) for a seat-based licence, incl. GST.
export const orderTotalPaise = (seats, rate, gstPct) => toPaise(withGst(licenseAmount(seats, rate)).total);
export const sign = hmac; // helper for tests
