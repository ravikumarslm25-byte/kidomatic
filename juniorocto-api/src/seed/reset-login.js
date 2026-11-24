import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { School } from "../models/school.model.js";
import { User } from "../models/user.model.js";

// Recover / reset a school login WITHOUT dropping any data.
// Usage:
//   npm run login:reset                         -> principal@bluelagoon.edu / demo1234
//   node src/seed/reset-login.js <email> <pass> -> custom
const email = String(process.env.LOGIN_EMAIL || process.argv[2] || "principal@bluelagoon.edu").toLowerCase();
const password = process.env.LOGIN_PASSWORD || process.argv[3] || "demo1234";
const role = process.env.LOGIN_ROLE || "Principal";

(async () => {
  await connectDb();

  const school = await School.findOne({ resellerId: null });
  if (!school) { console.log("✗ No tenant school found. Your database looks empty — restore a backup or run `npm run seed` (WARNING: that command WIPES all data)."); await mongoose.disconnect(); process.exit(1); }

  let user = await User.findOne({ email, audience: "school" });
  if (user) {
    user.passwordHash = await User.hash(password);
    if (!user.schoolId) user.schoolId = school.id;
    await user.save();
    console.log(`✓ Password reset for existing user: ${email}`);
  } else {
    user = await User.create({ name: role, email, audience: "school", role, schoolId: school.id, resellerId: null, passwordHash: await User.hash(password) });
    console.log(`✓ Created school login: ${email}`);
  }
  console.log(`  School : ${school.name}`);
  console.log(`  Login  : ${email} / ${password}`);
  console.log("  (existing data untouched)");

  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
