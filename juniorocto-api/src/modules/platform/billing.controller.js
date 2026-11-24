import { License } from "../../models/license.model.js";
import { PlatformInvoice } from "../../models/platform-invoice.model.js";
import { Reseller } from "../../models/reseller.model.js";
import { asyncHandler, AppError } from "../../core/errors.js";
import { BILLING_MODELS, isBillingModel, RATE_PER_SEAT } from "../../config/billing-models.js";
import { licenseAmount, withGst, invoiceRecipient, canActivate } from "../billing/license.logic.js";

const invNo = (seq) => `JO-INV-${new Date().getFullYear().toString().slice(2)}-${String(seq).padStart(4, "0")}`;

// POST /api/platform/sales — create a licence + its invoice for a chosen model.
export const createSale = asyncHandler(async (req, res) => {
  const { schoolId, schoolName, resellerId = null, model, seats, billTo = {} } = req.body || {};
  if (!isBillingModel(model)) throw new AppError("Unknown billing model", 400);
  if (!schoolName || !seats) throw new AppError("School and seats are required", 400);

  const amount = licenseAmount(seats, RATE_PER_SEAT);
  const g = withGst(amount);
  const recipientType = invoiceRecipient(model);
  let recipient = billTo;
  if (recipientType === "reseller" && resellerId) { const r = await Reseller.findById(resellerId); if (r) recipient = { name: r.name, email: r.contactEmail, gstin: billTo.gstin || "" }; }

  const license = await License.create({ schoolId, schoolName, resellerId, model, seats, ratePerSeat: RATE_PER_SEAT, amount, status: "pending" });
  const seq = (await PlatformInvoice.countDocuments()) + 1;
  const invoice = await PlatformInvoice.create({
    number: invNo(seq), model, billToType: recipientType, licenseId: license.id, customerId: schoolId, resellerId,
    billTo: { name: recipient.name || schoolName, address: recipient.address || "", gstin: recipient.gstin || "", email: recipient.email || "" },
    lineItems: [{ desc: `KidoMatic licence — ${seats} users @ ₹${RATE_PER_SEAT}/user/mo`, qty: seats, rate: RATE_PER_SEAT, amount }],
    subtotal: g.subtotal, taxPct: g.taxPct, tax: g.tax, total: g.total,
    status: "draft", dueDate: new Date(Date.now() + 7 * 864e5), paymentMethod: BILLING_MODELS[model].payment,
  });
  license.invoiceId = invoice.id; await license.save();
  res.status(201).json({ data: { license, invoice } });
});

export const listLicenses = asyncHandler(async (req, res) => {
  const filter = req.query.model ? { model: req.query.model } : {};
  res.json({ data: await License.find(filter).sort({ createdAt: -1 }).lean() });
});
export const activateLicense = asyncHandler(async (req, res) => {
  const lic = await License.findById(req.params.id);
  if (!lic) throw new AppError("Licence not found", 404);
  lic.status = "active"; lic.activatedAt = new Date(); lic.activationSource = "admin";
  await lic.save();
  res.json({ data: lic });
});
export const suspendLicense = asyncHandler(async (req, res) => {
  const lic = await License.findByIdAndUpdate(req.params.id, { status: "suspended" }, { new: true });
  if (!lic) throw new AppError("Licence not found", 404);
  res.json({ data: lic });
});

export const listInvoices = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json({ data: await PlatformInvoice.find(filter).sort({ createdAt: -1 }).lean() });
});
export const getInvoice = asyncHandler(async (req, res) => {
  const inv = await PlatformInvoice.findById(req.params.id).lean();
  if (!inv) throw new AppError("Invoice not found", 404);
  res.json({ data: inv });
});
export const sendInvoice = asyncHandler(async (req, res) => {
  const inv = await PlatformInvoice.findByIdAndUpdate(req.params.id, { status: "sent" }, { new: true });
  if (!inv) throw new AppError("Invoice not found", 404);
  res.json({ data: inv });  // real impl emails a PDF
});
// Mark paid → auto-activate the licence when the model allows.
export const payInvoice = asyncHandler(async (req, res) => {
  const inv = await PlatformInvoice.findById(req.params.id);
  if (!inv) throw new AppError("Invoice not found", 404);
  inv.status = "paid"; await inv.save();
  let license = null;
  if (inv.licenseId) {
    license = await License.findById(inv.licenseId);
    if (license) {
      const paidFlags = inv.model === "wholesale_reseller" ? { resellerPaid: true } : { gatewayPaid: true };
      if (canActivate(inv.model, paidFlags)) { license.status = "active"; license.activatedAt = new Date(); license.activationSource = inv.model === "wholesale_reseller" ? "reseller_payment" : "gateway"; await license.save(); }
    }
  }
  res.json({ data: { invoice: inv, license } });
});
