import mongoose from "mongoose";
const s = new mongoose.Schema({
  number: { type: String, index: true },
  model: String,                           // billing model key
  billToType: String,                      // customer | reseller
  billTo: { name: String, address: String, gstin: String, email: String },
  customerId: String, resellerId: String, licenseId: String,
  lineItems: [{ desc: String, qty: Number, rate: Number, amount: Number }],
  subtotal: Number, taxPct: Number, tax: Number, total: Number,
  status: { type: String, default: "draft", enum: ["draft", "sent", "paid", "overdue"] },
  issueDate: { type: Date, default: Date.now },
  dueDate: Date,
  paymentMethod: String, notes: String,
}, { timestamps: true });
s.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const PlatformInvoice = mongoose.model("PlatformInvoice", s);
