import mongoose from "mongoose";
// Per-YEAR state of a student. The Student record is identity (permanent);
// this holds the class/section/roll/bus for ONE academic year → full history.
const s = new mongoose.Schema({
  schoolId: { type: String, index: true },
  academicYearId: { type: String, index: true },
  studentId: { type: String, index: true },
  klass: String, section: String, rollNo: String, house: String,
  routeId: { type: String, default: null }, stopId: { type: String, default: null },
  classId: { type: String, default: null },
  status: { type: String, default: "enrolled", enum: ["enrolled", "promoted", "retained", "graduated", "transferred"] },
}, { timestamps: true });
s.index({ schoolId: 1, academicYearId: 1, studentId: 1 }, { unique: true });
s.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; return r; } });
export const Enrollment = mongoose.model("Enrollment", s);
