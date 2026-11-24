import mongoose from "mongoose";
// A white-label distributor (micro-SaaS). Platform-managed; sits above schools.
const resellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  contactEmail: String,
  status: { type: String, default: "active", enum: ["active", "suspended"] },
  revenueSharePct: { type: Number, default: 20 },
  commissionPct: { type: Number, default: 25 },   // reseller earns this % of referred revenue
  referralCode: { type: String, index: true },
  plansAllowed: { type: [String], default: ["starter", "growth", "pro"] },
  branding: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
resellerSchema.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const Reseller = mongoose.model("Reseller", resellerSchema);
