import mongoose from "mongoose";
const s = new mongoose.Schema({
  resellerId: { type: String, index: true },
  code: String,
  title: String,
  discountType: { type: String, default: "percent", enum: ["percent", "flat"] },
  value: Number,
  status: { type: String, default: "active", enum: ["active", "expired"] },
  uses: { type: Number, default: 0 },
  maxUses: { type: Number, default: 0 },
  expiresAt: Date,
}, { timestamps: true });
s.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const Offer = mongoose.model("Offer", s);
