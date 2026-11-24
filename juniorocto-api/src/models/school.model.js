import mongoose from "mongoose";
// A tenant (school client account). resellerId is null when sold directly by HackGeniX.
const schoolSchema = new mongoose.Schema({
  name: String, branch: String, board: String, session: String,
  resellerId: { type: String, default: null, index: true },
  slug: { type: String, index: true },
  planKey: { type: String, default: "starter" },
  status: { type: String, default: "active", enum: ["active", "suspended"] },
  academicModel: { type: String, default: "k12_preschool" },
  branding: { name: String, logoUrl: String, colors: { navy: String, blue: String, coral: String, sea: String, cream: String } },
}, { timestamps: true });
schoolSchema.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const School = mongoose.model("School", schoolSchema);
