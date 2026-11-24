import mongoose from "mongoose";
// A campus/branch within a school (chain support). Scoped by explicit schoolId.
const branchSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  resellerId: { type: String, default: null, index: true },
  name: { type: String, required: true },
  address: String,
  status: { type: String, default: "active", enum: ["active", "inactive"] },
}, { timestamps: true });
branchSchema.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const Branch = mongoose.model("Branch", branchSchema);
