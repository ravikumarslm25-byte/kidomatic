import mongoose from "mongoose";
const s = new mongoose.Schema({
  name: String, org: String, email: String, phone: String, city: String,
  source: { type: String, default: "Website" }, owner: String,
  stage: { type: String, default: "New" }, // New|Contacted|Qualified|Proposal|Won|Lost
  value: Number, notes: String,
}, { timestamps: true });
s.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const Lead = mongoose.model("Lead", s);
