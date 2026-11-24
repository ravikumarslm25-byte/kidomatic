import mongoose from "mongoose";
const s = new mongoose.Schema({
  schoolId: { type: String, index: true },
  schoolName: String,
  resellerId: { type: String, default: null, index: true },
  model: { type: String, index: true },  // billing model key
  seats: Number,
  ratePerSeat: Number,
  amount: Number,                          // seats * rate (per cycle)
  cycle: { type: String, default: "monthly" },
  status: { type: String, default: "pending", enum: ["pending", "active", "suspended", "expired"] },
  activatedAt: Date,
  activationSource: String,                // gateway | reseller_payment | admin
  invoiceId: String,
}, { timestamps: true });
s.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const License = mongoose.model("License", s);
