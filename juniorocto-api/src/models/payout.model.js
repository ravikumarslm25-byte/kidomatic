import mongoose from "mongoose";
const s = new mongoose.Schema({
  resellerId: { type: String, index: true },
  period: String,               // YYYY-MM
  gross: Number,
  commissionPct: Number,
  amount: Number,               // payout to reseller
  status: { type: String, default: "pending", enum: ["pending", "processing", "paid"] },
  paidAt: Date,
}, { timestamps: true });
s.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const Payout = mongoose.model("Payout", s);
