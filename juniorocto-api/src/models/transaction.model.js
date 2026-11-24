import mongoose from "mongoose";
const s = new mongoose.Schema({
  resellerId: { type: String, index: true },
  schoolId: String,
  schoolName: String,
  subscriptionId: String,
  txnRef: String,
  amount: Number,
  method: { type: String, default: "Online" },
  commission: Number,           // reseller's earning on this txn
  type: { type: String, default: "subscription" },
  status: { type: String, default: "success", enum: ["success", "failed", "pending"] },
  date: { type: Date, default: Date.now },
}, { timestamps: true });
s.index({ resellerId: 1, date: -1 });
s.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const Transaction = mongoose.model("Transaction", s);
