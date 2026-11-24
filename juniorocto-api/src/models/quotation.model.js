import mongoose from "mongoose";
const s = new mongoose.Schema({
  number: String, customer: String, plan: String, amount: Number,
  status: { type: String, default: "Draft" }, // Draft|Sent|Accepted|Rejected
  date: String, leadId: String, notes: String,
}, { timestamps: true });
s.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const Quotation = mongoose.model("Quotation", s);
