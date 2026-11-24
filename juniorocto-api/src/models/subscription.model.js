import mongoose from "mongoose";
const s = new mongoose.Schema({
  resellerId: { type: String, index: true },
  schoolId: { type: String, index: true },
  schoolName: String,
  planKey: String,
  amount: Number,               // monthly price
  cycle: { type: String, default: "monthly" },
  status: { type: String, default: "active", enum: ["active", "trialing", "past_due", "cancelled"] },
  startedAt: { type: Date, default: Date.now },
  nextBillingAt: Date,
  referred: { type: Boolean, default: false },
}, { timestamps: true });
s.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const Subscription = mongoose.model("Subscription", s);
