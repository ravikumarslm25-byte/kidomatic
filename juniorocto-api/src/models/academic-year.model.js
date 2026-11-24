import mongoose from "mongoose";
// A school can hold 100+ of these. Exactly one isCurrent per school.
const s = new mongoose.Schema({
  schoolId: { type: String, index: true },
  name: { type: String, required: true },        // e.g. "2026–27"
  startDate: Date, endDate: Date,
  status: { type: String, default: "active", enum: ["upcoming", "active", "archived"] },
  isCurrent: { type: Boolean, default: false, index: true },
}, { timestamps: true });
s.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const AcademicYear = mongoose.model("AcademicYear", s);
