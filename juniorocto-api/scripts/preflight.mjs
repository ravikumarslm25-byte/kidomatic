// Preflight: verifies the environment is wired before you seed/start.
import dotenv from "dotenv"; dotenv.config();
import mongoose from "mongoose";

const ok = (m) => console.log("  \x1b[32m✓\x1b[0m " + m);
const warn = (m) => console.log("  \x1b[33m!\x1b[0m " + m);
const bad = (m) => console.log("  \x1b[31m✗\x1b[0m " + m);
let fail = false;

console.log("\nJunior Octo — preflight\n");

// Mongo
const uri = process.env.MONGO_URI;
if (!uri) { bad("MONGO_URI not set (did you name it MONGODB_URI by mistake?)"); fail = true; }
else {
  if (!/\/[a-zA-Z0-9_-]+(\?|$)/.test(uri.split(".net")[1] || "")) warn("No database name after the host — append e.g. /juniorocto");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    const cols = (await mongoose.connection.db.listCollections().toArray()).map((c) => c.name);
    ok(`MongoDB connected — ${cols.length} collection(s)${cols.length ? ": " + cols.join(", ") : " (empty — run npm run seed)"}`);
    await mongoose.disconnect();
  } catch (e) { bad("MongoDB connection failed: " + e.message.split("\n")[0]); warn("If Atlas: add this machine's IP under Network Access (or 0.0.0.0/0 for dev)."); fail = true; }
}

// JWT
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev-secret") warn("JWT_SECRET is default/unset — fine for dev, set a strong one for prod.");
else ok("JWT_SECRET set");

// Razorpay
const id = process.env.RAZORPAY_KEY_ID, sec = process.env.RAZORPAY_KEY_SECRET, wh = process.env.RAZORPAY_WEBHOOK_SECRET;
if (id && sec) {
  const mode = id.startsWith("rzp_live_") ? "LIVE" : id.startsWith("rzp_test_") ? "TEST" : "unknown";
  ok(`Razorpay keys present → payments run in ${mode} mode`);
  if (!wh) warn("RAZORPAY_WEBHOOK_SECRET not set — webhook activation won't verify until you add it.");
} else warn("Razorpay keys absent → payments run in MOCK mode (simulated).");

console.log("\n" + (fail ? "\x1b[31mPreflight failed — fix the ✗ items above.\x1b[0m" : "\x1b[32mPreflight OK.\x1b[0m") + "\n");
process.exit(fail ? 1 : 0);
