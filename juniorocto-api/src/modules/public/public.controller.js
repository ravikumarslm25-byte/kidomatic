import { Reseller } from "../../models/reseller.model.js";
import { School } from "../../models/school.model.js";
import { User } from "../../models/user.model.js";
import { Subscription } from "../../models/subscription.model.js";
import { PLANS } from "../../config/plans.js";
import { asyncHandler, AppError } from "../../core/errors.js";
import slugify from "../platform/slugify.js";
import { License } from "../../models/license.model.js";
import { PlatformInvoice } from "../../models/platform-invoice.model.js";
import { RATE_PER_SEAT } from "../../config/billing-models.js";
import { licenseAmount, withGst } from "../billing/license.logic.js";
import { createOrder, applyPaid } from "../payments/payments.controller.js";
import { verifyCheckoutSignature } from "../payments/helpers.js";
import { PAYMENTS, paymentsMode } from "../../config/payments.js";
import { resolveBranding } from "../branding/branding.logic.js";

// Public self-serve signup via a reseller's referral link (no auth).
// POST /api/public/register  { ref, schoolName, board, session, adminName, adminEmail, planKey }
export const register = asyncHandler(async (req, res) => {
  const { ref, schoolName, board, session, adminName, adminEmail, planKey = "starter" } = req.body || {};
  if (!ref) throw new AppError("Missing referral code", 400);
  if (!schoolName || !adminEmail) throw new AppError("School name and admin email are required", 400);

  const reseller = await Reseller.findOne({ $or: [{ referralCode: ref }, { slug: ref }] });
  if (!reseller) throw new AppError("Invalid referral link", 404);
  if (reseller.status !== "active") throw new AppError("This partner is not active", 403);

  const school = await School.create({
    name: schoolName, board, session, resellerId: reseller.id, planKey,
    slug: slugify(schoolName), status: "active",
  });
  const tempPassword = Math.random().toString(36).slice(2, 10);
  await User.create({
    name: adminName, email: String(adminEmail).toLowerCase(), audience: "school", role: "Principal",
    schoolId: school.id, resellerId: reseller.id, passwordHash: await User.hash(tempPassword),
  });
  const amount = PLANS[planKey]?.priceMonthly || 0;
  const subscription = await Subscription.create({
    resellerId: reseller.id, schoolId: school.id, schoolName, planKey, amount,
    status: "trialing", referred: true, nextBillingAt: new Date(Date.now() + 14 * 864e5),
  });

  res.status(201).json({ data: { school: school.toJSON(), attributedTo: reseller.name, subscription: subscription.toJSON(), adminEmail, tempPassword } });
});

export const resolveRef = asyncHandler(async (req, res) => {
  const reseller = await Reseller.findOne({ $or: [{ referralCode: req.params.ref }, { slug: req.params.ref }] });
  res.json({ data: reseller ? { partner: reseller.name, valid: reseller.status === "active" } : { valid: false } });
});

// ── Self-serve checkout (direct website / referral) ──
export const checkout = asyncHandler(async (req, res) => {
  const { ref, schoolName, adminEmail, seats } = req.body || {};
  if (!schoolName || !adminEmail || !seats) throw new AppError("School, admin email and seats are required", 400);
  let reseller = null;
  if (ref) reseller = await Reseller.findOne({ $or: [{ referralCode: ref }, { slug: ref }] });
  const model = reseller && reseller.status === "active" ? "referral" : "direct_web";
  const amount = licenseAmount(seats, RATE_PER_SEAT);
  const g = withGst(amount);
  const license = await License.create({ schoolName, resellerId: reseller?.id || null, model, seats, ratePerSeat: RATE_PER_SEAT, amount, status: "pending" });
  const seq = (await PlatformInvoice.countDocuments()) + 1;
  const invoice = await PlatformInvoice.create({
    number: `JO-INV-${new Date().getFullYear().toString().slice(2)}-${String(seq).padStart(4, "0")}`,
    model, billToType: "customer", licenseId: license.id, resellerId: reseller?.id || null,
    billTo: { name: schoolName, email: adminEmail }, lineItems: [{ desc: `KidoMatic licence — ${seats} users @ ₹${RATE_PER_SEAT}/user/mo`, qty: seats, rate: RATE_PER_SEAT, amount }],
    subtotal: g.subtotal, taxPct: g.taxPct, tax: g.tax, total: g.total, status: "draft",
    paymentMethod: model === "referral" ? "Gateway (via partner)" : "Payment Gateway",
  });
  license.invoiceId = invoice.id; await license.save();
  const order = await createOrder({ amountPaise: g.total * 100, receipt: invoice.number, notes: { invoiceId: invoice.id, schoolName, seats: String(seats), model } });
  res.status(201).json({ data: { orderId: order.id, amountPaise: order.amount, currency: order.currency, keyId: PAYMENTS.keyId || "mock", mode: paymentsMode(), invoiceId: invoice.id, model, partner: reseller?.name || null } });
});

export const checkoutVerify = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, invoiceId, schoolName, adminName, adminEmail, ref } = req.body || {};
  if (!invoiceId) throw new AppError("Missing invoice reference", 400);
  const invoice = await PlatformInvoice.findById(invoiceId);
  if (!invoice) throw new AppError("Invoice not found", 404);
  const ok = paymentsMode() === "mock" ? signature === "mock_ok" : verifyCheckoutSignature({ orderId, paymentId, signature }, PAYMENTS.keySecret);
  if (!ok) throw new AppError("Payment verification failed", 400);

  let reseller = null;
  if (ref) reseller = await Reseller.findOne({ $or: [{ referralCode: ref }, { slug: ref }] });
  const name = schoolName || invoice.billTo?.name;
  const school = await School.create({ name, resellerId: reseller?.id || null, planKey: "pro", slug: slugify(name), status: "active" });
  const tempPassword = Math.random().toString(36).slice(2, 10);
  await User.create({ name: adminName, email: String(adminEmail || invoice.billTo?.email).toLowerCase(), audience: "school", role: "Principal", schoolId: school.id, resellerId: reseller?.id || null, passwordHash: await User.hash(tempPassword) });
  const lic = await License.findById(invoice.licenseId);
  if (lic) { lic.schoolId = school.id; await lic.save(); }
  const activated = await applyPaid(invoice);   // marks paid; activates direct_web automatically
  res.json({ data: { school: school.toJSON(), activated: activated?.status === "active", model: invoice.model, invoiceNumber: invoice.number, tempPassword } });
});

// Public white-label resolution by tenant slug (needed at the login screen, pre-auth).
export const getBranding = asyncHandler(async (req, res) => {
  const school = await School.findOne({ slug: req.params.tenant });
  let reseller = null;
  if (school?.resellerId) reseller = await Reseller.findById(school.resellerId);
  res.json({ data: resolveBranding(school?.toObject?.() || {}, reseller?.toObject?.() || {}) });
});
