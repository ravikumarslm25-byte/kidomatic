import mongoose from "mongoose";
const s = new mongoose.Schema({
  subject: String, customer: String,
  priority: { type: String, default: "Medium" }, // Low|Medium|High
  status: { type: String, default: "Open" },      // Open|Pending|Resolved|Closed
  assignee: String,
  messages: [{ by: String, text: String, at: String }],
  updatedAt: String,
}, { timestamps: true });
s.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const SupportTicket = mongoose.model("SupportTicket", s);
