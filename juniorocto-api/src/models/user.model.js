import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  audience: { type: String, default: "school", enum: ["platform", "reseller", "school", "parent", "student"], index: true },
  role: { type: String, default: "Class Teacher" }, // scoped role within audience
  studentId: { type: String, default: null },
  staffId: { type: String, default: null },
  studentName: { type: String, default: null }, // for parent/student links
  resellerId: { type: String, default: null },
  schoolId: { type: String, index: true },
  branchId: { type: String, default: null },
  status: { type: String, default: "active" },   // active | invited | disabled (platform team)
  lastActive: { type: String, default: null },
}, { timestamps: true });

userSchema.index({ email: 1, audience: 1, schoolId: 1 }, { unique: true });
userSchema.methods.checkPassword = function (pw) { return bcrypt.compare(pw, this.passwordHash); };
userSchema.statics.hash = (pw) => bcrypt.hash(pw, 10);
userSchema.set("toJSON", { transform: (_d, r) => { r.id = r._id; delete r._id; delete r.__v; delete r.passwordHash; return r; } });

export const User = mongoose.model("User", userSchema);
